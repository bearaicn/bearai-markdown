import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "svelte/store";
import { createTabStore } from "../../src/lib/stores/tabs";
import { getScrollLeftToReveal } from "../../src/lib/utils/tabVisibility";

describe("tab activation", () => {
  beforeEach(() => {
    vi.stubGlobal("document", { querySelector: () => null });
  });

  it("can create a restored tab without stealing the active tab", () => {
    const store = createTabStore();
    const activeId = store.beginOpenTab("D:\\notes\\active.md", "active.md");
    store.finishOpenTab(activeId, "active", "<p>active</p>");

    const backgroundId = store.beginOpenTab("D:\\notes\\background.md", "background.md", false);

    expect(get(store.activeTabId)).toBe(activeId);
    expect(get(store.tabs).find((tab) => tab.id === backgroundId)?.loading).toBe(true);
  });

  it("creates and activates a loading tab before its content is available", () => {
    const store = createTabStore();

    const id = store.beginOpenTab("D:\\notes\\slow.md", "slow.md");
    const pending = get(store.tabs).find((tab) => tab.id === id);

    expect(get(store.activeTabId)).toBe(id);
    expect(pending).toMatchObject({
      filePath: "D:\\notes\\slow.md",
      fileName: "slow.md",
      loading: true,
      content: "",
    });

    store.finishOpenTab(id, "# Loaded", "<h1>Loaded</h1>", null, 1);
    expect(get(store.tabs).find((tab) => tab.id === id)).toMatchObject({
      loading: false,
      content: "# Loaded",
      renderedHtml: "<h1>Loaded</h1>",
    });
  });

  it("activates an existing tab without clearing its loaded content", () => {
    const store = createTabStore();
    const firstId = store.addTab("D:\\notes\\first.md", "first.md", "first", "<p>first</p>");
    store.addTab("D:\\notes\\second.md", "second.md", "second", "<p>second</p>");

    const activatedId = store.beginOpenTab("D:\\notes\\first.md", "first.md");

    expect(activatedId).toBe(firstId);
    expect(get(store.activeTabId)).toBe(firstId);
    expect(get(store.tabs).find((tab) => tab.id === firstId)).toMatchObject({
      loading: false,
      content: "first",
      renderedHtml: "<p>first</p>",
    });
  });
});

describe("active tab visibility", () => {
  it("scrolls right just enough when the active tab is beyond the viewport", () => {
    expect(getScrollLeftToReveal(120, 420, 510, 620, 300)).toBe(500);
  });

  it("scrolls left just enough when the active tab is before the viewport", () => {
    expect(getScrollLeftToReveal(80, 380, 20, 100, 240)).toBe(180);
  });

  it("does not move when the active tab is already fully visible", () => {
    expect(getScrollLeftToReveal(120, 420, 180, 300, 240)).toBe(240);
  });
});
