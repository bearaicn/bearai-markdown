// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../../src/lib/components/DirectoryTree.svelte", import.meta.url),
  "utf8",
);

describe("directory file activation speed", () => {
  it("opens files immediately while retaining the double-click delay only for folders", () => {
    expect(source).toContain('if (entry.kind === "file")');
    expect(source).toContain('void toggle(entry);');
    expect(source.indexOf('if (entry.kind === "file")')).toBeLessThan(source.indexOf('clickTimer = setTimeout'));
  });
});
