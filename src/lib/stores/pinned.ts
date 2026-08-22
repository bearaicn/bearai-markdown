import { derived } from "svelte/store";
import { recentFolders, setFolderFavorite } from "./recents";

// Compatibility adapter for existing callers. Favorites now share the unified
// recent-item model so folder history and pinning cannot drift apart.
const paths = derived(recentFolders, ($folders) =>
  $folders.filter((folder) => folder.favorite).map((folder) => folder.path)
);

export const pinnedFolders = {
  subscribe: paths.subscribe,
  add(path: string) {
    setFolderFavorite(path, true);
  },
  remove(path: string) {
    setFolderFavorite(path, false);
  },
};
