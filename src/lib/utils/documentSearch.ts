export interface TextMatch {
  start: number;
  end: number;
  excerpt: string;
}

export function nextSearchResultIndex(currentIndex: number, resultCount: number): number {
  if (resultCount <= 0) return -1;
  return (currentIndex + 1) % resultCount;
}

export function findTextMatches(text: string, query: string, limit = 200): TextMatch[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  const haystack = text.toLocaleLowerCase();
  const matches: TextMatch[] = [];
  let from = 0;
  while (matches.length < limit) {
    const start = haystack.indexOf(needle, from);
    if (start < 0) break;
    const end = start + needle.length;
    const excerptStart = Math.max(0, start - 30);
    const excerptEnd = Math.min(text.length, end + 46);
    matches.push({
      start,
      end,
      excerpt: `${excerptStart > 0 ? "…" : ""}${text.slice(excerptStart, excerptEnd).replace(/\s+/g, " ")}${excerptEnd < text.length ? "…" : ""}`,
    });
    from = Math.max(end, start + 1);
  }
  return matches;
}
