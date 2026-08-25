const STORAGE_KEY = "bearai-toc-state-v1";

type TocStateMap = Record<string, string[]>;

function loadAll(): TocStateMap {
  if (typeof localStorage === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" ? parsed as TocStateMap : {};
  } catch {
    return {};
  }
}

export function loadTocState(filePath: string): string[] | null {
  const value = loadAll()[filePath];
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : null;
}

export function saveTocState(filePath: string, collapsedIds: Iterable<string>): void {
  if (typeof localStorage === "undefined" || !filePath) return;
  const all = loadAll();
  all[filePath] = Array.from(new Set(collapsedIds));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
