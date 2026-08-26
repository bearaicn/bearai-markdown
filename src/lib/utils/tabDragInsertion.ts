export interface HorizontalTabRect {
  left: number;
  right: number;
}

export interface TabDropTarget {
  /** Gap before tab 0 through the gap after the final tab. */
  boundaryIndex: number;
  /** Tab whose physical edge owns the visual insertion marker. */
  targetIndex: number;
  side: "left" | "right";
}

/** Resolve pointer position to a tab edge while sharing one logical gap index. */
export function getTabDropTarget(pointerX: number, rects: HorizontalTabRect[]): TabDropTarget | null {
  if (rects.length === 0) return null;
  for (let index = 0; index < rects.length; index += 1) {
    const rect = rects[index];
    const midpoint = rect.left + (rect.right - rect.left) / 2;
    if (pointerX <= midpoint) {
      return { boundaryIndex: index, targetIndex: index, side: "left" };
    }
    const nextLeft = rects[index + 1]?.left;
    if (pointerX <= rect.right || nextLeft === undefined || pointerX < nextLeft) {
      return { boundaryIndex: index + 1, targetIndex: index, side: "right" };
    }
  }
  const finalIndex = rects.length - 1;
  return { boundaryIndex: rects.length, targetIndex: finalIndex, side: "right" };
}

/** Move an existing item to one of the N+1 insertion gaps. */
export function moveItemToInsertionBoundary<T>(items: T[], fromIndex: number, boundaryIndex: number): T[] {
  if (fromIndex < 0 || fromIndex >= items.length) return [...items];
  const bounded = Math.max(0, Math.min(boundaryIndex, items.length));
  const insertionIndex = bounded > fromIndex ? bounded - 1 : bounded;
  if (insertionIndex === fromIndex) return [...items];
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(insertionIndex, 0, moved);
  return next;
}
