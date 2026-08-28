<script lang="ts">
  import { fade } from "svelte/transition";
  import brandLogo from "$lib/assets/bearai-markdown-icon.png";
  import { messages } from "$lib/i18n";
</script>

<div
  class="startup-overlay"
  role="status"
  aria-live="polite"
  aria-label={$messages.startupLoading}
  out:fade={{ duration: 220 }}
>
  <div class="ambient ambient-one" aria-hidden="true"></div>
  <div class="ambient ambient-two" aria-hidden="true"></div>

  <section class="brand-card">
    <div class="logo-frame">
      <img src={brandLogo} alt="" width="76" height="76" />
      <span class="logo-ring" aria-hidden="true"></span>
    </div>
    <h1>{$messages.appName}</h1>
    <p>{$messages.startupLoading}</p>
    <div class="progress-track" aria-hidden="true">
      <span></span>
    </div>
  </section>
</div>

<style>
  .startup-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: grid;
    place-items: center;
    overflow: hidden;
    color: var(--app-text);
    background: var(--app-scene-bg);
    background-position: center;
    background-size: cover;
    isolation: isolate;
  }

  .startup-overlay::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    content: "";
    background: linear-gradient(135deg, color-mix(in srgb, var(--app-bg) 38%, transparent), transparent 52%, color-mix(in srgb, var(--app-accent) 12%, transparent));
  }

  .ambient {
    position: absolute;
    z-index: -1;
    width: min(48vw, 520px);
    aspect-ratio: 1;
    border-radius: 999px;
    opacity: 0.28;
    filter: blur(68px);
    background: color-mix(in srgb, var(--app-accent) 58%, transparent);
    animation: drift 5s ease-in-out infinite alternate;
  }

  .ambient-one {
    top: -25%;
    right: -12%;
  }

  .ambient-two {
    bottom: -32%;
    left: -14%;
    opacity: 0.18;
    animation-delay: -2.4s;
  }

  .brand-card {
    display: flex;
    width: min(320px, calc(100vw - 64px));
    flex-direction: column;
    align-items: center;
    padding: 36px 34px 30px;
    text-align: center;
    border: 1px solid color-mix(in srgb, var(--app-border) 72%, transparent);
    border-radius: 28px;
    background: color-mix(in srgb, var(--app-chrome) 74%, transparent);
    box-shadow: 0 28px 75px color-mix(in srgb, var(--app-text) 16%, transparent), inset 0 1px 0 color-mix(in srgb, white 65%, transparent);
    backdrop-filter: blur(22px) saturate(1.12);
    -webkit-backdrop-filter: blur(22px) saturate(1.12);
  }

  .logo-frame {
    position: relative;
    display: grid;
    width: 92px;
    height: 92px;
    place-items: center;
    margin-bottom: 20px;
  }

  .logo-frame img {
    position: relative;
    z-index: 1;
    width: 76px;
    height: 76px;
    object-fit: contain;
    filter: drop-shadow(0 10px 15px color-mix(in srgb, var(--app-accent) 22%, transparent));
  }

  .logo-ring {
    position: absolute;
    inset: 0;
    border: 1px solid color-mix(in srgb, var(--app-accent) 38%, transparent);
    border-radius: 30px;
    animation: breathe 1.8s ease-in-out infinite;
  }

  h1 {
    margin: 0;
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 720;
    line-height: 1.15;
    letter-spacing: -0.025em;
  }

  p {
    margin: 10px 0 20px;
    color: var(--app-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .progress-track {
    width: 132px;
    height: 3px;
    overflow: hidden;
    border-radius: 999px;
    background: color-mix(in srgb, var(--app-border) 60%, transparent);
  }

  .progress-track span {
    display: block;
    width: 46%;
    height: 100%;
    border-radius: inherit;
    background: var(--app-accent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--app-accent) 60%, transparent);
    animation: loading-sweep 1.25s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  }

  @keyframes loading-sweep {
    from { transform: translateX(-120%); }
    to { transform: translateX(290%); }
  }

  @keyframes breathe {
    0%, 100% { transform: scale(0.94); opacity: 0.48; }
    50% { transform: scale(1.04); opacity: 0.92; }
  }

  @keyframes drift {
    from { transform: translate3d(-3%, -2%, 0) scale(0.96); }
    to { transform: translate3d(4%, 3%, 0) scale(1.06); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ambient,
    .logo-ring,
    .progress-track span {
      animation: none;
    }

    .progress-track span {
      width: 62%;
      margin-inline: auto;
    }
  }
</style>
