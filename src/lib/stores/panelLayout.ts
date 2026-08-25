import { writable } from "svelte/store";

const STORAGE_KEY = "bearai-panel-layout-v1";
export const FOLDER_MIN_WIDTH = 220;
export const FOLDER_MAX_WIDTH = 520;
export const TOC_MIN_WIDTH = 190;
export const TOC_MAX_WIDTH = 420;

export interface PanelLayout {
  folderWidth: number;
  tocWidth: number;
}

const defaults: PanelLayout = { folderWidth: 280, tocWidth: 240 };

export function clampPanelWidth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function load(): PanelLayout {
  if (typeof localStorage === "undefined") return defaults;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<PanelLayout> | null;
    return {
      folderWidth: clampPanelWidth(Number(parsed?.folderWidth) || defaults.folderWidth, FOLDER_MIN_WIDTH, FOLDER_MAX_WIDTH),
      tocWidth: clampPanelWidth(Number(parsed?.tocWidth) || defaults.tocWidth, TOC_MIN_WIDTH, TOC_MAX_WIDTH),
    };
  } catch {
    return defaults;
  }
}

const store = writable<PanelLayout>(load());
store.subscribe((value) => {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
});

export const panelLayout = {
  subscribe: store.subscribe,
  setFolderWidth(width: number) {
    store.update((value) => ({ ...value, folderWidth: clampPanelWidth(width, FOLDER_MIN_WIDTH, FOLDER_MAX_WIDTH) }));
  },
  setTocWidth(width: number) {
    store.update((value) => ({ ...value, tocWidth: clampPanelWidth(width, TOC_MIN_WIDTH, TOC_MAX_WIDTH) }));
  },
};
