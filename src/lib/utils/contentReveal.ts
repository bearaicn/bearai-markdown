import { getContentScrollElement } from "./contentScroll";

const FINAL_NUDGE_PX = 48;

export interface RevealPlan {
  jumpTop: number;
  targetTop: number;
  smooth: boolean;
}

export function createRevealPlan(
  currentTop: number,
  targetTop: number,
  viewportHeight: number,
  reducedMotion: boolean,
): RevealPlan {
  const target = Math.max(0, targetTop);
  if (reducedMotion) return { jumpTop: target, targetTop: target, smooth: false };

  const distance = target - currentTop;
  if (Math.abs(distance) <= Math.max(FINAL_NUDGE_PX * 2, viewportHeight * 0.35)) {
    return { jumpTop: currentTop, targetTop: target, smooth: true };
  }

  return {
    jumpTop: Math.max(0, target - Math.sign(distance) * FINAL_NUDGE_PX),
    targetTop: target,
    smooth: true,
  };
}

export function revealContentTop(targetTop: number): void {
  const scroller = getContentScrollElement();
  if (!scroller) return;
  const reducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const plan = createRevealPlan(scroller.scrollTop, targetTop, scroller.clientHeight, reducedMotion);
  if (!plan.smooth) {
    scroller.scrollTo({ top: plan.targetTop, behavior: "auto" });
    return;
  }
  if (plan.jumpTop !== scroller.scrollTop) scroller.scrollTo({ top: plan.jumpTop, behavior: "auto" });
  requestAnimationFrame(() => scroller.scrollTo({ top: plan.targetTop, behavior: "smooth" }));
}

export function contentTopForElement(element: Element, offset = 12): number | null {
  const scroller = getContentScrollElement();
  if (!scroller) return null;
  return scroller.scrollTop + element.getBoundingClientRect().top - scroller.getBoundingClientRect().top - offset;
}
