<script lang="ts">
  import { messages } from "$lib/i18n";
  import { openDestinationRequest, resolveOpenDestination } from "$lib/stores/openDestination";

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") resolveOpenDestination("cancel");
  }
</script>

{#if $openDestinationRequest}
  <div class="destination-backdrop" role="presentation" onkeydown={handleKeydown}>
    <div class="destination-dialog" role="dialog" aria-modal="true" aria-labelledby="open-destination-title">
      <h2 id="open-destination-title">{$messages.openDestinationTitle}</h2>
      <p>{$openDestinationRequest.kind === "folder" ? $messages.openFolderDestinationHint : $messages.openFileDestinationHint}</p>
      <div class="destination-actions">
        <button class="secondary" onclick={() => resolveOpenDestination("cancel")}>{$messages.cancel}</button>
        <button class="secondary" onclick={() => resolveOpenDestination("new-window")}>{$messages.openInNewWindow}</button>
        <button class="primary" onclick={() => resolveOpenDestination("current")}>{$messages.openInCurrentWorkspace}</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .destination-backdrop {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgb(15 23 42 / 32%);
    backdrop-filter: blur(4px);
  }

  .destination-dialog {
    width: min(460px, 100%);
    padding: 22px;
    border: 1px solid var(--app-border);
    border-radius: 14px;
    background: var(--app-chrome);
    color: var(--app-text);
    box-shadow: 0 22px 60px rgb(15 23 42 / 22%);
  }

  h2 { margin: 0; font-size: 17px; font-weight: 650; }
  p { margin: 10px 0 22px; color: var(--app-muted); font-size: 14px; line-height: 1.6; }
  .destination-actions { display: flex; justify-content: flex-end; gap: 9px; flex-wrap: wrap; }
  button { min-height: 36px; padding: 0 14px; border-radius: 8px; border: 1px solid var(--app-border); font-size: 13px; cursor: pointer; }
  button.secondary { background: var(--app-chrome); color: var(--app-text); }
  button.primary { border-color: var(--app-accent); background: var(--app-accent); color: white; }
  button:hover { filter: brightness(0.97); }
</style>
