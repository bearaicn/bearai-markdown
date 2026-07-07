import { describe, it, expect } from "vitest";
import { findMatches, cycleIndex, buildHighlightHtml } from "../../src/lib/utils/text-search";

describe("findMatches", () => {
  it("returns no matches for an empty query", () => {
    expect(findMatches("hello world", "")).toEqual([]);
  });

  it("returns no matches for empty text", () => {
    expect(findMatches("", "x")).toEqual([]);
  });

  it("finds a single match with correct offsets", () => {
    expect(findMatches("hello world", "world")).toEqual([{ start: 6, end: 11 }]);
  });

  it("finds multiple non-overlapping matches", () => {
    // "aa" in "aaaa" → positions 0-2 and 2-4 (non-overlapping)
    expect(findMatches("aaaa", "aa")).toEqual([
      { start: 0, end: 2 },
      { start: 2, end: 4 },
    ]);
  });

  it("is case-insensitive", () => {
    expect(findMatches("Markdown MARKDOWN markdown", "markdown")).toEqual([
      { start: 0, end: 8 },
      { start: 9, end: 17 },
      { start: 18, end: 26 },
    ]);
  });

  it("treats the query literally, not as a regex", () => {
    // The '.' must match a literal dot, not any character.
    const text = "a.b axb a.b";
    expect(findMatches(text, "a.b")).toEqual([
      { start: 0, end: 3 },
      { start: 8, end: 11 },
    ]);
  });

  it("matches special regex characters verbatim", () => {
    expect(findMatches("cost is $5 (approx)", "(approx)")).toEqual([{ start: 11, end: 19 }]);
  });

  it("handles matches across newlines in the source text", () => {
    const text = "line one\nTODO: x\nline three\nTODO: y";
    expect(findMatches(text, "TODO")).toEqual([
      { start: 9, end: 13 },
      { start: 28, end: 32 },
    ]);
  });

  it("returns an empty array when there is no match", () => {
    expect(findMatches("hello", "zzz")).toEqual([]);
  });
});

describe("cycleIndex", () => {
  it("returns 0 when there are no matches", () => {
    expect(cycleIndex(0, 0, 1)).toBe(0);
    expect(cycleIndex(5, 0, -1)).toBe(0);
  });

  it("advances to the next index", () => {
    expect(cycleIndex(0, 3, 1)).toBe(1);
    expect(cycleIndex(1, 3, 1)).toBe(2);
  });

  it("wraps forward from the last to the first match", () => {
    expect(cycleIndex(2, 3, 1)).toBe(0);
  });

  it("moves to the previous index", () => {
    expect(cycleIndex(2, 3, -1)).toBe(1);
  });

  it("wraps backward from the first to the last match", () => {
    expect(cycleIndex(0, 3, -1)).toBe(2);
  });
});

describe("buildHighlightHtml", () => {
  it("escapes HTML when there are no matches", () => {
    expect(buildHighlightHtml("<b> & </b>", [], 0)).toBe("&lt;b&gt; &amp; &lt;/b&gt;");
  });

  it("wraps matches in <mark> and marks the active one", () => {
    const text = "foo bar foo";
    const matches = findMatches(text, "foo");
    const html = buildHighlightHtml(text, matches, 1);
    expect(html).toBe(
      '<mark class="mdv-search-highlight" data-match-index="0">foo</mark>' +
        " bar " +
        '<mark class="mdv-search-highlight mdv-search-active" data-match-index="1">foo</mark>'
    );
  });

  it("escapes match text and surrounding text", () => {
    const text = "a <x> a";
    const matches = findMatches(text, "<x>");
    const html = buildHighlightHtml(text, matches, 0);
    expect(html).toBe(
      'a <mark class="mdv-search-highlight mdv-search-active" data-match-index="0">&lt;x&gt;</mark> a'
    );
  });

  it("preserves newlines so pre-wrap rendering stays aligned", () => {
    const text = "x\nTODO\ny";
    const matches = findMatches(text, "TODO");
    const html = buildHighlightHtml(text, matches, 0);
    expect(html).toBe(
      'x\n<mark class="mdv-search-highlight mdv-search-active" data-match-index="0">TODO</mark>\ny'
    );
  });
});
