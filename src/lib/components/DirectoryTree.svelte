<script lang="ts">
  import { untrack } from "svelte";
  import { listDirectory, openWorkspaceFile, type DirectoryEntry } from "$lib/tauri/folders";
  import { folderWorkspace } from "$lib/stores/folderWorkspace";

  let { root, refreshKey }: { root: string; refreshKey: number } = $props();
  let entriesByPath = $state<Record<string, DirectoryEntry[]>>({});
  let loadingPaths = $state<Set<string>>(new Set());
  let errors = $state<Record<string, string>>({});
  let loadedRoot = "";
  let loadedRefreshKey = -1;

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
        onclick={() => toggle(entry)}
      >
        <span class="chevron">{entry.kind === "folder" ? (expanded ? "⌄" : "›") : ""}</span>
        <span class:folder-icon={entry.kind === "folder"} class:file-icon={entry.kind === "file"} aria-hidden="true">{entry.kind === "folder" ? "▰" : "▤"}</span>
        <span class="entry-name">{entry.name}</span>
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

<style>
  .directory-tree { flex: 1; overflow: auto; padding: 6px 0 18px; }
  .tree-row { width: 100%; min-height: 27px; display: flex; align-items: center; gap: 5px; padding-right: 8px; border: 0; background: transparent; color: #3a3a3c; text-align: left; cursor: default; font-size: 12px; }
  .tree-row:hover { background: #e9e9ed; }
  .tree-row.selected { background: #d9edf2; color: #075d70; }
  :global(html.dark) .tree-row { color: #d1d1d6; }
  :global(html.dark) .tree-row:hover { background: #29292d; }
  :global(html.dark) .tree-row.selected { background: #123944; color: #8ad8e8; }
  .chevron { width: 10px; flex: 0 0 10px; color: #8e8e93; font-size: 15px; text-align: center; }
  .folder-icon { color: #c58b2a; font-size: 11px; }
  .file-icon { color: #7b7b82; font-size: 11px; }
  .entry-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tree-message { display: block; width: 100%; padding-top: 7px; padding-bottom: 7px; border: 0; background: transparent; color: #8e8e93; font-size: 11px; text-align: left; }
  .tree-error { color: #c62828; cursor: pointer; }
</style>
