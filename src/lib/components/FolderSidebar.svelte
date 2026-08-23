<script lang="ts">
  import { openFolder, openWorkspaceFile, searchWorkspaceMarkdown, type WorkspaceSearchResult } from "$lib/tauri/folders";
  import { folderWorkspace } from "$lib/stores/folderWorkspace";
  import DirectoryTree from "./DirectoryTree.svelte";
  import { messages } from "$lib/i18n";

  let refreshKey = $state(0);
  let error = $state("");
  let searchQuery = $state("");
  let searchResults = $state<WorkspaceSearchResult[]>([]);
  let searching = $state(false);
  let searchError = $state("");
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let searchSequence = 0;

  function clearSearch() {
    searchQuery = "";
    searchResults = [];
    searchError = "";
    searching = false;
    searchSequence++;
    if (searchTimer) clearTimeout(searchTimer);
  }

  function queueSearch() {
    if (searchTimer) clearTimeout(searchTimer);
    const query = searchQuery.trim();
    const root = $folderWorkspace.rootPath;
    const sequence = ++searchSequence;
    searchError = "";
    if (!query || !root) {
      searchResults = [];
      searching = false;
      return;
    }
    searching = true;
    searchTimer = setTimeout(async () => {
      try {
        const results = await searchWorkspaceMarkdown(root, query);
        if (sequence === searchSequence) searchResults = results;
      } catch (err) {
        if (sequence === searchSequence) {
          searchResults = [];
          searchError = String(err);
        }
      } finally {
        if (sequence === searchSequence) searching = false;
      }
    }, 250);
  }

  async function openSearchResult(result: WorkspaceSearchResult) {
    const root = $folderWorkspace.rootPath;
    if (root) await openWorkspaceFile(root, result.path);
  }

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
      <button class="icon-btn" onclick={() => refreshKey++} title={$messages.refreshFolder} aria-label={$messages.refreshFolder}>↻</button>
      <button class="icon-btn" onclick={chooseFolder} title={$messages.openAnotherFolder} aria-label={$messages.openAnotherFolder}>＋</button>
      <button class="icon-btn" onclick={() => folderWorkspace.close()} title={$messages.closeFolder} aria-label={$messages.closeFolder}>×</button>
    </header>
    {#if error}<div class="sidebar-error">{error}</div>{/if}
    <div class="folder-search">
      <svg class="search-icon" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.25" /><path d="m10.25 10.25 3 3" /></svg>
      <input
        value={searchQuery}
        oninput={(event) => { searchQuery = event.currentTarget.value; queueSearch(); }}
        onkeydown={(event) => { if (event.key === "Escape") clearSearch(); }}
        placeholder={$messages.searchFolder}
        aria-label={$messages.searchFolder}
        spellcheck="false"
      />
      {#if searchQuery}
        <button class="clear-search" onclick={clearSearch} title={$messages.close} aria-label={$messages.close}>×</button>
      {/if}
    </div>
    {#if searchQuery.trim()}
      <section class="search-results" aria-live="polite">
        {#if searching}
          <div class="search-message">{$messages.searchingFolder}</div>
        {:else if searchError}
          <div class="search-message search-error" title={searchError}>{$messages.searchFailed}</div>
        {:else if searchResults.length === 0}
          <div class="search-message">{$messages.noSearchResults}</div>
        {:else}
          <div class="result-count">{searchResults.length} {$messages.searchResultCount}</div>
          {#each searchResults as result (result.path)}
            <button class="search-result" onclick={() => openSearchResult(result)} title={result.path}>
              <span class="result-path">{result.relativePath}</span>
              <span class="result-preview"><span class="result-line">{result.line}</span>{result.preview}</span>
            </button>
          {/each}
        {/if}
      </section>
    {:else}
      <DirectoryTree root={$folderWorkspace.rootPath} {refreshKey} />
    {/if}
  </aside>
{/if}

<style>
  .folder-sidebar {
    position: fixed;
    top: var(--app-chrome-height, 76px);
    bottom: 0;
    left: 0;
    width: 280px;
    z-index: 10;
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
  .folder-search { position: relative; flex: 0 0 auto; margin: 7px 8px 5px; }
  .folder-search input { box-sizing: border-box; width: 100%; height: 30px; padding: 0 29px 0 28px; border: 1px solid #d5d5da; border-radius: 6px; outline: none; background: #fff; color: #2c2c2e; font: inherit; font-size: 11px; }
  .folder-search input:focus { border-color: #0891b2; box-shadow: 0 0 0 2px rgb(8 145 178 / 12%); }
  .folder-search input::placeholder { color: #9b9ba1; }
  .search-icon { position: absolute; left: 9px; top: 8px; width: 14px; height: 14px; fill: none; stroke: #8e8e93; stroke-width: 1.5; stroke-linecap: round; pointer-events: none; }
  .clear-search { position: absolute; top: 3px; right: 3px; width: 24px; height: 24px; border: 0; border-radius: 4px; background: transparent; color: #8e8e93; font-size: 15px; cursor: pointer; }
  .clear-search:hover { background: #ededf0; color: #2c2c2e; }
  .search-results { flex: 1; min-height: 0; overflow-y: auto; padding: 0 0 14px; }
  .result-count { padding: 4px 12px 5px; color: #8e8e93; font-size: 10px; }
  .search-result { display: flex; width: 100%; flex-direction: column; gap: 2px; padding: 7px 11px; border: 0; background: transparent; text-align: left; cursor: pointer; }
  .search-result:hover { background: #e9e9ed; }
  .result-path { width: 100%; overflow: hidden; color: #2c2c2e; font-size: 11px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .result-preview { width: 100%; overflow: hidden; color: #707077; font-size: 10px; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
  .result-line { display: inline-block; min-width: 20px; margin-right: 5px; color: #0891b2; font-variant-numeric: tabular-nums; }
  .search-message { padding: 14px 12px; color: #8e8e93; font-size: 11px; text-align: center; }
  .search-error { color: #c62828; }
  :global(html.dark) .folder-search input { border-color: #3a3a3e; background: #252528; color: #f2f2f7; }
  :global(html.dark) .clear-search:hover, :global(html.dark) .search-result:hover { background: #29292d; }
  :global(html.dark) .result-path { color: #e5e5e7; }
  :global(html.dark) .result-preview { color: #a8a8ae; }
  @media (max-width: 720px) { .folder-sidebar { width: min(280px, 82vw); box-shadow: 4px 0 18px rgb(0 0 0 / 18%); } }
</style>
