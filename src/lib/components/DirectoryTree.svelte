<script lang="ts">
  import { tick, untrack } from "svelte";
  import { listDirectory, openWorkspaceFile, renameDirectoryEntry, revealInFileExplorer, type DirectoryEntry } from "$lib/tauri/folders";
  import { folderWorkspace } from "$lib/stores/folderWorkspace";
  import { tabStore } from "$lib/stores/tabs";
  import { messages } from "$lib/i18n";

  let { root, refreshKey }: { root: string; refreshKey: number } = $props();
  let entriesByPath = $state<Record<string, DirectoryEntry[]>>({});
  let loadingPaths = $state<Set<string>>(new Set());
  let errors = $state<Record<string, string>>({});
  let loadedRoot = "";
  let loadedRefreshKey = -1;
  let clickTimer: ReturnType<typeof setTimeout> | undefined;
  let renamingPath = $state<string | null>(null);
  let renameValue = $state("");
  let renameInput = $state<HTMLInputElement>();
  let renameBusy = false;
  let contextEntry = $state<DirectoryEntry | null>(null);
  let contextPosition = $state({ x: 0, y: 0 });

  async function load(path: string, force = false) {
    if (!force && entriesByPath[path]) return;
    loadingPaths = new Set(loadingPaths).add(path);
    const nextErrors = { ...errors };
    delete nextErrors[path];
    errors = nextErrors;
    try {
      const entries = await listDirectory(root, path);
      entriesByPath = { ...entriesByPath, [path]: entries };
      const persistedChildren = entries.filter((entry) =>
        entry.kind === "folder" && $folderWorkspace.expandedPaths.includes(entry.path)
      );
      await Promise.all(persistedChildren.map((entry) => load(entry.path)));
    } catch (err) {
      errors = { ...errors, [path]: String(err) };
    } finally {
      const next = new Set(loadingPaths);
      next.delete(path);
      loadingPaths = next;
    }
  }

  async function toggle(entry: DirectoryEntry) {
    if (entry.kind === "file") {
      await openWorkspaceFile(root, entry.path);
      return;
    }
    const expanded = $folderWorkspace.expandedPaths.includes(entry.path);
    folderWorkspace.setExpanded(entry.path, !expanded);
    if (!expanded) await load(entry.path);
  }

  function handleClick(entry: DirectoryEntry) {
    if (renamingPath === entry.path) return;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(() => toggle(entry), 220);
  }

  async function startRename(entry: DirectoryEntry) {
    if (clickTimer) clearTimeout(clickTimer);
    contextEntry = null;
    renamingPath = entry.path;
    renameValue = entry.name;
    await tick();
    renameInput?.focus();
    renameInput?.select();
  }

  async function finishRename(entry: DirectoryEntry) {
    if (renameBusy || renamingPath !== entry.path) return;
    const name = renameValue;
    renamingPath = null;
    if (name === entry.name) return;
    renameBusy = true;
    try {
      const newPath = await renameDirectoryEntry(root, entry.path, name);
      tabStore.renamePaths(entry.path, newPath, entry.kind === "folder");
      folderWorkspace.renamePaths(entry.path, newPath);
      entriesByPath = {};
      await load(root, true);
    } catch (err) {
      errors = { ...errors, [entry.path]: `${$messages.renameFailed}: ${String(err)}` };
    } finally {
      renameBusy = false;
    }
  }

  function cancelRename() { renamingPath = null; }

  function openContextMenu(event: MouseEvent, entry: DirectoryEntry) {
    event.preventDefault();
    contextEntry = entry;
    contextPosition = {
      x: Math.min(event.clientX, window.innerWidth - 210),
      y: Math.min(event.clientY, window.innerHeight - 60),
    };
  }

  async function revealContextEntry() {
    const path = contextEntry?.path;
    contextEntry = null;
    if (path) await revealInFileExplorer(path);
  }

  $effect(() => {
    const currentRoot = root;
    const currentRefreshKey = refreshKey;
    if (loadedRoot === currentRoot && loadedRefreshKey === currentRefreshKey) return;
    loadedRoot = currentRoot;
    loadedRefreshKey = currentRefreshKey;
    untrack(() => {
      entriesByPath = {};
      errors = {};
      load(currentRoot, true);
    });
  });
</script>

{#snippet nodes(parent: string, depth: number)}
  {#if loadingPaths.has(parent)}
    <div class="tree-message" style:padding-left={`${12 + depth * 14}px`}>Loading…</div>
  {:else if errors[parent]}
    <button class="tree-message tree-error" style:padding-left={`${12 + depth * 14}px`} onclick={() => load(parent, true)}>Could not read folder · Retry</button>
  {:else if entriesByPath[parent]?.length === 0}
    <div class="tree-message" style:padding-left={`${12 + depth * 14}px`}>No Markdown files</div>
  {:else}
    {#each entriesByPath[parent] ?? [] as entry (entry.path)}
      {@const expanded = entry.kind === "folder" && $folderWorkspace.expandedPaths.includes(entry.path)}
      <button
        class="tree-row"
        class:selected={$folderWorkspace.selectedPath === entry.path}
        style:padding-left={`${8 + depth * 14}px`}
        title={entry.path}
        onclick={() => handleClick(entry)}
        ondblclick={() => startRename(entry)}
        oncontextmenu={(event) => openContextMenu(event, entry)}
      >
        <span class="chevron" class:expanded aria-hidden="true">
          {#if entry.kind === "folder"}
            <svg viewBox="0 0 16 16"><path d="M5.5 3.75 10 8l-4.5 4.25" /></svg>
          {/if}
        </span>
        <span class:folder-icon={entry.kind === "folder"} class:file-icon={entry.kind === "file"} aria-hidden="true">{entry.kind === "folder" ? "▰" : "▤"}</span>
        {#if renamingPath === entry.path}
          <input
            class="rename-input"
            bind:this={renameInput}
            bind:value={renameValue}
            onclick={(event) => event.stopPropagation()}
            ondblclick={(event) => event.stopPropagation()}
            onkeydown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") { event.preventDefault(); finishRename(entry); }
              if (event.key === "Escape") { event.preventDefault(); cancelRename(); }
            }}
            onblur={() => finishRename(entry)}
            aria-label={$messages.renameEntry}
          />
        {:else}
          <span class="entry-name">{entry.name}</span>
        {/if}
      </button>
      {#if expanded}
        {@render nodes(entry.path, depth + 1)}
      {/if}
    {/each}
  {/if}
{/snippet}

<nav class="directory-tree" aria-label="Markdown files">
  {@render nodes(root, 0)}
</nav>

{#if contextEntry}
  <div class="context-dismiss" onclick={() => (contextEntry = null)} role="presentation"></div>
  <div class="tree-context-menu" style:left={`${contextPosition.x}px`} style:top={`${contextPosition.y}px`}>
    <button onclick={revealContextEntry}>{$messages.revealInFileExplorer}</button>
  </div>
{/if}

<style>
  .directory-tree { flex: 1; overflow: auto; padding: 6px 0 18px; }
  .tree-row { width: 100%; min-height: 27px; display: flex; align-items: center; gap: 5px; padding-right: 8px; border: 0; background: transparent; color: #3a3a3c; text-align: left; cursor: default; font-size: 12px; }
  .tree-row:hover { background: #e9e9ed; }
  .tree-row.selected { background: #d9edf2; color: #075d70; }
  :global(html.dark) .tree-row { color: #d1d1d6; }
  :global(html.dark) .tree-row:hover { background: #29292d; }
  :global(html.dark) .tree-row.selected { background: #123944; color: #8ad8e8; }
  .chevron { width: 14px; height: 18px; flex: 0 0 14px; display: grid; place-items: center; color: #8e8e93; }
  .chevron svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; transition: transform .15s ease; transform-origin: center; }
  .chevron.expanded svg { transform: rotate(90deg); }
  .folder-icon { color: #c58b2a; font-size: 11px; }
  .file-icon { color: #7b7b82; font-size: 11px; }
  .entry-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rename-input { min-width: 0; flex: 1; height: 21px; padding: 0 4px; border: 1px solid #0891b2; border-radius: 3px; outline: none; background: #fff; color: inherit; font: inherit; }
  :global(html.dark) .rename-input { background: #252528; }
  .context-dismiss { position: fixed; inset: 0; z-index: 49; }
  .tree-context-menu { position: fixed; z-index: 50; width: 200px; padding: 4px; border: 1px solid #e5e5e5; border-radius: 8px; background: #fff; box-shadow: 0 4px 20px rgb(0 0 0 / 12%); }
  .tree-context-menu button { width: 100%; padding: 7px 10px; border: 0; border-radius: 5px; background: transparent; color: #1c1c1e; text-align: left; font-size: 12px; cursor: pointer; }
  .tree-context-menu button:hover { background: #f2f2f7; }
  :global(html.dark) .tree-context-menu { border-color: #3a3a3c; background: #2c2c2e; }
  :global(html.dark) .tree-context-menu button { color: #e5e5e7; }
  :global(html.dark) .tree-context-menu button:hover { background: #3a3a3c; }
  .tree-message { display: block; width: 100%; padding-top: 7px; padding-bottom: 7px; border: 0; background: transparent; color: #8e8e93; font-size: 11px; text-align: left; }
  .tree-error { color: #c62828; cursor: pointer; }
</style>
