import { describe, expect, it } from "vitest";
import { findTextMatches, nextSearchResultIndex } from "../../src/lib/utils/documentSearch";

describe("findTextMatches", () => {
  it("finds every case-insensitive occurrence in document order", () => {
    const matches = findTextMatches("BearAI makes Markdown useful. bearai stays focused.", "BEARAI");
    expect(matches.map(({ start, end }) => [start, end])).toEqual([[0, 6], [30, 36]]);
  });

  it("returns readable excerpts and respects the result limit", () => {
    const matches = findTextMatches(`before ${"x".repeat(40)} target after target`, "target", 1);
    expect(matches).toHaveLength(1);
    expect(matches[0].excerpt).toContain("target");
    expect(matches[0].excerpt.startsWith("…")).toBe(true);
  });

  it("does not search a blank query", () => {
    expect(findTextMatches("content", "   ")).toEqual([]);
  });
});

describe("nextSearchResultIndex", () => {
  it("starts at the first result and advances in document order", () => {
    expect(nextSearchResultIndex(-1, 3)).toBe(0);
    expect(nextSearchResultIndex(0, 3)).toBe(1);
    expect(nextSearchResultIndex(1, 3)).toBe(2);
  });

  it("wraps after the final result and handles an empty result set", () => {
    expect(nextSearchResultIndex(2, 3)).toBe(0);
    expect(nextSearchResultIndex(-1, 0)).toBe(-1);
  });
});
