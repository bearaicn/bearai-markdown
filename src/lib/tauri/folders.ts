import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { folderWorkspace } from "$lib/stores/folderWorkspace";
import { addRecentFolder, setFolderLastFile } from "$lib/stores/recents";
import { openFile } from "./files";

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

export async function openFolder(path?: string): Promise<boolean> {
  const selected = path ?? await open({ directory: true, multiple: false });
  if (!selected || typeof selected !== "string") return false;

  // Validate access before changing persisted workspace/history state.
  await listDirectory(selected, selected);
  folderWorkspace.open(selected);
  addRecentFolder(selected, folderName(selected));
  return true;
}

export async function openWorkspaceFile(root: string, path: string): Promise<void> {
  folderWorkspace.select(path);
  setFolderLastFile(root, path);
  await openFile(path);
}
