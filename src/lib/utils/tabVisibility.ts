/**
 * Return the horizontal scroll position that makes an item fully visible in
 * its viewport while moving the strip by the smallest possible distance.
 * Coordinates are viewport-relative (from getBoundingClientRect()).
 */
export function getScrollLeftToReveal(
  viewportLeft: number,
  viewportRight: number,
  itemLeft: number,
  itemRight: number,
  currentScrollLeft: number,
): number {
  if (itemLeft < viewportLeft) {
    return Math.max(0, currentScrollLeft + itemLeft - viewportLeft);
  }
  if (itemRight > viewportRight) {
    return Math.max(0, currentScrollLeft + itemRight - viewportRight);
  }
  return currentScrollLeft;
}
