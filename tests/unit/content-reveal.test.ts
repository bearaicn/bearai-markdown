import { describe, expect, it } from "vitest";
import { createRevealPlan } from "../../src/lib/utils/contentReveal";

describe("createRevealPlan", () => {
  it("only animates a short final nudge for distant targets", () => {
    expect(createRevealPlan(100, 3100, 800, false)).toEqual({
      jumpTop: 3052,
      targetTop: 3100,
      smooth: true,
    });
    expect(createRevealPlan(3100, 100, 800, false)).toEqual({
      jumpTop: 148,
      targetTop: 100,
      smooth: true,
    });
  });

  it("uses one short smooth move nearby and respects reduced motion", () => {
    expect(createRevealPlan(100, 180, 800, false)).toEqual({
      jumpTop: 100,
      targetTop: 180,
      smooth: true,
    });
    expect(createRevealPlan(100, 3100, 800, true)).toEqual({
      jumpTop: 3100,
      targetTop: 3100,
      smooth: false,
    });
  });
});
