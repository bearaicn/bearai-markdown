import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

describe("recent items", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  it("migrates legacy recent files and pinned folders without inventing folder history", async () => {
    localStorage.setItem("mdhero-recent-files", JSON.stringify([
      { path: "C:\\notes\\one.md", name: "one.md", openedAt: 42, scrollPercent: 30 },
    ]));
    localStorage.setItem("mdhero_pinned_folders", JSON.stringify(["C:\\notes"]));

    const store = await import("../../src/lib/stores/recents");
    expect(get(store.recentFiles)).toMatchObject([
      { kind: "file", path: "C:\\notes\\one.md", openedAt: 42, scrollPercent: 30 },
    ]);
    expect(get(store.recentFolders)).toMatchObject([
      { kind: "folder", path: "C:\\notes", openedAt: 0, favorite: true },
    ]);
  });

  it("deduplicates Windows paths and preserves folder metadata", async () => {
    const store = await import("../../src/lib/stores/recents");
    store.addRecentFolder("C:\\Notes");
    store.setFolderFavorite("c:/notes/", true);
    store.setFolderLastFile("C:/NOTES", "C:\\Notes\\one.md");
    store.addRecentFolder("c:/notes/");

    const folders = get(store.recentFolders);
    expect(folders).toHaveLength(1);
    expect(folders[0]).toMatchObject({ favorite: true, lastFilePath: "C:\\Notes\\one.md" });
  });

  it("clears history but keeps favorites", async () => {
    const store = await import("../../src/lib/stores/recents");
    store.addRecentFolder("D:\\recent");
    store.setFolderFavorite("D:\\favorite", true);
    store.clearRecentFolders();

    expect(get(store.recentFolders).map((folder) => folder.path)).toEqual(["D:\\favorite"]);
  });
});
