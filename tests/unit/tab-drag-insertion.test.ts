import { describe, expect, it } from "vitest";
import { getTabDropTarget, moveItemToInsertionBoundary } from "../../src/lib/utils/tabDragInsertion";

const rects = [
  { left: 0, right: 100 },
  { left: 102, right: 202 },
  { left: 204, right: 304 },
];

describe("tab drag insertion boundaries", () => {
  it("distinguishes the left and right half of every tab", () => {
    expect(getTabDropTarget(20, rects)).toEqual({ boundaryIndex: 0, targetIndex: 0, side: "left" });
    expect(getTabDropTarget(80, rects)).toEqual({ boundaryIndex: 1, targetIndex: 0, side: "right" });
    expect(getTabDropTarget(120, rects)).toEqual({ boundaryIndex: 1, targetIndex: 1, side: "left" });
    expect(getTabDropTarget(180, rects)).toEqual({ boundaryIndex: 2, targetIndex: 1, side: "right" });
    expect(getTabDropTarget(280, rects)).toEqual({ boundaryIndex: 3, targetIndex: 2, side: "right" });
  });

  it("maps the previous right edge and next left edge to the same boundary", () => {
    expect(getTabDropTarget(100, rects)?.boundaryIndex).toBe(1);
    expect(getTabDropTarget(102, rects)?.boundaryIndex).toBe(1);
  });

  it("supports the first and last insertion boundaries without off-by-one moves", () => {
    expect(moveItemToInsertionBoundary(["A", "B", "C", "D"], 0, 4)).toEqual(["B", "C", "D", "A"]);
    expect(moveItemToInsertionBoundary(["A", "B", "C", "D"], 3, 0)).toEqual(["D", "A", "B", "C"]);
    expect(moveItemToInsertionBoundary(["A", "B", "C", "D"], 1, 2)).toEqual(["A", "B", "C", "D"]);
  });
});
