// @ts-expect-error Vitest runs this file in Node; the app intentionally omits @types/node.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../../src/lib/components/DirectoryTree.svelte", import.meta.url),
  "utf8",
);

describe("directory tree destructive actions", () => {
  it("places a separated red delete action behind an explicit confirmation", () => {
    expect(source).toContain('class="tree-context-separator"');
    expect(source).toContain('class="danger" onclick={deleteContextEntry}');
    expect(source).toContain('await confirm(');
    expect(source).toContain('if (!accepted) return;');
    expect(source).toContain('await deleteDirectoryEntry(root, entry.path, entry.kind)');
  });
});
