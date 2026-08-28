// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const rustSource = readFileSync(
  new URL("../../src-tauri/src/lib.rs", import.meta.url),
  "utf8",
);

const pageSource = readFileSync(
  new URL("../../src/routes/+page.svelte", import.meta.url),
  "utf8",
);

describe("startup window visibility", () => {
  it("shows the native window when the WebView finishes its basic page load", () => {
    expect(rustSource).toMatch(/\.on_page_load\(\|webview, payload\|[\s\S]*PageLoadEvent::Finished[\s\S]*webview\.window\(\)\.show\(\)/);
  });

  it("does not make document restoration responsible for showing the native window", () => {
    const completion = pageSource.slice(
      pageSource.indexOf("const completeStartup"),
      pageSource.indexOf("// Expose functions"),
    );
    expect(completion).not.toContain("getCurrentWindow().show");
  });
});
