import type { Tab } from "./tabs";

const STORAGE_KEY = "bearai-open-document-session-v1";

export interface DocumentSession {
  paths: string[];
  activePath: string | null;
}

export interface DocumentSessionRestorePlan {
  /** Exact visual tab order from the previous session. */
  tabPaths: string[];
  /** Disk-read order, with the active document first for a fast first paint. */
  loadPaths: string[];
  activePath: string | null;
}

/** Keep visual order and I/O priority separate during startup restoration. */
export function createDocumentSessionRestorePlan(session: DocumentSession): DocumentSessionRestorePlan {
  const tabPaths = [...session.paths];
  const loadPaths = session.activePath
    ? [session.activePath, ...tabPaths.filter((path) => path !== session.activePath)]
    : [...tabPaths];
  return { tabPaths, loadPaths, activePath: session.activePath };
}

export function sessionFileName(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.split("/").pop() || normalized;
}

function isFilesystemPath(path: string): boolean {
  return Boolean(path) && !/^(new|paste|url):\/\//i.test(path);
}

export function loadDocumentSession(): DocumentSession {
  const empty: DocumentSession = { paths: [], activePath: null };
  if (typeof localStorage === "undefined") return empty;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DocumentSession> | null;
    if (!parsed || !Array.isArray(parsed.paths)) return empty;
    const paths = Array.from(new Set(parsed.paths.filter((path): path is string => typeof path === "string" && isFilesystemPath(path))));
    const activePath = typeof parsed.activePath === "string" && paths.includes(parsed.activePath) ? parsed.activePath : null;
    return { paths, activePath };
  } catch {
    return empty;
  }
}

export function saveDocumentSession(tabs: Pick<Tab, "id" | "filePath">[], activeTabId: string | null): void {
  if (typeof localStorage === "undefined") return;
  const paths = Array.from(new Set(tabs.map((tab) => tab.filePath).filter(isFilesystemPath)));
  const activePath = tabs.find((tab) => tab.id === activeTabId && isFilesystemPath(tab.filePath))?.filePath ?? null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ paths, activePath } satisfies DocumentSession));
}

export function clearDocumentSession(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
