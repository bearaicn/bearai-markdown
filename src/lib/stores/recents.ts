import { derived, get, writable } from "svelte/store";

const STORAGE_KEY = "mdhero-recent-items-v2";
const LEGACY_FILES_KEY = "mdhero-recent-files";
const LEGACY_PINNED_FOLDERS_KEY = "mdhero_pinned_folders";
const MAX_RECENT_FILES = 20;
const MAX_RECENT_FOLDERS = 10;

interface RecentItemBase {
  kind: "file" | "folder";
  path: string;
  name: string;
  openedAt: number;
  favorite?: boolean;
}

export interface RecentFile extends RecentItemBase {
  kind: "file";
  scrollPercent?: number;
}

export interface RecentFolder extends RecentItemBase {
  kind: "folder";
  lastFilePath?: string;
}

export type RecentItem = RecentFile | RecentFolder;

function pathKey(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return /^[a-z]:\//i.test(normalized) ? normalized.toLocaleLowerCase() : normalized;
}

function pathName(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.split("/").pop() || normalized;
}

function validItem(value: unknown): value is RecentItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RecentItem>;
  return (item.kind === "file" || item.kind === "folder")
    && typeof item.path === "string"
    && typeof item.name === "string"
    && typeof item.openedAt === "number";
}

function loadLegacy(): RecentItem[] {
  if (typeof localStorage === "undefined") return [];
  const items: RecentItem[] = [];
  try {
    const files = JSON.parse(localStorage.getItem(LEGACY_FILES_KEY) ?? "[]") as Array<Partial<RecentFile>>;
    for (const file of files) {
      if (typeof file.path !== "string") continue;
      items.push({
        kind: "file",
        path: file.path,
        name: typeof file.name === "string" ? file.name : pathName(file.path),
        openedAt: typeof file.openedAt === "number" ? file.openedAt : 0,
        scrollPercent: typeof file.scrollPercent === "number" ? file.scrollPercent : 0,
      });
    }
  } catch {}
  try {
    const folders = JSON.parse(localStorage.getItem(LEGACY_PINNED_FOLDERS_KEY) ?? "[]") as unknown[];
    for (const folder of folders) {
      if (typeof folder !== "string") continue;
      items.push({ kind: "folder", path: folder, name: pathName(folder), openedAt: 0, favorite: true });
    }
  } catch {}
  return items;
}

function save(items: RecentItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function load(): RecentItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed.filter(validItem) : [];
    }
  } catch {}
  const migrated = loadLegacy();
  save(migrated);
  return migrated;
}

function trimItems(items: RecentItem[]): RecentItem[] {
  const keep = (kind: RecentItem["kind"], limit: number) => {
    const matching = items.filter((item) => item.kind === kind);
    const favorites = matching.filter((item) => item.favorite);
    const recent = matching.filter((item) => !item.favorite).sort((a, b) => b.openedAt - a.openedAt).slice(0, limit);
    return [...favorites, ...recent];
  };
  return [...keep("file", MAX_RECENT_FILES), ...keep("folder", MAX_RECENT_FOLDERS)];
}

export const recentItems = writable<RecentItem[]>(load());
export const recentFiles = derived(recentItems, ($items) =>
  $items.filter((item): item is RecentFile => item.kind === "file").sort((a, b) => b.openedAt - a.openedAt)
);
export const recentFolders = derived(recentItems, ($items) =>
  $items.filter((item): item is RecentFolder => item.kind === "folder")
    .sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || b.openedAt - a.openedAt)
);

function replace(items: RecentItem[]) {
  const trimmed = trimItems(items);
  save(trimmed);
  return trimmed;
}

export function addRecentFile(path: string, name: string, scrollPercent?: number) {
  if (path.startsWith("paste://")) return;
  const key = pathKey(path);
  recentItems.update((items) => {
    const existing = items.find((item): item is RecentFile => item.kind === "file" && pathKey(item.path) === key);
    const next: RecentFile = {
      kind: "file", path, name, openedAt: Date.now(), favorite: existing?.favorite,
      scrollPercent: scrollPercent ?? existing?.scrollPercent ?? 0,
    };
    return replace([next, ...items.filter((item) => !(item.kind === "file" && pathKey(item.path) === key))]);
  });
}

export function addRecentFolder(path: string, name = pathName(path)) {
  const key = pathKey(path);
  recentItems.update((items) => {
    const existing = items.find((item): item is RecentFolder => item.kind === "folder" && pathKey(item.path) === key);
    const next: RecentFolder = {
      kind: "folder", path, name, openedAt: Date.now(), favorite: existing?.favorite, lastFilePath: existing?.lastFilePath,
    };
    return replace([next, ...items.filter((item) => !(item.kind === "folder" && pathKey(item.path) === key))]);
  });
}

export function setFolderLastFile(folderPath: string, filePath: string) {
  const key = pathKey(folderPath);
  recentItems.update((items) => replace(items.map((item) =>
    item.kind === "folder" && pathKey(item.path) === key ? { ...item, lastFilePath: filePath } : item
  )));
}

export function setFolderFavorite(path: string, favorite: boolean) {
  const key = pathKey(path);
  recentItems.update((items) => {
    const existing = items.find((item): item is RecentFolder => item.kind === "folder" && pathKey(item.path) === key);
    const next: RecentItem[] = existing
      ? items.map((item) => item === existing ? { ...item, favorite } : item)
      : [...items, { kind: "folder", path, name: pathName(path), openedAt: 0, favorite }];
    return replace(next);
  });
}

export function updateScrollPercent(path: string, scrollPercent: number) {
  if (path.startsWith("paste://")) return;
  const key = pathKey(path);
  recentItems.update((items) => replace(items.map((item) =>
    item.kind === "file" && pathKey(item.path) === key ? { ...item, scrollPercent } : item
  )));
}

export function removeRecentFile(path: string) {
  const key = pathKey(path);
  recentItems.update((items) => replace(items.filter((item) => !(item.kind === "file" && pathKey(item.path) === key))));
}

export function removeRecentFolder(path: string) {
  const key = pathKey(path);
  recentItems.update((items) => replace(items.filter((item) => !(item.kind === "folder" && pathKey(item.path) === key))));
}

export function clearRecentFiles() {
  recentItems.update((items) => replace(items.filter((item) => item.kind !== "file" || Boolean(item.favorite))));
}

export function clearRecentFolders() {
  recentItems.update((items) => replace(items.filter((item) => item.kind !== "folder" || Boolean(item.favorite))));
}

export function getRecentFolder(path: string): RecentFolder | undefined {
  const key = pathKey(path);
  return get(recentFolders).find((folder) => pathKey(folder.path) === key);
}
