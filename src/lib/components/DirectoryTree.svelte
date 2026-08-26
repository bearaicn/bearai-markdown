<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import { deleteDirectoryEntry, listDirectory, openWorkspaceFile, renameDirectoryEntry, revealInFileExplorer, type DirectoryEntry } from "$lib/tauri/folders";
  import { folderWorkspace } from "$lib/stores/folderWorkspace";
  import { tabStore } from "$lib/stores/tabs";
  import { messages } from "$lib/i18n";
  import { copyFileName, copyPath } from "$lib/utils/clipboard";
  import { workspaceAncestorDirectories, workspacePathEquals } from "$lib/utils/workspacePath";

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
  let treeElement = $state<HTMLElement>();
  let revealSequence = 0;

  onMount(() => {
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest(".tree-context-menu, .tree-row")) contextEntry = null;
    };
    const closeOnOtherContext = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".tree-row")) contextEntry = null;
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("contextmenu", closeOnOtherContext);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("contextmenu", closeOnOtherContext);
    };
  });

  async function load(path: string, force = false): Promise<boolean> {
    if (!force && entriesByPath[path]) return entriesByPath[path].length > 0;
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
      return entries.length > 0;
    } catch (err) {
      errors = { ...errors, [path]: String(err) };
      return false;
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
    if (expanded) {
      folderWorkspace.setExpanded(entry.path, false);
      return;
    }

    // Resolve children before expanding. Empty folders therefore remain stable
    // instead of briefly showing an indented loading row and then collapsing.
    const hasChildren = await load(entry.path);
    if (hasChildren || errors[entry.path]) folderWorkspace.setExpanded(entry.path, true);
  }

  function handleClick(entry: DirectoryEntry) {
    if (renamingPath === entry.path) return;
    if (clickTimer) clearTimeout(clickTimer);
    // Files have the same action for click and double-click, so there is no
    // reason to hold every activation for the folder rename gesture window.
    if (entry.kind === "file") {
      void toggle(entry);
      return;
    }
    clickTimer = setTimeout(() => toggle(entry), 220);
  }

  async function handleDoubleClick(entry: DirectoryEntry) {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = undefined;
    }
    if (entry.kind === "folder") {
      await startRename(entry);
    } else {
      await openWorkspaceFile(root, entry.path);
    }
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
      y: Math.min(event.clientY, window.innerHeight - 220),
    };
  }

  async function renameContextEntry() {
    const entry = contextEntry;
    if (entry) await startRename(entry);
  }

  async function revealContextEntry() {
    const path = contextEntry?.path;
    contextEntry = null;
    if (path) await revealInFileExplorer(path);
  }

  async function copyContextPath() {
    const path = contextEntry?.path;
    contextEntry = null;
    if (path) await copyPath(path);
  }

  async function copyContextName() {
    const path = contextEntry?.path;
    contextEntry = null;
    if (path) await copyFileName(path);
  }

  async function deleteContextEntry() {
    const entry = contextEntry;
    contextEntry = null;
    if (!entry) return;
    const { confirm } = await import("@tauri-apps/plugin-dialog");
    const accepted = await confirm(
      `${entry.kind === "folder" ? $messages.deleteFolderConfirm : $messages.deleteFileConfirm}\n\n${entry.name}`,
      {
        title: $messages.deleteEntryTitle,
        kind: "warning",
        okLabel: entry.kind === "folder" ? $messages.deleteFolder : $messages.deleteFile,
        cancelLabel: $messages.cancel,
      },
    );
    if (!accepted) return;
    try {
      await deleteDirectoryEntry(root, entry.path, entry.kind);
      tabStore.closePaths(entry.path, entry.kind === "folder");
      folderWorkspace.removePaths(entry.path, entry.kind === "folder");
      entriesByPath = {};
      errors = {};
      await load(root, true);
    } catch (err) {
      errors = { ...errors, [root]: `${$messages.deleteEntryFailed}: ${String(err)}` };
    }
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

  async function revealSelectedFile(path: string, sequence: number) {
    const ancestors = workspaceAncestorDirectories(root, path);
    if (ancestors === null) return;
    let parent = root;
    for (const directory of ancestors) {
      if (sequence !== revealSequence) return;
      await load(parent);
      const actualDirectory = entriesByPath[parent]?.find((entry) =>
        entry.kind === "folder" && workspacePathEquals(entry.path, directory)
      );
      if (!actualDirectory) return;
      folderWorkspace.setExpanded(actualDirectory.path, true);
      parent = actualDirectory.path;
    }
    await load(parent);
    await tick();
    if (sequence !== revealSequence) return;
    const row = Array.from(treeElement?.querySelectorAll<HTMLElement>(".tree-row") ?? [])
      .find((element) => workspacePathEquals(element.dataset.entryPath ?? "", path));
    row?.scrollIntoView({ block: "nearest" });
  }

  $effect(() => {
    const selectedPath = $folderWorkspace.selectedPath;
    const sequence = ++revealSequence;
    if (selectedPath) untrack(() => void revealSelectedFile(selectedPath, sequence));
  });
</script>

{#snippet nodes(parent: string, depth: number)}
  {#if loadingPaths.has(parent)}
    <div class="tree-message" style:padding-left={`${12 + depth * 14}px`}>{$messages.loading}</div>
  {:else if errors[parent]}
    <button class="tree-message tree-error" style:padding-left={`${12 + depth * 14}px`} onclick={() => load(parent, true)}>{$messages.retryFolder}</button>
  {:else if entriesByPath[parent]?.length}
    {#each entriesByPath[parent] ?? [] as entry (entry.path)}
      {@const expanded = entry.kind === "folder" && $folderWorkspace.expandedPaths.includes(entry.path)}
      <button
        class="tree-row"
        class:selected={$folderWorkspace.selectedPath !== null && workspacePathEquals($folderWorkspace.selectedPath, entry.path)}
        data-entry-path={entry.path}
        style:padding-left={`${13 + depth * 14}px`}
        title={entry.path}
        onclick={() => handleClick(entry)}
        ondblclick={() => handleDoubleClick(entry)}
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

<nav class="directory-tree" aria-label={$messages.markdownFiles} bind:this={treeElement}>
  {@render nodes(root, 0)}
</nav>

{#if contextEntry}
  <div class="tree-context-menu" style:left={`${contextPosition.x}px`} style:top={`${contextPosition.y}px`}>
    <button onclick={renameContextEntry}>{$messages.renameEntry}</button>
    <div class="tree-context-separator"></div>
    <button onclick={revealContextEntry}>{$messages.revealInFileExplorer}</button>
    <button onclick={copyContextPath}>{$messages.copyFilePath}</button>
    <button onclick={copyContextName}>{$messages.copyFileName}</button>
    <div class="tree-context-separator"></div>
    <button class="danger" onclick={deleteContextEntry}>{contextEntry.kind === "folder" ? $messages.deleteFolder : $messages.deleteFile}</button>
  </div>
{/if}

<style>
  .directory-tree { flex: 1; overflow: auto; padding: 6px 0 18px; }
  .tree-row { width: 100%; min-height: 28px; display: flex; align-items: center; gap: 5px; padding-right: 8px; border: 0; background: transparent; color: #3a3a3c; text-align: left; cursor: default; font-size: 13px; }
  .tree-row:hover { background: #e9e9ed; }
  .tree-row.selected { background: #d9edf2; color: #075d70; }
  :global(html.dark) .tree-row { color: #d1d1d6; }
  :global(html.dark) .tree-row:hover { background: #29292d; }
  :global(html.dark) .tree-row.selected { background: #123944; color: #8ad8e8; }
  .chevron { width: 14px; height: 18px; flex: 0 0 14px; display: grid; place-items: center; color: #8e8e93; }
  .chevron svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; transition: transform .15s ease; transform-origin: center; }
  .chevron.expanded svg { transform: rotate(90deg); }
  .folder-icon { color: #c58b2a; font-size: 12px; }
  .file-icon { color: #7b7b82; font-size: 12px; }
  .entry-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rename-input { min-width: 0; flex: 1; height: 21px; padding: 0 4px; border: 1px solid #0891b2; border-radius: 3px; outline: none; background: #fff; color: inherit; font: inherit; }
  :global(html.dark) .rename-input { background: #252528; }
  .tree-context-menu { position: fixed; z-index: 50; width: 200px; padding: 5px; border: 1px solid var(--app-border); border-radius: 9px; background: var(--app-chrome); box-shadow: 0 10px 30px rgb(0 0 0 / 18%); }
  .tree-context-menu button { width: 100%; padding: 7px 10px; border: 0; border-radius: 6px; background: transparent; color: var(--app-text); text-align: left; font-size: 12px; cursor: pointer; }
  .tree-context-menu button:hover { background: var(--app-hover); }
  .tree-context-menu button.danger { color: #c62828; }
  .tree-context-menu button.danger:hover { background: color-mix(in srgb, #c62828 12%, transparent); }
  .tree-context-separator { height: 1px; margin: 4px 6px; background: var(--app-border); }
  :global(html.dark) .tree-context-menu { border-color: #3a3a3c; background: #2c2c2e; }
  :global(html.dark) .tree-context-menu button { color: #e5e5e7; }
  :global(html.dark) .tree-context-menu button.danger { color: #ff6b6b; }
  :global(html.dark) .tree-context-menu button:hover { background: #3a3a3c; }
  .tree-message { display: block; width: 100%; padding-top: 7px; padding-bottom: 7px; border: 0; background: transparent; color: #8e8e93; font-size: 11px; text-align: left; }
  .tree-error { color: #c62828; cursor: pointer; }
</style>
