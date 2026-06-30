<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { searchQuery, searchActiveIndex, searchTotal } from "$lib/stores/search";
  import { findMatches, buildHighlightHtml } from "$lib/utils/text-search";

  let {
    value,
    onChange,
    fontSize = 14,
    lineHeight = 1.6,
    maxWidth = "720px",
  }: {
    value: string;
    onChange: (newValue: string) => void;
    fontSize?: number;
    lineHeight?: number;
    maxWidth?: string;
  } = $props();

  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let backdropEl: HTMLDivElement | undefined = $state();

  // Local mirror so cursor doesn't jump on parent state updates
  // svelte-ignore state_referenced_locally
  let localValue = $state(value);

  // Keep local in sync if parent value changes from a different source
  // (e.g. external file reload while not editing — though unlikely while editor is mounted)
  $effect(() => {
    if (value !== localValue && document.activeElement !== textareaEl) {
      localValue = value;
    }
  });

  // --- Find-in-editor highlight backdrop --------------------------------------
  // mark.js can't highlight a <textarea> (its contents aren't markable DOM text),
  // so the find overlay's edit-mode path mirrors the text into an aria-hidden
  // backdrop sitting exactly behind the transparent textarea and paints <mark>s
  // there. The textarea's opaque text renders on top of the (transparent)
  // backdrop text, so only the match backgrounds show through.
  const matches = $derived(findMatches(localValue, $searchQuery));
  const highlightHtml = $derived(
    $searchQuery ? buildHighlightHtml(localValue, matches, $searchActiveIndex) : ""
  );

  // Publish the match count so the overlay's "n/total" counter and its
  // Enter / prev / next navigation work while editing.
  $effect(() => {
    searchTotal.set($searchQuery ? matches.length : 0);
  });

  function syncBackdropScroll() {
    if (backdropEl && textareaEl) {
      backdropEl.scrollTop = textareaEl.scrollTop;
      backdropEl.scrollLeft = textareaEl.scrollLeft;
    }
  }

  // Scroll the active match into view whenever it changes (next/prev/new search).
  $effect(() => {
    const idx = $searchActiveIndex;
    if (!$searchQuery || matches.length === 0) return;
    // Defer until the backdrop has rendered the new active <mark>.
    requestAnimationFrame(() => {
      const ta = textareaEl;
      const mark = backdropEl?.querySelector<HTMLElement>(`mark[data-match-index="${idx}"]`);
      if (!ta || !mark) return;
      const target = mark.offsetTop - ta.clientHeight / 2;
      ta.scrollTop = Math.max(0, target);
      syncBackdropScroll();
    });
  });

  onMount(() => {
    tick().then(() => {
      try {
        textareaEl?.focus({ preventScroll: true });
      } catch {
        textareaEl?.focus();
      }
    });
  });

  onDestroy(() => {
    // Don't leave a stale match count behind when leaving edit mode.
    searchTotal.set(0);
  });

  function handleInput() {
    onChange(localValue);
    syncBackdropScroll();
  }

  function handleKeydown(e: KeyboardEvent) {
    // Tab inserts 2 spaces instead of moving focus
    if (e.key === "Tab" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      const t = e.target as HTMLTextAreaElement;
      const start = t.selectionStart;
      const end = t.selectionEnd;
      const indent = "  ";
      const newValue = t.value.slice(0, start) + indent + t.value.slice(end);
      localValue = newValue;
      onChange(newValue);
      // Restore cursor after the inserted indent
      tick().then(() => {
        t.selectionStart = t.selectionEnd = start + indent.length;
      });
    }
  }
</script>

<div class="editor-wrap">
  <div class="editor-stack" style="max-width: {maxWidth};">
    <!-- Highlight layer: mirrors the textarea text so search matches can be
         painted behind the transparent textarea. -->
    <div
      bind:this={backdropEl}
      class="editor-backdrop"
      aria-hidden="true"
      style="font-size: {fontSize}px; line-height: {lineHeight};"
    >{@html highlightHtml}</div>
    <textarea
      bind:this={textareaEl}
      bind:value={localValue}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onscroll={syncBackdropScroll}
      class="editor"
      style="font-size: {fontSize}px; line-height: {lineHeight};"
      spellcheck="false"
      autocomplete="off"
      autocapitalize="off"
    ></textarea>
  </div>
</div>

<style>
  .editor-wrap {
    /* Fixed positioning so the editor cannot contribute to window scroll height.
       Sits below the sticky toolbar (~37px) + tabbar (~38px) and fills the
       remaining viewport. This guarantees a single scrollbar (the textarea's). */
    position: fixed;
    top: 75px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    background: #fafafa;
    z-index: 1;
  }

  :global(html.dark) .editor-wrap {
    background: #161618;
  }

  .editor-stack {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
  }

  /* The textarea and the highlight backdrop MUST share identical text metrics
     and box sizing so their wrapped lines line up exactly. */
  .editor,
  .editor-backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 32px;
    border: none;
    font-family: "SF Mono", "JetBrains Mono", "Fira Code", Menlo, monospace;
    tab-size: 2;
    -moz-tab-size: 2;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    box-sizing: border-box;
    /* Both layers MUST reserve an identical scrollbar gutter, otherwise their
       lines wrap at different widths. The textarea is the scroll container, so
       when its vertical scrollbar appears it shrinks the text width by the
       scrollbar's size; the backdrop (no scrollbar) would keep the full width,
       so its lines wrap later and the highlights drift up by one row per
       differently-wrapped line, accumulating down the document. Forcing
       `overflow-y: scroll` on BOTH always reserves the same gutter (zero with
       macOS overlay scrollbars, ~15px with classic ones), keeping them in sync. */
    overflow-x: hidden;
    overflow-y: scroll;
  }

  .editor {
    background: transparent;
    outline: none;
    resize: none;
    color: #1c1c1e;
    z-index: 1;
  }

  :global(html.dark) .editor {
    color: #e5e5e7;
  }

  .editor::placeholder {
    color: #aeaeb2;
  }

  .editor-backdrop {
    color: transparent;
    pointer-events: none;
    user-select: none;
    z-index: 0;
  }

  /* In the backdrop only the <mark> backgrounds should be visible; the real,
     opaque textarea text sits on top, so keep the mark text transparent. */
  .editor-backdrop :global(mark.mdv-search-highlight) {
    color: transparent;
    background-color: #fde68a;
    border-radius: 2px;
  }

  :global(html.dark) .editor-backdrop :global(mark.mdv-search-highlight) {
    background-color: #854d0e;
  }

  .editor-backdrop :global(mark.mdv-search-active) {
    color: transparent !important;
    background-color: #f97316 !important;
  }

  :global(html.dark) .editor-backdrop :global(mark.mdv-search-active) {
    background-color: #ea580c !important;
  }
</style>
