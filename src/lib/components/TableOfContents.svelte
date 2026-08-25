<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import { tocEntries, activeHeadingId, tocVisible, setActiveHeading } from "$lib/stores/toc";
  import { settings } from "$lib/stores/settings";
  import { document as docStore } from "$lib/stores/document";
  import { loadTocState, saveTocState } from "$lib/stores/tocState";
  import { panelLayout } from "$lib/stores/panelLayout";
  import { messages } from "$lib/i18n";
  import { findTextMatches } from "$lib/utils/documentSearch";
  import { getContentScrollElement, getContentScrollTop, scrollContentTo } from "$lib/utils/contentScroll";

  let collapsed = $state<Set<string>>(new Set());
  let searchQuery = $state("");
  let searchResults = $state<Array<{ excerpt: string; range: Range }>>([]);
  let activeSearchIndex = $state(-1);
  let highlightStyle: HTMLStyleElement | undefined;

  onMount(() => {
    highlightStyle = document.createElement("style");
    highlightStyle.textContent = "::highlight(document-search-match){background:color-mix(in srgb,#f4c542 50%,transparent);color:inherit}::highlight(document-search-current){background:#ff9f1c;color:#1c1c1e;text-decoration:underline 2px solid #d96b00}";
    document.head.appendChild(highlightStyle);
  });

  function clearSearchHighlights() {
    const highlights = (globalThis.CSS as typeof CSS & { highlights?: Map<string, unknown> } | undefined)?.highlights;
    highlights?.delete("document-search-match");
    highlights?.delete("document-search-current");
  }

  function searchableTextNodes(root: HTMLElement): Text[] {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!node.textContent?.trim() || parent?.closest("script, style, .code-copy-btn")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    return nodes;
  }

  async function searchDocument() {
    await tick();
    clearSearchHighlights();
    activeSearchIndex = -1;
    searchResults = [];
    const query = searchQuery.trim();
    const root = document.querySelector<HTMLElement>(".content-main .md-content");
    if (!query || !root) return;

    const nodes = searchableTextNodes(root);
    const text = nodes.map((node) => node.data).join("");
    const matches = findTextMatches(text, query);
    const offsets: number[] = [];
    let total = 0;
    for (const node of nodes) {
      offsets.push(total);
      total += node.length;
    }
    const results: Array<{ excerpt: string; range: Range }> = [];
    for (const match of matches) {
      const startNodeIndex = offsets.findIndex((offset, index) => match.start >= offset && match.start < offset + nodes[index].length);
      const endNodeIndex = offsets.findIndex((offset, index) => match.end - 1 >= offset && match.end - 1 < offset + nodes[index].length);
      if (startNodeIndex < 0 || endNodeIndex < 0) continue;
      const range = document.createRange();
      range.setStart(nodes[startNodeIndex], match.start - offsets[startNodeIndex]);
      range.setEnd(nodes[endNodeIndex], match.end - offsets[endNodeIndex]);
      results.push({ excerpt: match.excerpt, range });
    }
    searchResults = results;
    const HighlightCtor = (globalThis as typeof globalThis & { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
    const highlights = (globalThis.CSS as typeof CSS & { highlights?: Map<string, unknown> } | undefined)?.highlights;
    if (HighlightCtor && highlights && results.length) highlights.set("document-search-match", new HighlightCtor(...results.map((result) => result.range)));
  }

  function goToSearchResult(index: number) {
    const result = searchResults[index];
    if (!result) return;
    activeSearchIndex = index;
    const HighlightCtor = (globalThis as typeof globalThis & { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
    const highlights = (globalThis.CSS as typeof CSS & { highlights?: Map<string, unknown> } | undefined)?.highlights;
    if (HighlightCtor && highlights) highlights.set("document-search-current", new HighlightCtor(result.range));
    const target = result.range.startContainer.parentElement;
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  onDestroy(() => {
    clearSearchHighlights();
    highlightStyle?.remove();
  });

  $effect(() => {
    $docStore.filePath;
    searchQuery = "";
    searchResults = [];
    activeSearchIndex = -1;
    clearSearchHighlights();
  });

  $effect(() => {
    $docStore.renderedHtml;
    if (searchQuery.trim()) searchDocument();
  });

  function hasChildren(index: number): boolean {
    return index + 1 < $tocEntries.length && $tocEntries[index + 1].level > $tocEntries[index].level;
  }

  function toggleCollapsed(id: string) {
    const next = new Set(collapsed);
    next.has(id) ? next.delete(id) : next.add(id);
    collapsed = next;
    if ($settings.rememberTocState && $docStore.filePath) saveTocState($docStore.filePath, next);
  }

  let visibleEntries = $derived.by(() => {
    const hiddenLevels: number[] = [];
    return $tocEntries.map((entry, index) => {
      while (hiddenLevels.length && entry.level <= hiddenLevels[hiddenLevels.length - 1]) hiddenLevels.pop();
      const hidden = hiddenLevels.length > 0;
      if (!hidden && collapsed.has(entry.id) && hasChildren(index)) hiddenLevels.push(entry.level);
      return { entry, index, hidden };
    }).filter((item) => !item.hidden);
  });

  $effect(() => {
    const entries = $tocEntries;
    const depth = $settings.tocDefaultDepth;
    const filePath = $docStore.filePath;
    const remembered = $settings.rememberTocState && filePath ? loadTocState(filePath) : null;
    collapsed = remembered
      ? new Set(remembered.filter((id) => entries.some((entry) => entry.id === id)))
      : new Set(entries.filter((entry, index) => entry.level >= depth && index + 1 < entries.length && entries[index + 1].level > entry.level).map((entry) => entry.id));
    if ($settings.rememberTocState && filePath && remembered === null) saveTocState(filePath, collapsed);
  });

  function scrollToHeading(id: string) {
    setActiveHeading(id);
    const el = document.getElementById(id);
    if (el) {
      const scroller = getContentScrollElement();
      if (!scroller) return;
      const y = getContentScrollTop() + el.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
      scrollContentTo({ top: y, behavior: "smooth" });
    }
  }

  function getIndent(level: number): string {
    return `${(level - 1) * 12}px`;
  }

  function startResize(event: PointerEvent) {
    event.preventDefault();
    const move = (next: PointerEvent) => panelLayout.setTocWidth(window.innerWidth - next.clientX);
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      document.body.classList.remove("resizing-panel");
    };
    document.body.classList.add("resizing-panel");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }
</script>

{#if $tocVisible && $docStore.filePath}
  <aside class="toc-sidebar">
    <div class="resize-handle" role="separator" aria-orientation="vertical" aria-label={$messages.tocPanelResize} onpointerdown={startResize}></div>
    <div class="toc-header">
      <span>{$messages.tocTitle}</span>
    </div>
    <div class="document-search">
      <div class="search-input-wrap">
        <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m12.5 12.5 4 4"/></svg>
        <input
          type="search"
          value={searchQuery}
          oninput={(event) => { searchQuery = event.currentTarget.value; searchDocument(); }}
          placeholder={$messages.tocSearchPlaceholder}
          aria-label={$messages.tocSearchPlaceholder}
        />
      </div>
      {#if searchQuery.trim()}
        {#if searchResults.length > 0}
          <div class="search-summary">{searchResults.length} {$messages.tocSearchResults}</div>
          <div class="search-results">
            {#each searchResults as result, index}
              <button
                class="search-result"
                class:current={activeSearchIndex === index}
                onclick={() => goToSearchResult(index)}
                aria-label={`${$messages.tocSearchResult} ${index + 1}`}
              >
                <span class="result-number">{index + 1}</span>
                <span>{result.excerpt}</span>
              </button>
            {/each}
          </div>
        {:else}
          <div class="search-empty">{$messages.tocSearchNoResults}</div>
        {/if}
      {/if}
    </div>
    <nav class="toc-nav">
      {#each visibleEntries as item (item.entry.id)}
        <div class="toc-row" class:active={$activeHeadingId === item.entry.id} style="padding-left: {getIndent(item.entry.level)}">
          {#if hasChildren(item.index)}
            <button class="toc-toggle" onclick={() => toggleCollapsed(item.entry.id)} aria-label={collapsed.has(item.entry.id) ? 'Expand' : 'Collapse'} aria-expanded={!collapsed.has(item.entry.id)}>
              <svg class:collapsed={collapsed.has(item.entry.id)} viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.75 10 8l-4.5 4.25" /></svg>
            </button>
          {:else}
            <span class="toc-toggle-spacer"></span>
          {/if}
          <button onclick={() => scrollToHeading(item.entry.id)} class="toc-item">{item.entry.text}</button>
        </div>
      {/each}
    </nav>
  </aside>
{/if}

<style>
  .toc-sidebar {
    position: fixed;
    right: 0;
    top: var(--app-chrome-height, 76px);
    bottom: 0;
    width: var(--toc-sidebar-width, 240px);
    background: var(--app-panel);
    border-left: 1px solid var(--app-border);
    color: var(--app-text);
    box-shadow: -2px 0 8px rgba(0,0,0,0.04);
    overflow-y: auto;
    z-index: 10;
  }
  .resize-handle { position: absolute; top: 0; left: -3px; bottom: 0; width: 7px; cursor: col-resize; touch-action: none; }
  .resize-handle::after { content: ""; position: absolute; top: 0; left: 3px; bottom: 0; width: 1px; background: transparent; transition: background .15s; }
  .resize-handle:hover::after { background: var(--app-accent); }
  :global(body.resizing-panel) { cursor: col-resize !important; user-select: none !important; }

  :global(html.dark) .toc-sidebar {
    background: var(--app-panel);
    border-left-color: var(--app-border);
    box-shadow: -2px 0 8px rgba(0,0,0,0.2);
  }

  .toc-header {
    padding: 12px 16px 8px;
    font-size: 11px;
    font-weight: 600;
    color: #aeaeb2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .toc-nav {
    padding: 0 8px 16px;
  }

  .toc-row {
    display: flex;
    align-items: center;
    min-width: 0;
    border-left: 2px solid transparent;
    border-radius: 0 4px 4px 0;
  }

  .document-search { padding: 0 8px 10px; border-bottom: 1px solid var(--app-border); margin-bottom: 8px; }
  .search-input-wrap { display: flex; align-items: center; gap: 7px; min-height: 34px; padding: 0 9px; border: 1px solid var(--app-border); border-radius: 8px; background: var(--app-chrome); }
  .search-input-wrap:focus-within { border-color: var(--app-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--app-accent) 16%, transparent); }
  .search-input-wrap svg { width: 15px; height: 15px; flex: 0 0 15px; fill: none; stroke: var(--app-muted); stroke-width: 1.7; stroke-linecap: round; }
  .search-input-wrap input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--app-text); font: inherit; font-size: 12px; }
  .search-input-wrap input::-webkit-search-cancel-button { cursor: pointer; }
  .search-summary, .search-empty { padding: 8px 4px 2px; color: var(--app-muted); font-size: 11px; }
  .search-results { max-height: min(42vh, 380px); overflow-y: auto; margin-top: 6px; display: grid; gap: 3px; }
  .search-result { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 6px; width: 100%; padding: 7px 6px; border: 0; border-radius: 6px; background: transparent; color: var(--app-text); text-align: left; font-size: 11px; line-height: 1.45; cursor: pointer; }
  .search-result:hover { background: var(--app-hover); }
  .search-result.current { background: var(--app-selection); box-shadow: inset 2px 0 var(--app-accent); }
  .result-number { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 5px; background: color-mix(in srgb, var(--app-accent) 13%, var(--app-panel)); color: var(--app-accent); font-size: 10px; font-weight: 700; }

  .toc-item {
    display: block;
    min-width: 0;
    flex: 1;
    text-align: left;
    padding: 4px 8px 4px 2px;
    font-size: 13px;
    color: #636366;
    background: none;
    border: none;
    border-radius: 0;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.15s, border-color 0.15s;
    line-height: 1.6;
  }

  :global(html.dark) .toc-item {
    color: #8e8e93;
  }

  .toc-item:hover {
    color: #1c1c1e;
  }

  :global(html.dark) .toc-item:hover {
    color: #e5e5e7;
  }

  .toc-row.active {
    color: #0891B2;
    border-left-color: #0891B2;
    border-left-width: 3px;
    font-weight: 500;
    background: rgba(8, 145, 178, 0.06);
    border-radius: 0 4px 4px 0;
  }

  :global(html.dark) .toc-row.active {
    color: #22D3EE;
    border-left-color: #22D3EE;
    background: rgba(34, 211, 238, 0.08);
  }

  .toc-row.active .toc-item { color: inherit; font-weight: 500; }
  .toc-toggle, .toc-toggle-spacer { width: 22px; height: 24px; flex: 0 0 22px; display: grid; place-items: center; }
  .toc-toggle { border: 0; padding: 0; background: transparent; color: #8e8e93; cursor: pointer; border-radius: 4px; }
  .toc-toggle:hover { background: rgba(8,145,178,.1); color: #0891b2; }
  .toc-toggle svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; transform: rotate(90deg); transition: transform .15s ease; transform-origin: center; }
  .toc-toggle svg.collapsed { transform: rotate(0deg); }

  @media print {
    .toc-sidebar { display: none !important; }
  }
</style>
