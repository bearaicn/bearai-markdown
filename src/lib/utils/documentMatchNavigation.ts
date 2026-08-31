import { contentTopForElement, revealContentTop } from "./contentReveal";

const HIGHLIGHT_NAME = "folder-search-current";
const TARGET_CLASS = "folder-search-target";

function ensureHighlightStyle(): void {
  if (document.getElementById("folder-search-highlight-style")) return;
  const style = document.createElement("style");
  style.id = "folder-search-highlight-style";
  style.textContent = "::highlight(folder-search-current){background:#ffd166;color:#1c1c1e;text-decoration:underline 2px solid #d97706}";
  document.head.appendChild(style);
}

export function selectSourceBlockIndex(blockStartLines: number[], targetLineOneBased: number): number {
  if (!blockStartLines.length) return -1;
  const target = Math.max(0, targetLineOneBased - 1);
  let selected = 0;
  for (let index = 0; index < blockStartLines.length; index++) {
    if (blockStartLines[index] > target) break;
    selected = index;
  }
  return selected;
}

export function clearFolderSearchHighlight(): void {
  const highlights = (globalThis.CSS as typeof CSS & { highlights?: Map<string, unknown> } | undefined)?.highlights;
  highlights?.delete(HIGHLIGHT_NAME);
  document.querySelector(`.${TARGET_CLASS}`)?.classList.remove(TARGET_CLASS);
}

function findTextRange(root: HTMLElement, query: string): Range | null {
  const needle = query.toLocaleLowerCase();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent?.trim() || node.parentElement?.closest("script, style, .code-copy-btn")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const offsets: number[] = [];
  let text = "";
  for (const node of nodes) {
    offsets.push(text.length);
    text += node.data;
  }
  const matchStart = text.toLocaleLowerCase().indexOf(needle);
  if (matchStart < 0) return null;
  const matchEnd = matchStart + query.length;
  const startIndex = offsets.findIndex((offset, index) => matchStart >= offset && matchStart < offset + nodes[index].length);
  const endIndex = offsets.findIndex((offset, index) => matchEnd - 1 >= offset && matchEnd - 1 < offset + nodes[index].length);
  if (startIndex < 0 || endIndex < 0) return null;
  const range = document.createRange();
  range.setStart(nodes[startIndex], matchStart - offsets[startIndex]);
  range.setEnd(nodes[endIndex], matchEnd - offsets[endIndex]);
  return range;
}

export function highlightDocumentMatch(query: string, line: number): boolean {
  ensureHighlightStyle();
  clearFolderSearchHighlight();
  const root = document.querySelector<HTMLElement>(".content-main .md-content");
  if (!root || !query.trim()) return false;
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-source-line]"));
  const starts = blocks.map((block) => Number(block.dataset.sourceLine ?? 0));
  const blockIndex = selectSourceBlockIndex(starts, line);
  const targetBlock = blocks[blockIndex] ?? root;
  const range = findTextRange(targetBlock, query.trim()) ?? findTextRange(root, query.trim());
  const target = range?.startContainer.parentElement ?? targetBlock;
  targetBlock.classList.add(TARGET_CLASS);

  const HighlightCtor = (globalThis as typeof globalThis & { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
  const highlights = (globalThis.CSS as typeof CSS & { highlights?: Map<string, unknown> } | undefined)?.highlights;
  if (range && HighlightCtor && highlights) highlights.set(HIGHLIGHT_NAME, new HighlightCtor(range));

  const top = contentTopForElement(target, 64);
  if (top !== null) revealContentTop(top);
  return true;
}
