import { describe, expect, it } from "vitest";
import { waitForCommittedPaint } from "../../src/lib/utils/startupPaint";

describe("startup paint gate", () => {
  it("waits for two animation frames before revealing the native window", async () => {
    const callbacks: Array<() => void> = [];
    let resolved = false;
    const waiting = waitForCommittedPaint((callback) => callbacks.push(callback)).then(() => { resolved = true; });

    expect(callbacks).toHaveLength(1);
    callbacks.shift()?.();
    await Promise.resolve();
    expect(resolved).toBe(false);
    expect(callbacks).toHaveLength(1);

    callbacks.shift()?.();
    await waiting;
    expect(resolved).toBe(true);
  });
});
