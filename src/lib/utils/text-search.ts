// Plain-text search helpers shared by the in-document find overlay.
//
// The rendered (view) mode highlights matches with mark.js against the DOM, but
// in edit mode the document is a <textarea> whose contents are not in the DOM as
// markable text nodes. These pure helpers power the editor find path (counting,
// cycling and backdrop highlighting) and are unit tested in isolation.

export interface Match {
  /** Inclusive start offset into the source text. */
  start: number;
  /** Exclusive end offset into the source text. */
  end: number;
}

/**
 * Find every non-overlapping, case-insensitive occurrence of `query` in `text`.
 *
 * The match is literal — `query` is never treated as a regular expression — so
 * special characters such as `.` `*` `(` are matched verbatim. Returns an empty
 * array for an empty/whitespace-free-but-empty query.
 */
export function findMatches(text: string, query: string): Match[] {
  const matches: Match[] = [];
  if (!text || !query) return matches;

  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  const len = needle.length;
  if (len === 0) return matches;

  let from = 0;
  while (from <= haystack.length - len) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) break;
    matches.push({ start: idx, end: idx + len });
    from = idx + len; // non-overlapping
  }
  return matches;
}

/**
 * Move an active match index by `direction` (+1 next, -1 previous), wrapping
 * around the ends. Returns 0 when there are no matches.
 */
export function cycleIndex(current: number, total: number, direction: 1 | -1): number {
  if (total <= 0) return 0;
  return (current + direction + total) % total;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * Build the HTML for the editor highlight backdrop: the source text with each
 * match wrapped in a `<mark>`. The match at `activeIndex` additionally gets the
 * `mdv-search-active` class so the focused hit can be styled/scrolled to.
 *
 * The output is rendered behind a transparent <textarea> whose `white-space` is
 * `pre-wrap`, so newlines and spaces are preserved without extra markup.
 */
export function buildHighlightHtml(text: string, matches: Match[], activeIndex: number): string {
  if (matches.length === 0) return escapeHtml(text);

  let html = "";
  let cursor = 0;
  for (let i = 0; i < matches.length; i++) {
    const { start, end } = matches[i];
    if (start < cursor) continue; // defensive: skip overlaps
    html += escapeHtml(text.slice(cursor, start));
    const className =
      i === activeIndex ? "mdv-search-highlight mdv-search-active" : "mdv-search-highlight";
    html += `<mark class="${className}" data-match-index="${i}">`;
    html += escapeHtml(text.slice(start, end));
    html += "</mark>";
    cursor = end;
  }
  html += escapeHtml(text.slice(cursor));
  return html;
}
