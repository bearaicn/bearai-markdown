import { describe, expect, it } from "vitest";
import { deserializeTocVisible, serializeTocVisible } from "../../src/lib/stores/toc";

describe("TOC visibility persistence", () => {
  it("restores a previously visible TOC", () => {
    expect(deserializeTocVisible(serializeTocVisible(true))).toBe(true);
  });

  it("keeps missing and explicitly hidden values closed", () => {
    expect(deserializeTocVisible(null)).toBe(false);
    expect(deserializeTocVisible(serializeTocVisible(false))).toBe(false);
  });
});
