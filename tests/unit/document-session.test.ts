import { beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("open document session", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  it("persists filesystem tabs in order and restores the active path", async () => {
    const session = await import("../../src/lib/stores/documentSession");
    session.saveDocumentSession([
      { id: "a", filePath: "C:\\notes\\one.md" },
      { id: "draft", filePath: "new://draft" },
      { id: "b", filePath: "C:\\notes\\two.md" },
    ], "b");

    expect(session.loadDocumentSession()).toEqual({
      paths: ["C:\\notes\\one.md", "C:\\notes\\two.md"],
      activePath: "C:\\notes\\two.md",
    });
  });

  it("filters transient documents and invalid active paths", async () => {
    localStorage.setItem("bearai-open-document-session-v1", JSON.stringify({
      paths: ["paste://1", "url://example", "D:\\valid.md", "D:\\valid.md"],
      activePath: "paste://1",
    }));
    const session = await import("../../src/lib/stores/documentSession");
    expect(session.loadDocumentSession()).toEqual({ paths: ["D:\\valid.md"], activePath: null });
  });

  it("keeps tab order while loading the previously active document first", async () => {
    const session = await import("../../src/lib/stores/documentSession");
    expect(session.createDocumentSessionRestorePlan({
      paths: ["D:\\notes\\B.md", "D:\\notes\\A.md", "D:\\notes\\C.md", "D:\\notes\\D.md"],
      activePath: "D:\\notes\\C.md",
    })).toEqual({
      tabPaths: ["D:\\notes\\B.md", "D:\\notes\\A.md", "D:\\notes\\C.md", "D:\\notes\\D.md"],
      loadPaths: ["D:\\notes\\C.md", "D:\\notes\\B.md", "D:\\notes\\A.md", "D:\\notes\\D.md"],
      activePath: "D:\\notes\\C.md",
    });
  });

  it("preserves path order when there is no active document", async () => {
    const session = await import("../../src/lib/stores/documentSession");
    expect(session.createDocumentSessionRestorePlan({ paths: ["a.md", "b.md"], activePath: null }))
      .toEqual({ tabPaths: ["a.md", "b.md"], loadPaths: ["a.md", "b.md"], activePath: null });
  });
});
