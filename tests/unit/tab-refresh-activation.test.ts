import { describe, expect, it, vi } from "vitest";
import { activateTabWithRefresh, shouldCommitActiveReload } from "../../src/lib/utils/tabRefreshActivation";

describe("tab refresh activation", () => {
  it("activates immediately before refreshing a clean filesystem-backed tab", async () => {
    const calls: string[] = [];
    let finishReload!: () => void;
    const reloadPending = new Promise<void>((resolve) => { finishReload = resolve; });

    activateTabWithRefresh(
      { id: "one", filePath: "D:\\notes\\one.md", isEditing: false, dirty: false },
      {
        activate: (id) => calls.push(`activate:${id}`),
        reload: async (path) => { calls.push(`reload:${path}`); await reloadPending; },
      },
    );

    expect(calls).toEqual(["activate:one", "reload:D:\\notes\\one.md"]);
    finishReload();
    await reloadPending;
  });

  it("does not replace an active document when an older tab reload finishes late", () => {
    expect(shouldCommitActiveReload("D:\\notes\\one.md", "D:\\notes\\two.md")).toBe(false);
    expect(shouldCommitActiveReload("D:\\notes\\one.md", "d:/notes/ONE.md")).toBe(true);
  });

  it("protects editing and dirty tabs from automatic external refresh", () => {
    const reload = vi.fn();
    const activate = vi.fn();
    activateTabWithRefresh(
      { id: "editing", filePath: "D:\\notes\\editing.md", isEditing: true, dirty: true },
      { activate, reload },
    );
    expect(activate).toHaveBeenCalledWith("editing");
    expect(reload).not.toHaveBeenCalled();
  });
});
