<script lang="ts">
  import { document } from "../stores/document";
  import { settings } from "../stores/settings";
  import { themeMode, themeOptions, setTheme, type ThemeMode } from "../stores/theme";
  import { tocVisible, tocEntries, toggleToc, activeHeadingId } from "../stores/toc";
  import { folderWorkspace } from "../stores/folderWorkspace";
  import { messages, locale, availableLocales, setLocale } from "$lib/i18n";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onMount } from "svelte";
  import { openFileDialog } from "../tauri/files";
  import { copyAsRichText, copyAsMarkdown } from "../utils/clipboard";
  import ReaderControls from "./ReaderControls.svelte";
  import brandLogo from "$lib/assets/bearai-markdown-icon.png";

  let {
    onPaste = () => {},
    onOpen = () => {},
    onUrl = () => {},
    rawMode = false,
    onRawToggle = () => {},
    isEditing = false,
    dirty = false,
    canEdit = false,
    editMode = "view",
    onSetMode = (_m: "view" | "split" | "edit") => {},
    onSave = () => {},
    onOpenSettings = () => {},
    canPresent = false,
    presenting = false,
    onTogglePresent = () => {},
    onNew = () => {},
    onFind = () => {},
    onAbout = () => {},
    onQuit = () => {},
    onCloseActive = () => {},
    onCheckUpdates = () => {},
  }: {
    onPaste?: () => void;
    onOpen?: () => void;
    onUrl?: () => void;
    rawMode?: boolean;
    onRawToggle?: () => void;
    isEditing?: boolean;
    dirty?: boolean;
    canEdit?: boolean;
    editMode?: "view" | "split" | "edit";
    onSetMode?: (m: "view" | "split" | "edit") => void;
    onSave?: () => void;
    onOpenSettings?: () => void;
    canPresent?: boolean;
    presenting?: boolean;
    onTogglePresent?: () => void;
    onNew?: () => void;
    onFind?: () => void;
    onAbout?: () => void;
    onQuit?: () => void;
    onCloseActive?: () => void;
    onCheckUpdates?: () => void;
  } = $props();

  let currentHeading = $derived(
    $activeHeadingId && $tocEntries.length > 0
      ? $tocEntries.find((e) => e.id === $activeHeadingId)?.text ?? null
      : null
  );

  let showReaderControls = $state(false);
  let showCopyMenu = $state(false);
  let showAppMenu = $state(false);
  let showLanguageMenu = $state(false);
  let showThemeMenu = $state(false);
  let copyFeedback = $state("");
  let maximized = $state(false);
  let isMac = $state(false);

  onMount(() => {
    isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  });

  function closeAll() {
    showReaderControls = false;
    showCopyMenu = false;
    showAppMenu = false;
    showLanguageMenu = false;
    showThemeMenu = false;
  }

  function toggleAppMenu() {
    const next = !showAppMenu;
    closeAll();
    showAppMenu = next;
  }

  function toggleLanguageMenu() {
    const next = !showLanguageMenu;
    closeAll();
    showLanguageMenu = next;
  }

  async function toggleMaximize() {
    const win = getCurrentWindow();
    if (await win.isMaximized()) await win.unmaximize();
    else await win.maximize();
    maximized = await win.isMaximized();
  }

  async function toggleFullscreen() {
    const win = getCurrentWindow();
    await win.setFullscreen(!(await win.isFullscreen()));
    closeAll();
  }

  function toggleReaderControls() {
    const next = !showReaderControls;
    closeAll();
    showReaderControls = next;
  }

  function toggleCopyMenu() {
    const next = !showCopyMenu;
    closeAll();
    showCopyMenu = next;
  }

  function toggleThemeMenu() {
    const next = !showThemeMenu;
    closeAll();
    showThemeMenu = next;
  }

  function toggleWidthMode() {
    closeAll();
    settings.update((s) => ({
      ...s,
      widthMode: s.widthMode === "wide" ? "comfortable" : "wide",
    }));
  }

  async function handleExportPdf() {
    try {
      const { getCurrentWebview } = await import("@tauri-apps/api/webview");
      const webview = getCurrentWebview() as ReturnType<typeof getCurrentWebview> & {
        print: () => Promise<void>;
      };
      await webview.print();
    } catch {
      window.print();
    }
  }

  async function handleCopyRichText() {
    const article = globalThis.document?.querySelector("article.prose");
    if (!article || !$document.content) return;
    const success = await copyAsRichText(article.innerHTML, $document.content);
    copyFeedback = success ? $messages.copied : $messages.copyFailed;
    showCopyMenu = false;
    setTimeout(() => (copyFeedback = ""), 1500);
  }

  async function handleCopyMarkdown() {
    if (!$document.content) return;
    const success = await copyAsMarkdown($document.content);
    copyFeedback = success ? $messages.copied : $messages.copyFailed;
    showCopyMenu = false;
    setTimeout(() => (copyFeedback = ""), 1500);
  }

</script>

<header class="toolbar" role="presentation" data-tauri-drag-region ondblclick={(e) => {
  if ((e.target as HTMLElement).closest('button, input, .dropdown')) return;
  if (isMac) return;
  toggleMaximize();
}}>
  <div class="toolbar-left" class:mac-native-titlebar={isMac}>
    <img src={brandLogo} alt={$messages.appName} width="26" height="26" class="toolbar-logo" />
    <span class="toolbar-wordmark" data-tauri-drag-region>{$messages.appName}</span>
    <div class="menu-wrap">
      <button onclick={toggleAppMenu} class="btn app-menu-btn" class:active={showAppMenu} title={$messages.fileMenu} aria-label={$messages.fileMenu}>•••</button>
      {#if showAppMenu}
        <div class="dropdown app-menu-dropdown">
          <button class="dropdown-item" onclick={() => { closeAll(); onNew(); }}><span>{$messages.newDocument}</span><span class="dropdown-hint">Ctrl+N</span></button>
          <button class="dropdown-item" onclick={() => { closeAll(); onOpen(); }}><span>{$messages.open}</span><span class="dropdown-hint">Ctrl+O</span></button>
          <button class="dropdown-item" onclick={() => { closeAll(); onFind(); }}><span>{$messages.find}</span><span class="dropdown-hint">Ctrl+F</span></button>
          <button class="dropdown-item" disabled={!$document.filePath} onclick={() => { closeAll(); onCloseActive(); }}><span>{$messages.closeTab}</span><span class="dropdown-hint">Ctrl+W</span></button>
          <div class="dropdown-separator"></div>
          <button class="dropdown-item" onclick={toggleFullscreen}><span>{$messages.fullscreen}</span><span class="dropdown-hint">F11</span></button>
          <button class="dropdown-item" onclick={() => { closeAll(); onOpenSettings(); }}><span>{$messages.settings}</span><span class="dropdown-hint">Ctrl+,</span></button>
          <button class="dropdown-item" onclick={() => { closeAll(); onAbout(); }}><span>{$messages.about}</span></button>
          <button class="dropdown-item" onclick={() => { closeAll(); onCheckUpdates(); }}><span>{$messages.checkUpdates}</span></button>
          <div class="dropdown-separator"></div>
          <button class="dropdown-item danger" onclick={() => { closeAll(); onQuit(); }}><span>{$messages.quit}</span><span class="dropdown-hint">Ctrl+Q</span></button>
        </div>
      {/if}
    </div>
    <div class="btn-group">
      <button onclick={onOpen} class="btn btn-primary" title={$messages.openFileHint + ' (Cmd+O)'}>
        {$messages.open}
      </button>
      <button onclick={onPaste} class="btn btn-ghost" title={$messages.pasteMarkdownHint + ' (Cmd+Shift+V)'}>
        {$messages.paste}
      </button>
      <button onclick={onUrl} class="btn btn-ghost" title={$messages.openUrl}>
        <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="5.5"/><ellipse cx="7" cy="7" rx="2.5" ry="5.5"/><line x1="1.5" y1="7" x2="12.5" y2="7"/></svg>
      </button>
    </div>

    {#if $document.fileName && currentHeading}
      <span class="current-heading">{currentHeading}</span>
    {/if}
  </div>

  <!-- View / Split / Edit segmented control, centered in the toolbar. Split &
       Edit need an editable local file; when there isn't one they disable with
       an explaining tip. -->
  <div class="toolbar-center">
    <div
      class="mode-segmented"
      role="group"
      aria-label={$messages.viewMode}
      title={!$document.filePath
        ? $messages.viewModeOpenFirst
        : !canEdit
        ? $messages.viewModeLocalOnly
        : $messages.viewMode}
    >
      <button
        class="mode-seg"
        class:active={editMode === 'view'}
        onclick={() => onSetMode('view')}
        disabled={!$document.filePath}
      >{$messages.view}</button>
      <button
        class="mode-seg"
        class:active={editMode === 'split'}
        onclick={() => onSetMode('split')}
        disabled={!canEdit}
      >{$messages.split}</button>
      <button
        class="mode-seg"
        class:active={editMode === 'edit'}
        onclick={() => onSetMode('edit')}
        disabled={!canEdit}
      >{$messages.edit}</button>
    </div>
  </div>

  <div class="toolbar-right">
    <button
      onclick={() => folderWorkspace.toggleVisible()}
      class="btn btn-icon folder-panel-toggle"
      class:active={Boolean($folderWorkspace.rootPath) && $folderWorkspace.sidebarVisible}
      disabled={!$folderWorkspace.rootPath || isEditing}
      title={!$folderWorkspace.rootPath
        ? $messages.folderOpenFirst
        : isEditing
        ? $messages.folderExitEditFirst
        : $folderWorkspace.sidebarVisible
        ? $messages.hideFolder
        : $messages.showFolder}
      aria-label={$folderWorkspace.sidebarVisible ? $messages.hideFolder : $messages.showFolder}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1.75 4.25h4l1.25 1.5h7.25v6.5H1.75z" />
        <path d="M1.75 4.25V3h4.1l1.1 1.25" />
      </svg>
    </button>

    <button
      onclick={toggleToc}
      class="btn btn-icon"
      class:active={$tocVisible}
      disabled={!$document.renderedHtml || $tocEntries.length === 0 || isEditing}
      title={!$document.renderedHtml
        ? 'Table of Contents (open a file first)'
        : isEditing
        ? 'Table of Contents (exit edit mode to use)'
        : $tocEntries.length === 0
        ? 'Table of Contents (no headings in this document)'
        : $messages.toc}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="10" y2="8"/><line x1="2" y1="12" x2="12" y2="12"/></svg>
    </button>

    <button
      onclick={toggleReaderControls}
      class="btn btn-icon"
      class:active={showReaderControls}
      disabled={!$document.renderedHtml}
      title={$document.renderedHtml ? 'Reading preferences (Aa)' : 'Reading preferences (open a file first)'}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><text x="1" y="12" font-size="12" font-weight="700" stroke="none" fill="currentColor" font-family="-apple-system, BlinkMacSystemFont, sans-serif">Aa</text></svg>
    </button>

    <button
      onclick={toggleWidthMode}
      class="btn btn-icon"
      class:active={$settings.widthMode === "wide"}
      disabled={!$document.renderedHtml}
      title={!$document.renderedHtml
        ? 'Toggle wide view (open a file first)'
        : $settings.widthMode === "wide"
        ? 'Use comfortable width'
        : 'Use wide viewport'}
      aria-label={$settings.widthMode === "wide" ? 'Use comfortable width' : 'Use wide viewport'}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2.5 5.5V3.5h2" />
        <path d="M13.5 5.5V3.5h-2" />
        <path d="M2.5 10.5v2h2" />
        <path d="M13.5 10.5v2h-2" />
        <path d="M5.5 8h5" />
        <path d="M4 8l1.5-1.5" />
        <path d="M4 8l1.5 1.5" />
        <path d="M12 8l-1.5-1.5" />
        <path d="M12 8l-1.5 1.5" />
      </svg>
    </button>

    <button
      onclick={onRawToggle}
      class="btn btn-icon"
      class:active={rawMode}
      disabled={!$document.renderedHtml || isEditing}
      title={!$document.renderedHtml
        ? 'View raw markdown (open a file first)'
        : isEditing
        ? 'View raw markdown (exit edit mode to use)'
        : 'View raw markdown (Cmd+U)'}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6,5 2,8 6,11"/>
        <polyline points="10,5 14,8 10,11"/>
        <line x1="9" y1="3" x2="7" y2="13"/>
      </svg>
    </button>

    {#if canPresent}
      <button
        onclick={onTogglePresent}
        class="btn btn-icon"
        class:active={presenting}
        title={presenting ? 'Exit presentation (Esc)' : 'Present slideshow'}
        aria-label={presenting ? 'Exit presentation' : 'Present slideshow'}
      >
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1.5" y="2.5" width="13" height="9" rx="1"/>
          <line x1="6" y1="14" x2="10" y2="14"/>
          <line x1="8" y1="11.5" x2="8" y2="14"/>
        </svg>
      </button>
    {/if}

    <button
      onclick={onSave}
      class="btn btn-icon save-btn"
      class:dirty
      disabled={!dirty}
      title={dirty ? 'Save unsaved changes (Cmd+S)' : 'Save (no changes to save)'}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3h8l2 2v8H3z"/>
        <path d="M5 3v4h6V3"/>
        <rect x="5" y="9" width="6" height="4"/>
      </svg>
      {#if dirty}
        <span class="dirty-dot"></span>
      {/if}
    </button>

    <div class="relative">
      <button
        onclick={toggleCopyMenu}
        class="btn btn-icon"
        disabled={!$document.renderedHtml || isEditing}
        title={!$document.renderedHtml
          ? 'Copy content (open a file first)'
          : isEditing
          ? 'Copy content (exit edit mode to use)'
          : 'Copy content'}
      >
        {#if copyFeedback}
          <span style="font-size:11px">{copyFeedback}</span>
        {:else}
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M3 11V3h8"/></svg>
        {/if}
      </button>

      {#if showCopyMenu}
        <div class="dropdown">
          <button onclick={handleCopyRichText} class="dropdown-item">
            <span>{$messages.richText}</span>
            <span class="dropdown-hint">{$messages.richTextHint}</span>
          </button>
          <button onclick={handleCopyMarkdown} class="dropdown-item">
            <span>{$messages.markdownSource}</span>
            <span class="dropdown-hint">{$messages.rawSource}</span>
          </button>
        </div>
      {/if}
    </div>

    <button
      onclick={handleExportPdf}
      class="btn btn-icon"
      disabled={!$document.renderedHtml || isEditing}
      title={!$document.renderedHtml
        ? 'Export PDF (open a file first)'
        : isEditing
        ? 'Export PDF (exit edit mode to use)'
        : 'Export PDF'}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 2h6l3 3v9H4z"/>
        <path d="M10 2v3h3"/>
        <polyline points="6,9 8,11 10,9"/>
        <line x1="8" y1="7" x2="8" y2="11"/>
      </svg>
    </button>

    <div class="separator"></div>

    <button
      onclick={() => { closeAll(); onOpenSettings(); }}
      class="btn btn-icon"
      title={$messages.settings + ' (Ctrl+,)'}
      aria-label={$messages.settings}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>

    <div class="menu-wrap">
      <button onclick={toggleLanguageMenu} class="btn btn-icon" class:active={showLanguageMenu} title={$messages.language} aria-label={$messages.language}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M3.5 10h13M10 3c2 2.2 3 4.5 3 7s-1 4.8-3 7c-2-2.2-3-4.5-3-7s1-4.8 3-7z"/></svg>
      </button>
      {#if showLanguageMenu}
        <div class="dropdown language-dropdown">
          {#each $availableLocales as option}
            <button class="dropdown-item" class:active={$locale === option.code} onclick={() => { setLocale(option.code); closeAll(); }}>
              <span>{option.label}</span>{#if $locale === option.code}<span>✓</span>{/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="menu-wrap">
      <button onclick={toggleThemeMenu} class="btn btn-icon" class:active={showThemeMenu} title={$messages.theme} aria-label={$messages.theme}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.35a1.9 1.9 0 0 0 1.35-3.24 1.9 1.9 0 0 1 1.35-3.24H18A3 3 0 0 0 21 11.5 8.5 8.5 0 0 0 12 3Z"/><circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="10" cy="6.9" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="6.8" r="1" fill="currentColor" stroke="none"/><circle cx="17" cy="9.5" r="1" fill="currentColor" stroke="none"/></svg>
      </button>
      {#if showThemeMenu}
        <div class="dropdown theme-dropdown">
          {#each themeOptions as option}
            <button class="dropdown-item theme-menu-item" class:active={$themeMode === option.id} onclick={() => { setTheme(option.id as ThemeMode); closeAll(); }}>
              <span class="theme-menu-swatch" style:background={option.color}></span>
              <span>{option.id === 'system' ? $messages.followSystem : ($locale === 'zh-CN' ? option.name : option.nameEn)}</span>
              {#if $themeMode === option.id}<span class="theme-menu-check">✓</span>{/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    {#if !isMac}<div class="window-controls" role="group" aria-label={$messages.windowControls}>
      <button class="window-btn" onclick={() => getCurrentWindow().minimize()} title={$messages.minimize} aria-label={$messages.minimize}><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 8.5h8"/></svg></button>
      <button class="window-btn" onclick={toggleMaximize} title={maximized ? $messages.restore : $messages.maximize} aria-label={maximized ? $messages.restore : $messages.maximize}>
        {#if maximized}<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.75" y="3.25" width="7" height="7" rx=".4"/><path d="M3.25 3.25V1.75h7v7H9.25"/></svg>{:else}<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.75" y="1.75" width="8.5" height="8.5" rx=".45"/></svg>{/if}
      </button>
      <button class="window-btn window-close" onclick={() => getCurrentWindow().close()} title={$messages.close} aria-label={$messages.close}><svg viewBox="0 0 12 12" aria-hidden="true"><path d="m2.25 2.25 7.5 7.5m0-7.5-7.5 7.5"/></svg></button>
    </div>{/if}
  </div>
</header>

{#if showCopyMenu || showReaderControls || showAppMenu || showLanguageMenu || showThemeMenu}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-[9]" onclick={closeAll} onkeydown={() => {}}></div>
{/if}

<ReaderControls visible={showReaderControls} />

<style>
  .toolbar {
    position: relative;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: var(--app-chrome);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid #e5e5e5;
    user-select: none;
  }

  :global(html.dark) .toolbar {
    background: var(--app-chrome);
    border-bottom-color: #2c2c2e;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .toolbar-logo {
    flex-shrink: 0;
    border-radius: 6px;
    display: block;
  }

  .toolbar-wordmark {
    flex-shrink: 0;
    font-size: 17px;
    font-weight: 600;
    color: #1c1c1e;
    letter-spacing: -0.01em;
    margin-left: -3px;
  }

  :global(html.dark) .toolbar-wordmark {
    color: #e5e5e7;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .folder-panel-toggle { margin-left: 12px; position: relative; }
  .folder-panel-toggle::before { content: ""; position: absolute; left: -7px; top: 6px; bottom: 6px; width: 1px; background: var(--app-border); }

  /* macOS keeps the native traffic lights in the transparent overlay titlebar.
     The existing toolbar remains the first row; this inset only reserves the
     native control area, while TabBar stays untouched on the second row. */
  .toolbar-left.mac-native-titlebar { padding-left: 68px; }

  .menu-wrap { position: relative; }
  .app-menu-btn { padding: 4px 7px; border-radius: 6px; background: transparent; color: #636366; letter-spacing: 1px; }
  .app-menu-btn:hover, .app-menu-btn.active { background: #e5f5f8; color: #0891b2; }
  .app-menu-dropdown { left: 0; right: auto; width: 230px; }
  .language-dropdown { width: 150px; }
  .theme-dropdown { right: 0; width: 210px; max-height: min(430px, calc(100vh - 54px)); overflow-y: auto; }
  .theme-menu-item { justify-content: flex-start; gap: 9px; }
  .theme-menu-item > span:nth-child(2) { flex: 1; min-width: 0; }
  .theme-menu-swatch { width: 20px; height: 20px; border: 1px solid rgba(0,0,0,.14); border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.24); }
  .theme-menu-check { color: var(--app-accent); font-weight: 700; text-align: center; }
  .dropdown-separator { height: 1px; margin: 4px 6px; background: #e5e5ea; }
  :global(html.dark) .dropdown-separator { background: #3a3a3c; }
  .dropdown-item.danger { color: #c62828; }
  .dropdown-item.active { color: #0891b2; font-weight: 600; }

  .window-controls { display: flex; align-self: stretch; margin: -6px -12px -6px 6px; }
  .window-btn { width: 46px; min-height: 39px; border: 0; background: transparent; color: #3a3a3c; display: grid; place-items: center; }
  .window-btn svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1; shape-rendering: geometricPrecision; }
  .window-btn:hover { background: rgba(0,0,0,.08); }
  .window-close:hover { background: #c42b1c; color: white; }
  :global(html.dark) .window-btn { color: #e5e5e7; }
  :global(html.dark) .window-btn:hover { background: rgba(255,255,255,.1); }
  :global(html.dark) .window-close:hover { background: #c42b1c; color: white; }

  /* Centered mode switcher: absolutely centered in the toolbar so it stays put
     regardless of the left/right group widths. Anchors to .toolbar (sticky). */
  .toolbar-center {
    position: static;
    transform: none;
    margin-left: auto;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .btn-group {
    display: flex;
    gap: 1px;
    background: #e5e5e5;
    border-radius: 7px;
    overflow: hidden;
  }

  :global(html.dark) .btn-group {
    background: #2c2c2e;
  }

  .btn {
    font-size: 12px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }

  .btn-primary {
    padding: 5px 14px;
    background: #0891B2;
    color: white;
    border-radius: 0;
  }

  .btn-primary:hover {
    background: #0E7490;
  }

  .btn-ghost {
    padding: 5px 14px;
    background: #f2f2f7;
    color: #3a3a3c;
  }

  :global(html.dark) .btn-ghost {
    background: #1c1c1e;
    color: #aeaeb2;
  }

  .btn-ghost:hover {
    background: #e5e5ea;
  }

  :global(html.dark) .btn-ghost:hover {
    background: #2c2c2e;
  }

  .btn-icon {
    padding: 5px 10px;
    background: transparent;
    color: #1c1c1e;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  :global(html.dark) .btn-icon {
    color: #e5e5e7;
  }

  .btn-icon:hover:not(:disabled):not(.active) {
    background: #f2f2f7;
    color: #000000;
  }

  :global(html.dark) .btn-icon:hover:not(:disabled):not(.active) {
    background: #2c2c2e;
    color: #ffffff;
  }

  .btn-icon.active:hover:not(:disabled) {
    background: #d4eef3;
  }

  :global(html.dark) .btn-icon.active:hover:not(:disabled) {
    background: #14304a;
  }

  .btn-icon:disabled {
    opacity: 0.22;
    cursor: not-allowed;
  }

  :global(html.dark) .btn-icon:disabled {
    opacity: 0.28;
  }

  .btn-icon.active {
    background: #E5F5F8;
    color: #0891B2;
  }

  :global(html.dark) .btn-icon.active {
    background: #0A1E2E;
    color: #22D3EE;
  }

  .current-heading {
    font-size: 11px;
    color: #aeaeb2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 200px;
  }

  .separator {
    width: 1px;
    height: 18px;
    background: #d1d1d6;
    margin: 0 4px;
  }

  :global(html.dark) .separator {
    background: #3a3a3c;
  }

  /* View / Split / Edit segmented control */
  .mode-segmented {
    display: inline-flex;
    align-items: stretch;
    height: 28px;
    padding: 2px;
    gap: 2px;
    background: #e8e8ed;
    border-radius: 7px;
  }

  :global(html.dark) .mode-segmented {
    background: #2c2c2e;
  }

  .mode-seg {
    border: none;
    background: transparent;
    color: #5f6368;
    font-size: 12px;
    font-weight: 500;
    padding: 0 10px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }

  .mode-seg:hover:not(:disabled):not(.active) {
    color: #1c1c1e;
  }

  :global(html.dark) .mode-seg:hover:not(:disabled):not(.active) {
    color: #e5e5e7;
  }

  .mode-seg.active {
    background: #ffffff;
    color: #0891b2;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  :global(html.dark) .mode-seg.active {
    background: #48484a;
    color: #22d3ee;
  }

  .mode-seg:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 4px);
    width: 200px;
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
    justify-content: space-between;
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

  :global(html.dark) .dropdown-item:hover {
    background: #3a3a3c;
  }

  .dropdown-hint {
    font-size: 11px;
    color: #aeaeb2;
  }

  .save-btn {
    position: relative;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .save-btn.dirty {
    color: #0891B2;
  }

  :global(html.dark) .save-btn.dirty {
    color: #22D3EE;
  }

  .dirty-dot {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0891B2;
  }

  :global(html.dark) .dirty-dot {
    background: #22D3EE;
  }

  @media print {
    .toolbar { display: none !important; }
  }

  @media (max-width: 1320px) {
    .current-heading { display: none; }
    .btn-icon { padding-left: 7px; padding-right: 7px; }
    .window-btn { width: 42px; }
  }

  @media (max-width: 1040px) {
    .toolbar-wordmark { display: none; }
    .btn-primary, .btn-ghost { padding-left: 10px; padding-right: 10px; }
    .mode-seg { padding-left: 7px; padding-right: 7px; }
  }
</style>
