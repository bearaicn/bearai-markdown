<script lang="ts">
  import { onMount } from "svelte";
  import { document as docStore } from "$lib/stores/document";
  import { getContentClientHeight, getContentScrollHeight, getContentScrollTop } from "$lib/utils/contentScroll";

  let progress = $state(0);

  onMount(() => {
    function update() {
      const max = getContentScrollHeight() - getContentClientHeight();
      progress = max > 0 ? Math.min((getContentScrollTop() / max) * 100, 100) : 0;
    }
    window.addEventListener("content-scroll", update);
    return () => window.removeEventListener("content-scroll", update);
  });
</script>

{#if $docStore.renderedHtml}
  <div class="progress-bar" style="width: {progress}%"></div>
{/if}

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: #0891B2;
    z-index: 100;
    transition: width 0.1s linear;
    pointer-events: none;
  }

  :global(html.dark) .progress-bar {
    background: #22D3EE;
  }

  @media print {
    .progress-bar { display: none !important; }
  }
</style>
