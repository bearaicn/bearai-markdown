import { describe, it, expect } from "vitest";
import { splitSlides } from "../../src/lib/renderer/slides";

describe("splitSlides", () => {
  it("returns [] for empty or whitespace-only content", () => {
    expect(splitSlides("")).toEqual([]);
    expect(splitSlides("   \n\n  ")).toEqual([]);
  });

  it("returns a single slide when there is no break", () => {
    expect(splitSlides("# Title\n\nhello")).toEqual(["# Title\n\nhello"]);
  });

  it("splits on a top-level thematic break", () => {
    expect(splitSlides("slide one\n\n---\n\nslide two")).toEqual([
      "slide one",
      "slide two",
    ]);
  });

  it("splits into three slides", () => {
    expect(splitSlides("a\n\n---\n\nb\n\n---\n\nc")).toEqual(["a", "b", "c"]);
  });

  it("does NOT split on `---` inside a fenced code block", () => {
    const deck = "intro\n\n```yaml\nmarp: true\n---\nkey: val\n```\n\n---\n\nnext";
    const slides = splitSlides(deck);
    expect(slides).toHaveLength(2);
    expect(slides[0]).toContain("```yaml");
    expect(slides[0]).toContain("marp: true");
    expect(slides[1]).toBe("next");
  });

  it("does NOT split on a setext heading underline", () => {
    // "Title\n---" is an H2 underline, not a thematic break → one slide.
    const slides = splitSlides("Title\n---\n\nbody");
    expect(slides).toHaveLength(1);
  });

  it("drops empty slides from consecutive breaks", () => {
    expect(splitSlides("a\n\n---\n\n---\n\nb")).toEqual(["a", "b"]);
  });

  it("drops an empty leading slide", () => {
    expect(splitSlides("---\n\nfirst")).toEqual(["first"]);
  });

  it("drops an empty trailing slide", () => {
    expect(splitSlides("last\n\n---\n")).toEqual(["last"]);
  });

  it("preserves inner markdown structure of a slide", () => {
    const slides = splitSlides("# Heading\n\n- a\n- b\n\n---\n\n> quote");
    expect(slides[0]).toBe("# Heading\n\n- a\n- b");
    expect(slides[1]).toBe("> quote");
  });
});
