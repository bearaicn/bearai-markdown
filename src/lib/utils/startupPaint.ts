export type PaintScheduler = (callback: () => void) => void;

/** Wait until the browser has had enough frame boundaries to commit updated DOM. */
export async function waitForCommittedPaint(
  schedule: PaintScheduler = (callback) => requestAnimationFrame(callback),
): Promise<void> {
  await new Promise<void>((resolve) => schedule(resolve));
  await new Promise<void>((resolve) => schedule(resolve));
}
