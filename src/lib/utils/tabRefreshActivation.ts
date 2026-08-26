import { workspacePathEquals } from "./workspacePath";

export interface RefreshableTab {
  id: string;
  filePath: string;
  isEditing: boolean;
  dirty: boolean;
}

interface TabActivationDependencies {
  activate: (id: string) => void;
  reload: (path: string) => void | Promise<void>;
}

function isFilesystemPath(path: string): boolean {
  return !!path && !/^(new|paste|url):\/\//i.test(path);
}

/**
 * Make the cached tab visible synchronously, then refresh its disk-backed
 * content in the background. Editing tabs are deliberately protected from an
 * automatic refresh so an external write cannot silently replace their base.
 */
export function activateTabWithRefresh(
  tab: RefreshableTab,
  dependencies: TabActivationDependencies,
): void {
  dependencies.activate(tab.id);
  if (!isFilesystemPath(tab.filePath) || tab.isEditing || tab.dirty) return;
  void dependencies.reload(tab.filePath);
}

/** Prevent a late reload for a previously selected tab replacing the viewer. */
export function shouldCommitActiveReload(requestedPath: string, activePath: string | null | undefined): boolean {
  return !!activePath && workspacePathEquals(requestedPath, activePath);
}
