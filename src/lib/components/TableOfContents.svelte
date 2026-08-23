<script lang="ts">
  import { tocEntries, activeHeadingId, tocVisible, setActiveHeading } from "$lib/stores/toc";
  import { settings } from "$lib/stores/settings";
  import { messages } from "$lib/i18n";

  let collapsed = $state<Set<string>>(new Set());

  function hasChildren(index: number): boolean {
    return index + 1 < $tocEntries.length && $tocEntries[index + 1].level > $tocEntries[index].level;
  }

  function toggleCollapsed(id: string) {
    const next = new Set(collapsed);
    next.has(id) ? next.delete(id) : next.add(id);
    collapsed = next;
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
    collapsed = new Set(entries.filter((entry, index) => entry.level >= depth && index + 1 < entries.length && entries[index + 1].level > entry.level).map((entry) => entry.id));
  });

  function scrollToHeading(id: string) {
    setActiveHeading(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 70;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  function getIndent(level: number): string {
    return `${(level - 1) * 12}px`;
  }
</script>

{#if $tocVisible && $tocEntries.length > 0}
  <aside class="toc-sidebar">
    <div class="toc-header">
      <span>{$messages.tocTitle}</span>
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
    width: 240px;
    background: #fafafa;
    border-left: 1px solid #e5e5e5;
    box-shadow: -2px 0 8px rgba(0,0,0,0.04);
    overflow-y: auto;
    z-index: 10;
  }

  :global(html.dark) .toc-sidebar {
    background: #1c1c1e;
    border-left-color: #2c2c2e;
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
