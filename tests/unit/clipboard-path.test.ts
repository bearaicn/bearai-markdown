import { describe, expect, it } from "vitest";
import { fileNameFromClipboardPath, normalizePathForClipboard } from "../../src/lib/utils/clipboard";

describe("clipboard file paths", () => {
  it("removes the Windows long-path namespace prefix", () => {
    expect(normalizePathForClipboard("\\\\?\\D:\\Notes\\202408.md", "Win32")).toBe("D:\\Notes\\202408.md");
  });

  it("converts a namespaced UNC path into a normal UNC path", () => {
    expect(normalizePathForClipboard("\\\\?\\UNC\\server\\share\\note.md", "Win32")).toBe("\\\\server\\share\\note.md");
  });

  it("uses forward slashes on macOS", () => {
    expect(normalizePathForClipboard("/Users/bear/Notes/note.md", "MacIntel")).toBe("/Users/bear/Notes/note.md");
  });

  it("extracts file names from Windows and macOS paths", () => {
    expect(fileNameFromClipboardPath("D:\\Notes\\202408.md")).toBe("202408.md");
    expect(fileNameFromClipboardPath("/Users/bear/Notes/note.md")).toBe("note.md");
  });
});
