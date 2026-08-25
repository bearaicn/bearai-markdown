import { describe, expect, it, vi } from "vitest";
import { focusDocumentSearchPanel } from "../../src/lib/utils/documentSearchFocus";

describe("document search shortcut focus", () => {
  it("shows the outline before focusing and selecting its search input", async () => {
    const calls: string[] = [];
    const input = {
      focus: vi.fn(() => calls.push("focus")),
      select: vi.fn(() => calls.push("select")),
    };

    const focused = await focusDocumentSearchPanel({
      showPanel: () => calls.push("show"),
      waitForPanel: async () => { calls.push("wait"); },
      findInput: () => input,
    });

    expect(focused).toBe(true);
    expect(calls).toEqual(["show", "wait", "focus", "select"]);
  });

  it("returns false without throwing when the input cannot be rendered", async () => {
    const focused = await focusDocumentSearchPanel({
      showPanel: () => {},
      waitForPanel: async () => {},
      findInput: () => null,
    });

    expect(focused).toBe(false);
  });
});
