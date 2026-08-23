<script lang="ts">
  import { tabStore, HOME_TAB_ID, type Tab } from "$lib/stores/tabs";
  import { newDocument } from "$lib/tauri/files";
  import { copyPath } from "$lib/utils/clipboard";
  import { messages } from "$lib/i18n";
  import { onMount } from "svelte";

  let {
    onCloseTab = (id: string) => tabStore.closeTab(id),
    onCloseTabs = async (ids: string[]) => { for (const id of ids) tabStore.closeTab(id); return true; },
  }: {
    onCloseTab?: (id: string) => void | Promise<boolean>;
    onCloseTabs?: (ids: string[]) => Promise<boolean>;
  } = $props();

  const { tabs, activeTabId } = tabStore;
  let dragIndex = $state(-1);
  let overIndex = $state(-1);
  let contextMenuTab = $state<Tab | null>(null);
  let contextMenuPos = $state({ x: 0, y: 0 });
  let copyFeedback = $state("");
  let filesElement = $state<HTMLDivElement>();
  let tabsOverflow = $state(false);
  let overflowMenuOpen = $state(false);
  let overflowMenuPos = $state({ x: 0, y: 0 });

  function updateOverflow() {
    tabsOverflow = !!filesElement && filesElement.scrollWidth > filesElement.clientWidth + 1;
    if (!tabsOverflow) overflowMenuOpen = false;
  }

  onMount(() => {
    const observer = new ResizeObserver(updateOverflow);
    if (filesElement) observer.observe(filesElement);
    updateOverflow();
    return () => observer.disconnect();
  });

  $effect(() => {
    $tabs;
    requestAnimationFrame(updateOverflow);
  });

  function handleClose(e: MouseEvent, id: string) {
    e.stopPropagation();
    onCloseTab(id);
  }

  // Middle-click anywhere on a tab closes it, matching browsers/VS Code (#46).
  // Only clean tabs: a dirty tab needs the unsaved-changes dialog, and opening
  // that native modal from an auxclick handler wedges it in WKWebView (the modal
  // becomes unresponsive). So middle-click skips dirty tabs — the X button (a
  // plain click) still closes them with the prompt.
  function handleAuxClick(e: MouseEvent, id: string) {
    if (e.button !== 1) return;
    e.preventDefault();
    if ($tabs.find((t) => t.id === id)?.dirty) return;
    onCloseTab(id);
  }

  function handleMouseDown(e: MouseEvent, idx: number) {
    // Suppress the middle-button default (autoscroll) so the tab close on
    // auxclick fires cleanly on the first click (#46) — but don't close here;
    // closing on mousedown mis-fires as the row re-renders. Don't start a drag.
    if (e.button === 1) {
      e.preventDefault();
      return;
    }
    // Only the left button starts a drag.
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest(".tab-close") || (e.target as HTMLElement).closest(".dropdown")) return;
    e.preventDefault();
    dragIndex = idx;

    function handleMouseMove(ev: MouseEvent) {
      const tabbar = document.querySelector(".tabbar-files");
      if (!tabbar) return;
      const children = Array.from(tabbar.children) as HTMLElement[];
      for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        if (ev.clientX >= rect.left && ev.clientX < rect.right) {
          overIndex = i;
          break;
        }
      }
    }

    function handleMouseUp() {
      if (dragIndex >= 0 && overIndex >= 0 && dragIndex !== overIndex) {
        tabStore.reorderTabs(dragIndex, overIndex);
      }
      dragIndex = -1;
      overIndex = -1;
      (window as any).__mdhero_tab_dragging = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    (window as any).__mdhero_tab_dragging = true;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleNewTab() {
    newDocument();
  }

  // A tab backed by a real file has a canonical absolute path to copy; paste://,
  // url://, and not-yet-saved new:// tabs don't.
  function isFileTab(tab: Tab): boolean {
    return !!tab.filePath
      && !tab.filePath.startsWith("paste://")
      && !tab.filePath.startsWith("url://")
      && !tab.filePath.startsWith("new://");
  }

  function handleContextMenu(e: MouseEvent, tab: Tab) {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 160;
    contextMenuPos = { x: Math.min(rect.left, window.innerWidth - menuWidth - 8), y: rect.bottom + 4 };
    contextMenuTab = tab;
    overflowMenuOpen = false;
    copyFeedback = "";
  }

  function toggleOverflowMenu(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const menuWidth = 260;
    overflowMenuPos = { x: Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8)), y: rect.bottom + 4 };
    overflowMenuOpen = !overflowMenuOpen;
    contextMenuTab = null;
  }

  function selectOverflowTab(id: string) {
    tabStore.switchTab(id);
    overflowMenuOpen = false;
  }

  async function closeCurrentFromMenu() {
    const id = contextMenuTab?.id;
    closeContextMenu();
    if (id) await onCloseTab(id);
  }

  async function closeOtherFromMenu() {
    const keepId = contextMenuTab?.id;
    const ids = $tabs.filter((tab) => tab.id !== keepId).map((tab) => tab.id);
    closeContextMenu();
    await onCloseTabs(ids);
  }

  async function closeAllFromMenu() {
    const ids = $tabs.map((tab) => tab.id);
    closeContextMenu();
    await onCloseTabs(ids);
  }

  function closeContextMenu() {
    contextMenuTab = null;
    copyFeedback = "";
  }

  async function handleCopyPath() {
    if (!contextMenuTab) return;
    const success = await copyPath(contextMenuTab.filePath);
    copyFeedback = success ? "Copied!" : "Failed";
    setTimeout(closeContextMenu, 900);
  }
</script>

<div class="tabbar">
  <div class="tabbar-inner">
    <!-- Home tab -->
    <div
      class="tab home-tab"
      class:active={$activeTabId === HOME_TAB_ID}
      onclick={() => tabStore.goHome()}
      role="button"
      tabindex="0"
      onkeydown={(e) => e.key === 'Enter' && tabStore.goHome()}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 6.5L7 2l5 4.5V12H9V9H5v3H2V6.5z"/>
      </svg>
    </div>

    <!-- File tabs -->
    <div class="tabbar-files" bind:this={filesElement}>
      {#each $tabs as tab, idx (tab.id)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          onmousedown={(e) => handleMouseDown(e, idx)}
          onauxclick={(e) => handleAuxClick(e, tab.id)}
          onclick={() => tabStore.switchTab(tab.id)}
          oncontextmenu={(e) => handleContextMenu(e, tab)}
          class="tab"
          class:active={$activeTabId === tab.id}
          class:drag-over={overIndex === idx && dragIndex !== idx && dragIndex >= 0}
        >
          <span class="tab-label">
            {#if tab.dirty}<span class="tab-dirty" title="Unsaved changes">•</span>{/if}{tab.fileName}
          </span>
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <span
            role="button"
            tabindex="-1"
            onclick={(e) => handleClose(e, tab.id)}
            onkeydown={() => {}}
            class="tab-close"
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="1.5" y1="1.5" x2="7.5" y2="7.5"/><line x1="7.5" y1="1.5" x2="1.5" y2="7.5"/></svg>
          </span>
        </div>
      {/each}
    </div>

    {#if tabsOverflow}
      <button class="more-tabs-btn" class:active={overflowMenuOpen} onclick={toggleOverflowMenu} title={$messages.moreTabs} aria-label={$messages.moreTabs} aria-expanded={overflowMenuOpen}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
      </button>
    {/if}

    <!-- New tab button -->
    <button class="new-tab-btn" onclick={handleNewTab} title={$messages.newTab}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <line x1="6" y1="2" x2="6" y2="10"/>
        <line x1="2" y1="6" x2="10" y2="6"/>
      </svg>
    </button>
  </div>
</div>

{#if contextMenuTab}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[9]" onclick={closeContextMenu} onkeydown={() => {}}></div>
  <div class="dropdown" style="left: {contextMenuPos.x}px; top: {contextMenuPos.y}px;">
    <button onclick={closeCurrentFromMenu} class="dropdown-item"><span>{$messages.closeCurrentTab}</span></button>
    <button onclick={closeOtherFromMenu} class="dropdown-item" disabled={$tabs.length <= 1}><span>{$messages.closeOtherTabs}</span></button>
    <button onclick={closeAllFromMenu} class="dropdown-item"><span>{$messages.closeAllTabs}</span></button>
    {#if isFileTab(contextMenuTab)}
      <div class="dropdown-separator"></div>
      <button onclick={handleCopyPath} class="dropdown-item"><span>{copyFeedback || $messages.copyPath}</span></button>
    {/if}
  </div>
{/if}

{#if overflowMenuOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[9]" onclick={() => (overflowMenuOpen = false)} onkeydown={() => {}}></div>
  <div class="dropdown overflow-dropdown" style="left: {overflowMenuPos.x}px; top: {overflowMenuPos.y}px;">
    {#each $tabs as tab (tab.id)}
      <button class="dropdown-item overflow-item" class:current={$activeTabId === tab.id} onclick={() => selectOverflowTab(tab.id)} title={tab.filePath}>
        <span class="overflow-check">{$activeTabId === tab.id ? "✓" : ""}</span>
        <span class="overflow-name">{#if tab.dirty}<span class="tab-dirty">•</span>{/if}{tab.fileName}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .tabbar {
    position: sticky;
    top: var(--toolbar-height, 39px);
    z-index: 15;
    background: #dee1e6;
    padding: 6px 8px 0;
    overflow: hidden;
  }

  :global(html.dark) .tabbar {
    background: #111113;
  }

  .tabbar::-webkit-scrollbar {
    height: 0;
  }

  .tabbar-inner {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    min-width: 0;
  }

  .tabbar-files {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .tabbar-files .tab { flex: 0 0 auto; }

  .tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    font-size: 12px;
    color: #5f6368;
    background: transparent;
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    white-space: nowrap;
    max-width: 200px;
    min-width: 80px;
    transition: background 0.12s, color 0.12s;
    position: relative;
    user-select: none;
  }

  .tab:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  :global(html.dark) .tab {
    color: #8e8e93;
  }

  :global(html.dark) .tab:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .tab.active {
    background: #fafafa;
    color: #1c1c1e;
    font-weight: 600;
    box-shadow: 0 -1px 3px rgba(0,0,0,0.06);
    border-bottom: 2px solid #0891B2;
  }

  :global(html.dark) .tab.active {
    background: #1e1e20;
    color: #e5e5e7;
    font-weight: 600;
    box-shadow: 0 -1px 3px rgba(0,0,0,0.2);
    border-bottom: 2px solid #22D3EE;
  }

  .tab.drag-over {
    border-left: 2px solid #0891B2;
  }

  :global(html.dark) .tab.drag-over {
    border-left-color: #22D3EE;
  }

  /* Home tab */
  .home-tab {
    min-width: auto;
    padding: 7px 10px;
    flex-shrink: 0;
  }

  .home-tab svg {
    flex-shrink: 0;
  }

  .tab-label {
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: left;
  }

  .tab-dirty {
    color: #0891B2;
    font-weight: 700;
    margin-right: 4px;
  }

  :global(html.dark) .tab-dirty {
    color: #22D3EE;
  }

  .tab-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: #999;
    opacity: 0;
    transition: opacity 0.12s, background 0.12s, color 0.12s;
    flex-shrink: 0;
  }

  .tab:hover .tab-close {
    opacity: 1;
  }

  .tab-close:hover {
    background: rgba(0, 0, 0, 0.08);
    color: #333;
  }

  :global(html.dark) .tab-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e5e5e7;
  }

  /* New tab button */
  .new-tab-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-left: 2px;
    margin-bottom: 2px;
    background: none;
    border: none;
    border-radius: 6px;
    color: #8e8e93;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
  }

  .more-tabs-btn { display: grid; place-items: center; flex: 0 0 28px; width: 28px; height: 28px; margin: 0 0 2px 2px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: #717177; cursor: pointer; }
  .more-tabs-btn:hover, .more-tabs-btn.active { background: rgba(255,255,255,.58); color: #0891b2; }
  .more-tabs-btn svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  :global(html.dark) .more-tabs-btn:hover, :global(html.dark) .more-tabs-btn.active { background: rgba(255,255,255,.08); color: #22d3ee; }

  .new-tab-btn:hover {
    background: rgba(255, 255, 255, 0.5);
    color: #0891B2;
  }

  :global(html.dark) .new-tab-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #22D3EE;
  }

  .dropdown {
    position: fixed;
    width: 160px;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06);
    z-index: 50;
    padding: 4px;
    overflow: hidden;
  }

  :global(html.dark) .dropdown {
    background: #2c2c2e;
    border-color: #3a3a3c;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 7px 10px;
    font-size: 12px;
    color: #1c1c1e;
    background: none;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-align: left;
  }

  :global(html.dark) .dropdown-item {
    color: #e5e5e7;
  }

  .dropdown-item:hover {
    background: #f2f2f7;
  }
  .dropdown-item:disabled { opacity: .42; cursor: default; }
  .dropdown-item:disabled:hover { background: transparent; }
  .dropdown-separator { height: 1px; margin: 4px 6px; background: #e5e5e5; }
  :global(html.dark) .dropdown-separator { background: #444448; }
  .overflow-dropdown { width: 260px; max-height: min(420px, calc(100vh - 100px)); overflow-y: auto; }
  .overflow-item { gap: 7px; }
  .overflow-item.current { color: #087d98; background: #eef9fb; }
  :global(html.dark) .overflow-item.current { color: #67d7e9; background: #17343a; }
  .overflow-check { width: 13px; flex: 0 0 13px; text-align: center; }
  .overflow-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  :global(html.dark) .dropdown-item:hover {
    background: #3a3a3c;
  }

  @media print {
    .tabbar { display: none !important; }
  }
</style>
