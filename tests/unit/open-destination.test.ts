import { describe, expect, it } from "vitest";
import { shouldPromptForOpen } from "../../src/lib/stores/openDestination";

describe("shouldPromptForOpen", () => {
  it("does not prompt for an empty workspace", () => {
    expect(shouldPromptForOpen(0, null)).toBe(false);
  });

  it("prompts when a document is already open", () => {
    expect(shouldPromptForOpen(1, null)).toBe(true);
  });

  it("prompts when a folder workspace is already open", () => {
    expect(shouldPromptForOpen(0, "D:\\Notes")).toBe(true);
  });
});
