<script lang="ts">
  import { openFolder } from "$lib/tauri/folders";
  import { folderWorkspace } from "$lib/stores/folderWorkspace";
  import DirectoryTree from "./DirectoryTree.svelte";

  let refreshKey = $state(0);
  let error = $state("");

  async function chooseFolder() {
    error = "";
    try {
      await openFolder();
    } catch (err) {
      error = String(err);
    }
  }
</script>

{#if $folderWorkspace.rootPath && $folderWorkspace.sidebarVisible}
  <aside class="folder-sidebar" aria-label="Folder explorer">
    <header class="folder-header">
      <div class="folder-heading">
        <span class="folder-title" title={$folderWorkspace.rootPath}>{$folderWorkspace.rootPath.replace(/\\/g, "/").split("/").pop()}</span>
        <span class="folder-path">{$folderWorkspace.rootPath}</span>
      </div>
      <button class="icon-btn" onclick={() => refreshKey++} title="Refresh folder" aria-label="Refresh folder">↻</button>
      <button class="icon-btn" onclick={chooseFolder} title="Open another folder" aria-label="Open another folder">＋</button>
      <button class="icon-btn" onclick={() => folderWorkspace.close()} title="Close folder" aria-label="Close folder">×</button>
    </header>
    {#if error}<div class="sidebar-error">{error}</div>{/if}
    <DirectoryTree root={$folderWorkspace.rootPath} {refreshKey} />
  </aside>
{/if}

<style>
  .folder-sidebar {
    position: fixed;
    top: 75px;
    bottom: 0;
    left: 0;
    width: 280px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    background: #f5f5f7;
    border-right: 1px solid #d9d9de;
    box-shadow: 2px 0 8px rgb(0 0 0 / 4%);
  }
  :global(html.dark) .folder-sidebar { background: #1c1c1e; border-right-color: #343438; }
  .folder-header { display: flex; align-items: center; gap: 3px; min-height: 48px; padding: 6px 7px 6px 12px; border-bottom: 1px solid #dedee3; }
  :global(html.dark) .folder-header { border-bottom-color: #343438; }
  .folder-heading { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 1px; }
  .folder-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 650; color: #2c2c2e; }
  :global(html.dark) .folder-title { color: #e5e5e7; }
  .folder-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9px; color: #8e8e93; }
  .icon-btn { width: 25px; height: 25px; border: 0; border-radius: 5px; background: transparent; color: #636366; cursor: pointer; font-size: 16px; line-height: 1; }
  .icon-btn:hover { background: #e5e5ea; color: #1c1c1e; }
  :global(html.dark) .icon-btn:hover { background: #2c2c2e; color: #f2f2f7; }
  .sidebar-error { padding: 8px 12px; color: #c62828; font-size: 11px; border-bottom: 1px solid #f0caca; }
  @media (max-width: 720px) { .folder-sidebar { width: min(280px, 82vw); box-shadow: 4px 0 18px rgb(0 0 0 / 18%); } }
</style>
