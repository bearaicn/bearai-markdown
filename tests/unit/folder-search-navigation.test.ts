import { describe, expect, it } from "vitest";
import { selectSourceBlockIndex } from "../../src/lib/utils/documentMatchNavigation";

describe("selectSourceBlockIndex", () => {
  it("selects the rendered block containing the one-based source result line", () => {
    const blockStartLines = [0, 5, 12, 20];
    expect(selectSourceBlockIndex(blockStartLines, 1)).toBe(0);
    expect(selectSourceBlockIndex(blockStartLines, 7)).toBe(1);
    expect(selectSourceBlockIndex(blockStartLines, 20)).toBe(2);
    expect(selectSourceBlockIndex(blockStartLines, 21)).toBe(3);
  });

  it("handles missing blocks without manufacturing a target", () => {
    expect(selectSourceBlockIndex([], 3)).toBe(-1);
  });
});
