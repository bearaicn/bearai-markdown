// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const rustSource = readFileSync(
  new URL("../../src-tauri/src/lib.rs", import.meta.url),
  "utf8",
);

const macConfig = JSON.parse(
  readFileSync(new URL("../../src-tauri/tauri.macos.conf.json", import.meta.url), "utf8"),
);

describe("macOS native window controls", () => {
  it("keeps native overlay decorations enabled in the macOS config", () => {
    const window = macConfig.app.windows[0];
    expect(window.decorations).toBe(true);
    expect(window.titleBarStyle).toBe("Overlay");
    expect(window.hiddenTitle).toBe(true);
  });

  it("keeps decorations out of persisted state without mutating the native title bar at runtime", () => {
    const stateFlags = rustSource.slice(
      rustSource.indexOf("let window_state_flags"),
      rustSource.indexOf("tauri::Builder::default()"),
    );
    expect(stateFlags).not.toContain("StateFlags::DECORATIONS");
    expect(rustSource).not.toMatch(/main_window\.set_decorations\(true\)\?/);
  });
});
