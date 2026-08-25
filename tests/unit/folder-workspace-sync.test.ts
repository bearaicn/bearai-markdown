import { beforeEach, describe, expect, it } from "vitest";
import { get } from "svelte/store";
import { folderWorkspace } from "../../src/lib/stores/folderWorkspace";

describe("folder workspace active-file sync", () => {
  beforeEach(() => folderWorkspace.close());

  it("selects the active tab when its file belongs to the workspace", () => {
    folderWorkspace.open("D:\\Notes");
    folderWorkspace.syncActiveFile("\\\\?\\d:\\notes\\projects\\readme.md");
    expect(get(folderWorkspace).selectedPath).toBe("\\\\?\\d:\\notes\\projects\\readme.md");
  });

  it("preserves the tree selection for a tab outside the workspace", () => {
    folderWorkspace.open("D:\\Notes");
    folderWorkspace.select("D:\\Notes\\one.md");
    folderWorkspace.syncActiveFile("D:\\Other\\two.md");
    expect(get(folderWorkspace).selectedPath).toBe("D:\\Notes\\one.md");
  });

  it("ignores virtual documents", () => {
    folderWorkspace.open("D:\\Notes");
    folderWorkspace.select("D:\\Notes\\one.md");
    folderWorkspace.syncActiveFile("new://draft");
    expect(get(folderWorkspace).selectedPath).toBe("D:\\Notes\\one.md");
  });

  it("does not publish another state when a folder is already expanded", () => {
    folderWorkspace.open("D:\\Notes");
    let emissions = 0;
    const unsubscribe = folderWorkspace.subscribe(() => { emissions += 1; });
    folderWorkspace.setExpanded("D:\\Notes\\Projects", true);
    const afterFirstExpansion = emissions;

    folderWorkspace.setExpanded("D:\\Notes\\Projects", true);

    expect(emissions).toBe(afterFirstExpansion);
    unsubscribe();
  });
});
