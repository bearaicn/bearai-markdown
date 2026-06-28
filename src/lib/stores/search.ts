import { writable } from "svelte/store";

// Shared find-in-document state.
//
// The find overlay (SearchOverlay) renders the controls and owns the rendered
// (viewer/raw) highlighting via mark.js, while the Editor renders its own
// highlight backdrop for the <textarea>. Both read this shared state so a single
// query/active-match drives whichever target is currently on screen.

/** Current find query. An empty string means there is no active search. */
export const searchQuery = writable("");

/** 0-based index of the currently focused match. */
export const searchActiveIndex = writable(0);

/** Total number of matches in the active target (viewer, raw, or editor). */
export const searchTotal = writable(0);

/** Clear all find state — called whenever the overlay is hidden. */
export function resetSearch(): void {
  searchQuery.set("");
  searchActiveIndex.set(0);
  searchTotal.set(0);
}
