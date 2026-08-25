import { writable } from "svelte/store";

const STORAGE_KEY = "mdhero-folder-workspace-v1";
const isolatedWindow = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("open-path");

export interface FolderWorkspaceState {
  rootPath: string | null;
  expandedPaths: string[];
  selectedPath: string | null;
  sidebarVisible: boolean;
}

const defaults: FolderWorkspaceState = {
  rootPath: null,
  expandedPaths: [],
  selectedPath: null,
  sidebarVisible: true,
};

function load(): FolderWorkspaceState {
  if (isolatedWindow) return defaults;
  if (typeof localStorage === "undefined") return defaults;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<FolderWorkspaceState> | null;
    return parsed ? { ...defaults, ...parsed } : defaults;
  } catch {
    return defaults;
  }
}

const store = writable<FolderWorkspaceState>(load());
store.subscribe((state) => {
  if (!isolatedWindow && typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});

export const folderWorkspace = {
  subscribe: store.subscribe,
  open(rootPath: string) {
    store.update((state) => ({
      ...state,
      rootPath,
      expandedPaths: state.rootPath === rootPath ? state.expandedPaths : [],
      selectedPath: state.rootPath === rootPath ? state.selectedPath : null,
      sidebarVisible: true,
    }));
  },
  close() {
    store.update((state) => ({ ...state, rootPath: null, expandedPaths: [], selectedPath: null }));
  },
  toggleVisible() {
    store.update((state) => ({ ...state, sidebarVisible: !state.sidebarVisible }));
  },
  setExpanded(path: string, expanded: boolean) {
    store.update((state) => ({
      ...state,
      expandedPaths: expanded
        ? Array.from(new Set([...state.expandedPaths, path]))
        : state.expandedPaths.filter((item) => item !== path),
    }));
  },
  select(path: string | null) {
    store.update((state) => ({ ...state, selectedPath: path }));
  },
  renamePaths(oldPath: string, newPath: string) {
    const oldNormalized = oldPath.replace(/\//g, "\\").replace(/\\+$/, "");
    const replace = (path: string | null) => {
      if (!path) return path;
      const normalized = path.replace(/\//g, "\\");
      return normalized === oldNormalized || normalized.startsWith(`${oldNormalized}\\`)
        ? `${newPath}${normalized.slice(oldNormalized.length)}` : path;
    };
    store.update((state) => ({ ...state, expandedPaths: state.expandedPaths.map((path) => replace(path) as string), selectedPath: replace(state.selectedPath) }));
  },
};
