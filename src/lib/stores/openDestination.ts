import { get, writable } from "svelte/store";
import { invoke } from "@tauri-apps/api/core";
import { folderWorkspace } from "./folderWorkspace";
import { tabStore } from "./tabs";

export type OpenItemKind = "file" | "folder";
export type OpenDestination = "current" | "new-window" | "cancel";

interface OpenDestinationRequest {
  kind: OpenItemKind;
  path: string;
  resolve: (destination: OpenDestination) => void;
}

export const openDestinationRequest = writable<OpenDestinationRequest | null>(null);

export function shouldPromptForOpen(tabCount: number, rootPath: string | null): boolean {
  return tabCount > 0 || Boolean(rootPath);
}

export function hasOpenWorkspace(): boolean {
  return shouldPromptForOpen(get(tabStore.tabs).length, get(folderWorkspace).rootPath);
}

export function requestOpenDestination(kind: OpenItemKind, path: string): Promise<OpenDestination> {
  if (!hasOpenWorkspace()) return Promise.resolve("current");
  return new Promise((resolve) => openDestinationRequest.set({ kind, path, resolve }));
}

export function resolveOpenDestination(destination: OpenDestination): void {
  const request = get(openDestinationRequest);
  if (!request) return;
  openDestinationRequest.set(null);
  request.resolve(destination);
}

export async function openPathInNewWindow(kind: OpenItemKind, path: string): Promise<void> {
  await invoke("open_path_in_new_window", { kind, path });
}
