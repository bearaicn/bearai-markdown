import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { currentAppName } from "$lib/i18n";
import { document } from "../stores/document";
import { tabStore } from "../stores/tabs";
import { renderFull } from "../renderer/pipeline";
import { addRecentFile } from "../stores/recents";
import { openPathInNewWindow, requestOpenDestination } from "../stores/openDestination";
import { shouldCommitActiveReload } from "$lib/utils/tabRefreshActivation";

export async function readMarkdownFile(path: string): Promise<string> {
  return invoke<string>("read_markdown_file", { path });
}

export async function saveFile(path: string, content: string): Promise<void> {
  await invoke("write_markdown_file", { path, content });
}

function fileNameFromPath(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.split("/").pop() || normalized;
}

export async function openFile(path: string, options: { activate?: boolean } = {}): Promise<void> {
  const absolutePath = await resolvePath(path);
  const fileName = fileNameFromPath(absolutePath);
  const baseDir = getBaseDir(absolutePath);
  const tabId = tabStore.beginOpenTab(absolutePath, fileName, options.activate ?? true);

  try {
    const content = await readMarkdownFile(absolutePath);
    const result = renderFull(content, baseDir);

    // Whitelist the document's local images with the asset protocol before the
    // HTML hits the DOM, so images outside the static $HOME scope load (#31).
    await allowAssets(result.assetPaths);

    tabStore.finishOpenTab(tabId, content, result.html, result.frontmatter, result.wordCount);

    // An empty file has nothing to read — drop straight into the editor so the
    // user can start writing, instead of staring at a blank viewer (#52).
    if (content.trim() === "") tabStore.setEditing(tabId, true);

    if (tabStore.getActiveTab()?.id === tabId) {
      document.set({
        filePath: absolutePath,
        fileName,
        content,
        renderedHtml: result.html,
        frontmatter: result.frontmatter,
        wordCount: result.wordCount,
        loading: false,
        error: null,
      });
      getCurrentWindow().setTitle(`${fileName} — ${currentAppName()}`).catch(() => {});
    }

    addRecentFile(absolutePath, fileName);
    invoke("start_watching", { path: absolutePath }).catch(() => {});
  } catch (err) {
    const message = `Failed to open file: ${err}`;
    tabStore.failOpenTab(tabId, message);
    if (tabStore.getActiveTab()?.id === tabId) {
      document.set({
        filePath: absolutePath,
        fileName,
        content: "",
        renderedHtml: "",
        frontmatter: null,
        wordCount: 0,
        loading: false,
        error: message,
      });
    }
  }
}

export async function openFileWithPrompt(path: string): Promise<void> {
  const destination = await requestOpenDestination("file", path);
  if (destination === "current") await openFile(path);
  else if (destination === "new-window") {
    try {
      await openPathInNewWindow("file", path);
    } catch (error) {
      console.error("Failed to open file in a new window:", error);
      alert(`Failed to open a new window: ${error}`);
    }
  }
}

let newDocCounter = 0;

/**
 * Start a fresh, unsaved markdown document in a new tab, opened straight into
 * the editor — the "new tab" behavior the UI already advertised (#63). It has
 * no filesystem path yet (a `new://` sentinel, like `paste://`); the location
 * is chosen on the first save via `saveAsNewDocument`. The watcher and
 * copy-path/link resolution skip `new://` tabs until they're saved.
 */
export function newDocument(): void {
  const filePath = `new://${Date.now()}-${newDocCounter++}`;
  const result = renderFull("");
  const tabId = tabStore.addTab(
    filePath,
    "Untitled",
    "",
    result.html,
    result.frontmatter,
    result.wordCount
  );
  tabStore.setEditing(tabId, true);
}

/**
 * First-save flow for a `new://` document: prompt for a location, write the
 * content, then re-point the tab at the chosen real path (watch + recents +
 * title). Returns the chosen absolute path, or null if the user cancelled the
 * dialog (caller should leave the tab dirty and in the editor).
 */
export async function saveAsNewDocument(tabId: string, content: string): Promise<string | null> {
  const chosen = await save({
    defaultPath: "Untitled.md",
    filters: [{ name: "Markdown", extensions: ["md", "markdown", "mdown", "mkd"] }],
  });
  if (!chosen) return null;

  const fileName = fileNameFromPath(chosen);
  await saveFile(chosen, content);
  tabStore.rebindPath(tabId, chosen, fileName);
  addRecentFile(chosen, fileName);
  getCurrentWindow().setTitle(`${fileName} — ${currentAppName()}`).catch(() => {});
  invoke("start_watching", { path: chosen }).catch(() => {});
  return chosen;
}

export async function openFileDialog(): Promise<void> {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Markdown",
          extensions: ["md", "markdown", "mdown", "mkd", "txt"],
        },
      ],
    });

    if (selected) {
      // selected can be string or string[] depending on version
      const path = typeof selected === "string" ? selected : (selected as any)?.path ?? String(selected);
      await openFileWithPrompt(path);
    }
  } catch (err) {
    console.error("File dialog error:", err);
  }
}

export async function reloadCurrentFile(path: string): Promise<void> {
  try {
    const absolutePath = await resolvePath(path);
    const content = await readMarkdownFile(absolutePath);
    const baseDir = getBaseDir(absolutePath);
    const result = renderFull(content, baseDir);
    const fileName = fileNameFromPath(absolutePath);

    await allowAssets(result.assetPaths);

    tabStore.updateTabContent(absolutePath, content, result.html, result.frontmatter, result.wordCount);

    // Disk reads are asynchronous. The user may have selected another tab
    // before this one finishes, so only update the global viewer when this
    // file is still active. The background tab itself is always refreshed.
    if (shouldCommitActiveReload(absolutePath, tabStore.getActiveTab()?.filePath)) {
      document.set({
        filePath: absolutePath,
        fileName,
        content,
        renderedHtml: result.html,
        frontmatter: result.frontmatter,
        wordCount: result.wordCount,
        loading: false,
        error: null,
      });
    }
  } catch (err) {
    console.error("Failed to reload file:", err);
  }
}

export function getBaseDir(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const idx = normalized.lastIndexOf("/");
  return idx >= 0 ? normalized.slice(0, idx) : ".";
}

export async function resolvePath(path: string): Promise<string> {
  return invoke<string>("resolve_path", { path });
}

/** Whether a path exists on disk (for the local-file-link existence check, #30). */
export async function pathExists(path: string): Promise<boolean> {
  return invoke<boolean>("path_exists", { path });
}

/** Open a non-markdown local file in the OS default app (#30). */
export async function openWithSystem(path: string): Promise<void> {
  const { openPath } = await import("@tauri-apps/plugin-opener");
  await openPath(path);
}

/**
 * Whitelist resolved local image paths with the webview's asset protocol so
 * they can be fetched regardless of the static $HOME scope (issue #31). A
 * failure here must not block text rendering — a broken image is acceptable
 * degradation, a blank document is not — so it's swallowed.
 */
export async function allowAssets(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await invoke("allow_assets", { paths }).catch(() => {});
}
