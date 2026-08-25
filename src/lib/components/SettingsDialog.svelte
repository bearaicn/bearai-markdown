<script lang="ts">
  import { X } from "@lucide/svelte";
  import { settings } from "$lib/stores/settings";
  import AILookupSettings from "./AILookupSettings.svelte";
  import { messages, locale } from "$lib/i18n";
  import { themeMode, themeOptions, setTheme, type ThemeMode } from "$lib/stores/theme";

  let { visible = $bindable(false) }: { visible: boolean } = $props();
  let activeGroup = $state<"behavior" | "editor" | "toc" | "startup" | "appearance" | "ai">("behavior");

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) visible = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      visible = false;
    }
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="dialog-backdrop" onclick={handleBackdropClick} onkeydown={handleKeydown}>
    <div class="dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">{$messages.settings}</h2>
        <button onclick={() => (visible = false)} class="dialog-close" aria-label={$messages.closeDialog}>
          <X size={16} />
        </button>
      </div>

      <div class="dialog-body">
        <nav class="settings-nav" aria-label={$messages.settings}>
          <button class:active={activeGroup === "behavior"} onclick={() => (activeGroup = "behavior")}>{$messages.behavior}</button>
          <button class:active={activeGroup === "editor"} onclick={() => (activeGroup = "editor")}>{$messages.editor}</button>
          <button class:active={activeGroup === "toc"} onclick={() => (activeGroup = "toc")}>{$messages.tocSettings}</button>
          <button class:active={activeGroup === "startup"} onclick={() => (activeGroup = "startup")}>{$messages.startup}</button>
          <button class:active={activeGroup === "appearance"} onclick={() => (activeGroup = "appearance")}>{$messages.appearance}</button>
          <button class:active={activeGroup === "ai"} onclick={() => (activeGroup = "ai")}>{$messages.aiLookup}</button>
        </nav>
        <div class="settings-content">
        {#if activeGroup === "behavior"}
        <section class="settings-section">
          <h3 class="section-title">{$messages.behavior}</h3>

          <label class="setting-row">
            <div class="setting-text">
              <span class="setting-label">{$messages.closeOnEscape}</span>
              <span class="setting-hint">{$messages.escapeCloseHint}</span>
            </div>
            <input
              type="checkbox"
              checked={$settings.closeOnEscape}
              onchange={(e) => settings.update((s) => ({ ...s, closeOnEscape: e.currentTarget.checked }))}
              class="setting-switch"
            />
          </label>

          <label class="setting-row">
            <div class="setting-text">
              <span class="setting-label">{$messages.autoPresent}</span>
              <span class="setting-hint">{$messages.autoPresentHint}</span>
            </div>
            <input
              type="checkbox"
              checked={$settings.autoPresentMarp}
              onchange={(e) => settings.update((s) => ({ ...s, autoPresentMarp: e.currentTarget.checked }))}
              class="setting-switch"
            />
          </label>
        </section>

        {:else if activeGroup === "editor"}
        <section class="settings-section">
          <h3 class="section-title">{$messages.editor}</h3>

          <label class="setting-row">
            <div class="setting-text">
              <span class="setting-label">{$messages.lineNumbers}</span>
              <span class="setting-hint">{$messages.lineNumbersHint}</span>
            </div>
            <input
              type="checkbox"
              checked={$settings.showLineNumbers}
              onchange={(e) => settings.update((s) => ({ ...s, showLineNumbers: e.currentTarget.checked }))}
              class="setting-switch"
            />
          </label>
        </section>

        {:else if activeGroup === "toc"}
        <section class="settings-section">
          <h3 class="section-title">{$messages.tocSettings}</h3>
          <label class="setting-row">
            <div class="setting-text">
              <span class="setting-label">{$messages.tocDefaultDepth}</span>
              <span class="setting-hint">{$messages.tocDefaultDepthHint}</span>
            </div>
            <select class="setting-select" value={$settings.tocDefaultDepth} onchange={(e) => settings.update((s) => ({ ...s, tocDefaultDepth: Number(e.currentTarget.value) }))}>
              {#each [1, 2, 3, 4, 5] as depth}<option value={depth}>{depth}</option>{/each}
              <option value={6}>{$messages.depthAll}</option>
            </select>
          </label>
          <label class="setting-row">
            <div class="setting-text">
              <span class="setting-label">{$messages.rememberTocState}</span>
              <span class="setting-hint">{$messages.rememberTocStateHint}</span>
            </div>
            <input
              type="checkbox"
              checked={$settings.rememberTocState}
              onchange={(e) => settings.update((s) => ({ ...s, rememberTocState: e.currentTarget.checked }))}
              class="setting-switch"
            />
          </label>
        </section>

        {:else if activeGroup === "startup"}
        <section class="settings-section">
          <h3 class="section-title">{$messages.startup}</h3>
          <label class="setting-row">
            <div class="setting-text">
              <span class="setting-label">{$messages.rememberOpenDocuments}</span>
              <span class="setting-hint">{$messages.rememberOpenDocumentsHint}</span>
            </div>
            <input
              type="checkbox"
              checked={$settings.rememberOpenDocuments}
              onchange={(e) => settings.update((s) => ({ ...s, rememberOpenDocuments: e.currentTarget.checked }))}
              class="setting-switch"
            />
          </label>
        </section>

        {:else if activeGroup === "appearance"}
        <section class="settings-section">
          <h3 class="section-title">{$messages.appearance}</h3>
          <div class="theme-grid">
            {#each themeOptions as option}
              <button type="button" class="theme-option" class:active={$themeMode === option.id} onclick={() => setTheme(option.id as ThemeMode)} aria-pressed={$themeMode === option.id}>
                <span class="theme-swatch" style:background={option.color}></span>
                <span>{option.id === "system" ? $messages.followSystem : ($locale === "zh-CN" ? option.name : option.nameEn)}</span>
                <span class="theme-check">{$themeMode === option.id ? "✓" : ""}</span>
              </button>
            {/each}
          </div>
        </section>
        {:else}
        <section class="settings-section">
          <h3 class="section-title">{$messages.aiLookup}</h3>
          <p class="section-hint">{$messages.aiLookupHint}</p>
          <AILookupSettings />
        </section>
        {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  .dialog {
    width: min(780px, calc(100vw - 40px));
    height: min(680px, 78vh);
    background: var(--app-panel);
    color: var(--app-text);
    border: 1px solid var(--app-border);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .setting-select { min-width: 110px; padding: 6px 9px; border: 1px solid var(--app-border); border-radius: 7px; background: var(--app-panel); color: var(--app-text); }

  :global(html.dark) .dialog {
    background: #2c2c2e;
    border-color: #3a3a3c;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #f2f2f7;
  }

  :global(html.dark) .dialog-header {
    border-bottom-color: #3a3a3c;
  }

  .dialog-title {
    font-size: 15px;
    font-weight: 600;
    color: #1c1c1e;
    margin: 0;
  }

  :global(html.dark) .dialog-title {
    color: #e5e5e7;
  }

  .dialog-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    color: #aeaeb2;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.12s;
  }

  .dialog-close:hover {
    background: #f2f2f7;
    color: #636366;
  }

  :global(html.dark) .dialog-close:hover {
    background: #3a3a3c;
    color: #e5e5e7;
  }

  .dialog-body {
    display: grid;
    grid-template-columns: 156px minmax(0, 1fr);
    min-height: 0;
    flex: 1;
    overflow: hidden;
    overscroll-behavior: contain;
  }

  .settings-nav {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 12px 9px;
    background: var(--app-chrome);
    border-right: 1px solid var(--app-border);
  }

  .settings-nav button {
    height: 34px;
    padding: 0 11px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: var(--app-muted);
    font: inherit;
    font-size: 12.5px;
    text-align: left;
    cursor: pointer;
  }

  .settings-nav button:hover { background: var(--app-hover); color: var(--app-text); }
  .settings-nav button.active { background: var(--app-selection); color: var(--app-accent); font-weight: 600; }

  .settings-content {
    min-width: 0;
    overflow-y: auto;
    padding: 10px 20px 22px;
  }

  .settings-section {
    padding-top: 12px;
  }

  .theme-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
  .theme-option { display: grid; grid-template-columns: 20px 1fr 18px; align-items: center; gap: 9px; min-height: 42px; padding: 7px 10px; border: 1px solid var(--app-border); border-radius: 8px; background: var(--app-panel); color: var(--app-text); text-align: left; cursor: pointer; }
  .theme-option:hover { background: var(--app-hover); }
  .theme-option.active { border-color: var(--app-accent); box-shadow: 0 0 0 1px var(--app-accent); }
  .theme-swatch { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(0,0,0,.12); }
  .theme-check { color: var(--app-accent); font-weight: 700; }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: #aeaeb2;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 10px;
  }

  .section-hint {
    font-size: 11.5px;
    color: #8e8e93;
    margin: -6px 0 12px;
    line-height: 1.4;
    max-width: 52ch;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0;
    cursor: pointer;
  }

  .setting-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;
  }

  .setting-label {
    font-size: 13px;
    color: #1c1c1e;
    font-weight: 500;
  }

  :global(html.dark) .setting-label {
    color: #e5e5e7;
  }

  .setting-hint {
    font-size: 11px;
    color: #8e8e93;
    line-height: 1.4;
  }

  :global(html.dark) .setting-hint {
    color: #8e8e93;
  }

  .setting-switch {
    -webkit-appearance: none;
    appearance: none;
    width: 36px;
    height: 20px;
    background: #e5e5ea;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
    margin: 0;
  }

  :global(html.dark) .setting-switch {
    background: #3a3a3c;
  }

  .setting-switch::before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.15s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  }

  .setting-switch:checked,
  :global(html.dark) .setting-switch:checked {
    background: var(--app-accent);
  }

  .setting-switch:checked::before {
    transform: translateX(16px);
  }

  @media (max-width: 680px) {
    .dialog { height: min(720px, 84vh); }
    .dialog-body { grid-template-columns: 118px minmax(0, 1fr); }
    .settings-content { padding-inline: 14px; }
    .theme-grid { grid-template-columns: 1fr; }
  }
</style>
