import { writable, get } from "svelte/store";
import { getContentScrollTop } from "../utils/contentScroll";
import { workspacePathEquals, workspacePathIsSameOrDescendant } from "../utils/workspacePath";
import { moveItemToInsertionBoundary } from "../utils/tabDragInsertion";

export interface Tab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  renderedHtml: string;
  frontmatter: Record<string, unknown> | null;
  wordCount: number;
  scrollTop: number;
  isEditing: boolean;
  editContent: string;
  dirty: boolean;
  lastSavedAt: number;
  loading: boolean;
  error: string | null;
}

export const HOME_TAB_ID = "__home__";

export function createTabStore() {
  const tabs = writable<Tab[]>([]);
  const activeTabId = writable<string | null>(HOME_TAB_ID);

  function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  function addTab(filePath: string, fileName: string, content: string, renderedHtml: string, frontmatter?: Record<string, unknown> | null, wordCount?: number): string {
    const currentTabs = get(tabs);

    // If file is already open, switch to it
    const existing = currentTabs.find((t) => t.filePath === filePath);
    if (existing) {
      activeTabId.set(existing.id);
      tabs.update((ts) =>
        ts.map((t) => {
          if (t.id !== existing.id) return t;
          // Preserve edit state on re-add — only refresh content/render if not dirty
          if (t.isEditing) {
            const dirty = t.editContent !== content;
            return { ...t, content, renderedHtml, frontmatter: frontmatter ?? null, wordCount: wordCount ?? 0, dirty };
          }
          return { ...t, content, renderedHtml, frontmatter: frontmatter ?? null, wordCount: wordCount ?? 0, editContent: content, dirty: false };
        })
      );
      return existing.id;
    }

    const id = generateId();
    const newTab: Tab = {
      id,
      filePath,
      fileName,
      content,
      renderedHtml,
      frontmatter: frontmatter ?? null,
      wordCount: wordCount ?? 0,
      scrollTop: 0,
      isEditing: false,
      editContent: content,
      dirty: false,
      lastSavedAt: 0,
      loading: false,
      error: null,
    };

    tabs.update((ts) => [...ts, newTab]);
    activeTabId.set(id);
    return id;
  }

  /** Activate an existing file immediately, or create an active loading tab. */
  function beginOpenTab(filePath: string, fileName: string, activate = true): string {
    const existing = get(tabs).find((tab) => tab.filePath === filePath);
    if (existing) {
      if (activate) switchTab(existing.id);
      return existing.id;
    }

    const id = generateId();
    const newTab: Tab = {
      id,
      filePath,
      fileName,
      content: "",
      renderedHtml: "",
      frontmatter: null,
      wordCount: 0,
      scrollTop: 0,
      isEditing: false,
      editContent: "",
      dirty: false,
      lastSavedAt: 0,
      loading: true,
      error: null,
    };
    tabs.update((current) => [...current, newTab]);
    if (activate) activeTabId.set(id);
    return id;
  }

  function finishOpenTab(id: string, content: string, renderedHtml: string, frontmatter?: Record<string, unknown> | null, wordCount?: number) {
    tabs.update((current) => current.map((tab) => tab.id === id ? {
      ...tab,
      content,
      renderedHtml,
      frontmatter: frontmatter ?? null,
      wordCount: wordCount ?? 0,
      editContent: tab.dirty ? tab.editContent : content,
      loading: false,
      error: null,
    } : tab));
  }

  function failOpenTab(id: string, error: string) {
    tabs.update((current) => current.map((tab) => tab.id === id ? {
      ...tab,
      loading: false,
      error,
    } : tab));
  }

  function closeTab(id: string) {
    if (id === HOME_TAB_ID) return; // Can't close home tab
    saveScrollPosition();
    const currentTabs = get(tabs);
    const idx = currentTabs.findIndex((t) => t.id === id);
    if (idx === -1) return;

    const newTabs = currentTabs.filter((t) => t.id !== id);
    tabs.set(newTabs);

    // If closing the active tab, switch to adjacent or home
    if (get(activeTabId) === id) {
      if (newTabs.length === 0) {
        activeTabId.set(HOME_TAB_ID);
      } else {
        const newIdx = Math.min(idx, newTabs.length - 1);
        activeTabId.set(newTabs[newIdx].id);
      }
    }
  }

  function goHome() {
    saveScrollPosition();
    activeTabId.set(HOME_TAB_ID);
  }

  function saveScrollPosition() {
    const currentId = get(activeTabId);
    if (currentId) {
      const scrollTop = getContentScrollTop();
      tabs.update((ts) =>
        ts.map((t) => (t.id === currentId ? { ...t, scrollTop } : t))
      );
    }
  }

  function switchTab(id: string) {
    if (get(activeTabId) === id) return;
    saveScrollPosition();
    activeTabId.set(id);
  }

  function updateTabContent(filePath: string, content: string, renderedHtml: string, frontmatter?: Record<string, unknown> | null, wordCount?: number) {
    tabs.update((ts) =>
      ts.map((t) => {
        if (t.filePath !== filePath) return t;
        const next: Tab = {
          ...t,
          content,
          renderedHtml,
          frontmatter: frontmatter ?? t.frontmatter,
          wordCount: wordCount ?? t.wordCount,
        };
        // Preserve in-progress edits when content updates from external sources (file watcher)
        if (t.isEditing) {
          next.dirty = t.editContent !== content;
        } else {
          next.editContent = content;
          next.dirty = false;
        }
        return next;
      })
    );
  }

  function getActiveTab(): Tab | null {
    const id = get(activeTabId);
    if (!id) return null;
    return get(tabs).find((t) => t.id === id) ?? null;
  }

  function reorderTabs(fromIndex: number, insertionBoundary: number) {
    tabs.update((current) => moveItemToInsertionBoundary(current, fromIndex, insertionBoundary));
  }

  function setEditing(id: string, editing: boolean) {
    tabs.update((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        // When entering edit mode, sync editContent to current content if not already dirty
        if (editing && !t.isEditing && !t.dirty) {
          return { ...t, isEditing: true, editContent: t.content };
        }
        return { ...t, isEditing: editing };
      })
    );
  }

  function updateEditContent(id: string, newContent: string) {
    tabs.update((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        return { ...t, editContent: newContent, dirty: newContent !== t.content };
      })
    );
  }

  function markSaved(id: string) {
    tabs.update((ts) =>
      ts.map((t) => {
        if (t.id !== id) return t;
        return { ...t, content: t.editContent, dirty: false, lastSavedAt: Date.now() };
      })
    );
  }

  function getLastSavedAt(filePath: string): number {
    const t = get(tabs).find((x) => x.filePath === filePath);
    return t?.lastSavedAt ?? 0;
  }

  // Re-point a tab at a real filesystem path + name. Used when an unsaved
  // `new://` document gets a location on its first save (#63).
  function rebindPath(id: string, filePath: string, fileName: string) {
    tabs.update((ts) =>
      ts.map((t) => (t.id === id ? { ...t, filePath, fileName } : t))
    );
  }

  function renamePaths(oldPath: string, newPath: string, isDirectory: boolean) {
    const oldNormalized = oldPath.replace(/\//g, "\\").replace(/\\+$/, "");
    tabs.update((ts) => ts.map((tab) => {
      const current = tab.filePath.replace(/\//g, "\\");
      if (current !== oldNormalized && !(isDirectory && current.startsWith(`${oldNormalized}\\`))) return tab;
      const filePath = `${newPath}${current.slice(oldNormalized.length)}`;
      const fileName = filePath.replace(/\\/g, "/").split("/").pop() || tab.fileName;
      return { ...tab, filePath, fileName };
    }));
  }

  function closePaths(path: string, isDirectory: boolean) {
    const matchingIds = get(tabs)
      .filter((tab) => isDirectory
        ? workspacePathIsSameOrDescendant(path, tab.filePath)
        : workspacePathEquals(path, tab.filePath))
      .map((tab) => tab.id);
    for (const id of matchingIds) closeTab(id);
  }

  return {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    switchTab,
    updateTabContent,
    getActiveTab,
    reorderTabs,
    goHome,
    setEditing,
    updateEditContent,
    markSaved,
    getLastSavedAt,
    rebindPath,
    renamePaths,
    closePaths,
    saveScrollPosition,
    beginOpenTab,
    finishOpenTab,
    failOpenTab,
  };
}

export const tabStore = createTabStore();
