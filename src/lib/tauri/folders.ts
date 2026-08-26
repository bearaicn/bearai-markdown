import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { folderWorkspace } from "$lib/stores/folderWorkspace";
import { addRecentFolder, setFolderLastFile } from "$lib/stores/recents";
import { openFile } from "./files";
import { openPathInNewWindow, requestOpenDestination } from "$lib/stores/openDestination";

export interface DirectoryEntry {
  name: string;
  path: string;
  kind: "file" | "folder";
  modified?: number;
  hasChildren?: boolean;
}

export interface WorkspaceSearchResult {
  path: string;
  relativePath: string;
  line: number;
  preview: string;
}

export function folderName(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.split("/").pop() || normalized;
}

export async function listDirectory(root: string, directory = root): Promise<DirectoryEntry[]> {
  return invoke<DirectoryEntry[]>("list_directory", { root, directory });
}

export async function searchWorkspaceMarkdown(root: string, query: string): Promise<WorkspaceSearchResult[]> {
  return invoke<WorkspaceSearchResult[]>("search_workspace_markdown", { root, query });
}

export async function renameDirectoryEntry(root: string, path: string, newName: string): Promise<string> {
  return invoke<string>("rename_directory_entry", { root, path, newName });
}

export async function deleteDirectoryEntry(root: string, path: string, kind: DirectoryEntry["kind"]): Promise<void> {
  return invoke<void>("delete_directory_entry", { root, path, kind });
}

export async function revealInFileExplorer(path: string): Promise<void> {
  const { revealItemInDir } = await import("@tauri-apps/plugin-opener");
  await revealItemInDir(path);
}

export async function openFolderInCurrentWindow(path: string): Promise<boolean> {
  // Validate access before changing persisted workspace/history state.
  await listDirectory(path, path);
  folderWorkspace.open(path);
  addRecentFolder(path, folderName(path));
  return true;
}

export async function openFolder(path?: string): Promise<boolean> {
  const selected = path ?? await open({ directory: true, multiple: false });
  if (!selected || typeof selected !== "string") return false;

  const destination = await requestOpenDestination("folder", selected);
  if (destination === "cancel") return false;
  if (destination === "new-window") {
    try {
      await openPathInNewWindow("folder", selected);
      // Record immediately in the initiating window. The child window also
      // records on load, but relying on that asynchronous startup alone can
      // leave workspace state and native recent folders out of sync.
      addRecentFolder(selected, folderName(selected));
      return true;
    } catch (error) {
      console.error("Failed to open folder in a new window:", error);
      alert(`Failed to open a new window: ${error}`);
      return false;
    }
  }
  return openFolderInCurrentWindow(selected);
}

export async function openWorkspaceFile(root: string, path: string): Promise<void> {
  folderWorkspace.select(path);
  setFolderLastFile(root, path);
  await openFile(path);
}
