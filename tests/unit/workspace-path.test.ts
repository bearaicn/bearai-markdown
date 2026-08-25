import { describe, expect, it } from "vitest";
import { workspaceAncestorDirectories, workspacePathEquals } from "../../src/lib/utils/workspacePath";

describe("workspace path matching", () => {
  it("matches Windows extended paths regardless of case and slash style", () => {
    expect(workspacePathEquals(
      "\\\\?\\D:\\Notes\\Folder\\file.md",
      "d:/notes/folder/file.md",
    )).toBe(true);
  });

  it("returns the parent directories between the workspace and an active file", () => {
    expect(workspaceAncestorDirectories(
      "D:\\Notes",
      "\\\\?\\D:\\Notes\\Projects\\BearAI\\readme.md",
    )).toEqual([
      "D:\\Notes\\Projects",
      "D:\\Notes\\Projects\\BearAI",
    ]);
  });

  it("does not treat a sibling with the same prefix as part of the workspace", () => {
    expect(workspaceAncestorDirectories("D:\\Notes", "D:\\Notes-old\\readme.md")).toBeNull();
  });

  it("supports case-sensitive POSIX workspace paths", () => {
    expect(workspaceAncestorDirectories("/Users/me/notes", "/Users/me/notes/a/b.md"))
      .toEqual(["/Users/me/notes/a"]);
    expect(workspaceAncestorDirectories("/Users/me/Notes", "/Users/me/notes/a.md"))
      .toBeNull();
  });
});
