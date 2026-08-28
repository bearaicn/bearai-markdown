// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const overlaySource = readFileSync(
  new URL("../../src/lib/components/StartupOverlay.svelte", import.meta.url),
  "utf8",
);

describe("startup overlay", () => {
  it("covers the full app and reuses the active theme scene", () => {
    expect(overlaySource).toContain("position: fixed");
    expect(overlaySource).toContain("inset: 0");
    expect(overlaySource).toContain("var(--app-scene-bg)");
  });

  it("shows the product identity and a localized loading status", () => {
    expect(overlaySource).toContain("bearai-markdown-icon.png");
    expect(overlaySource).toContain("$messages.appName");
    expect(overlaySource).toContain("$messages.startupLoading");
  });

  it("provides a reduced-motion fallback", () => {
    expect(overlaySource).toContain("prefers-reduced-motion: reduce");
  });
});
