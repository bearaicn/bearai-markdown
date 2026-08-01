// Slide splitting for minimal Marp presentation support (issue #44).
//
// A Marp deck separates slides with a top-level thematic break (`---`). Splitting
// the raw source with a naive `/^---$/m` regex is wrong: a `---` inside a fenced
// code block, or a `---` used as a setext heading underline, is NOT a slide
// break. So we let markdown-it tokenize the content and split only on real `hr`
// tokens — correct by construction, and reusing the parser we already ship.
//
// Kept as a pure helper with its own bare parser (independent of the render
// pipeline's configured instance) so it stays trivially unit-testable.

import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

/**
 * Split Marp deck content (the markdown *after* frontmatter) into slides on
 * top-level `---` thematic breaks.
 *
 * - `---` inside a fenced code block is not a break (it's a `fence` token).
 * - `text` followed by `---` is a setext H2 underline, not a break.
 * - Empty slices (leading `---`, consecutive `---`) are dropped.
 * - Content with no break yields a single slide.
 * - Empty/whitespace-only input yields `[]`.
 */
export function splitSlides(content: string): string[] {
  if (!content.trim()) return [];

  const lines = content.split("\n");
  const tokens = parser.parse(content, {});

  // 0-indexed start line of every top-level thematic break.
  const breakLines: number[] = [];
  for (const token of tokens) {
    if (token.type === "hr" && token.level === 0 && token.map) {
      breakLines.push(token.map[0]);
    }
  }

  const slides: string[] = [];
  let start = 0;
  for (const brk of breakLines) {
    slides.push(lines.slice(start, brk).join("\n"));
    start = brk + 1; // skip the `---` line itself
  }
  slides.push(lines.slice(start).join("\n"));

  return slides.map((s) => s.trim()).filter((s) => s.length > 0);
}
