import { describe, expect, it } from "vitest";
import { clampPanelWidth } from "../../src/lib/stores/panelLayout";

describe("panel width", () => {
  it("clamps and rounds dragged widths", () => {
    expect(clampPanelWidth(199.4, 220, 520)).toBe(220);
    expect(clampPanelWidth(327.6, 220, 520)).toBe(328);
    expect(clampPanelWidth(900, 220, 520)).toBe(520);
  });
});
