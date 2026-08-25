import { writable } from "svelte/store";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export const tocEntries = writable<TocEntry[]>([]);
export const activeHeadingId = writable<string | null>(null);
export const TOC_VISIBLE_KEY = "bearai-toc-visible-v1";

export function deserializeTocVisible(value: string | null): boolean {
  return value === "true";
}

export function serializeTocVisible(visible: boolean): string {
  return String(visible);
}

function loadTocVisible(): boolean {
  if (typeof localStorage === "undefined") return false;
  return deserializeTocVisible(localStorage.getItem(TOC_VISIBLE_KEY));
}
export const tocVisible = writable(loadTocVisible());
tocVisible.subscribe((visible) => {
  if (typeof localStorage !== "undefined") localStorage.setItem(TOC_VISIBLE_KEY, serializeTocVisible(visible));
});

// When true, the IntersectionObserver won't update activeHeadingId
let observerPaused = false;

export function setActiveHeading(id: string): void {
  observerPaused = true;
  activeHeadingId.set(id);
  // Resume observer after scroll settles
  setTimeout(() => { observerPaused = false; }, 800);
}

export function isObserverPaused(): boolean {
  return observerPaused;
}

export function extractToc(container: HTMLElement): TocEntry[] {
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const entries: TocEntry[] = [];

  headings.forEach((el) => {
    const id = el.id;
    if (!id) return;
    const level = parseInt(el.tagName[1], 10);
    const text = el.textContent?.trim() ?? "";
    if (text) {
      entries.push({ id, text, level });
    }
  });

  return entries;
}

export function toggleToc(): void {
  tocVisible.update((v) => !v);
}
