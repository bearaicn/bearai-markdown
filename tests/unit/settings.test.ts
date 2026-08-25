import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
});

describe("reader settings defaults", () => {
  beforeEach(() => storage.clear());

  it("enables TOC state and document session restoration by default", async () => {
    vi.resetModules();
    const { loadSettings } = await import("../../src/lib/stores/settings");

    const settings = loadSettings();

    expect(settings.rememberTocState).toBe(true);
    expect(settings.rememberOpenDocuments).toBe(true);
  });

  it("uses the new defaults when an older stored object lacks the fields", async () => {
    storage.set("mdhero-settings", JSON.stringify({ fontSize: 19 }));
    vi.resetModules();
    const { loadSettings } = await import("../../src/lib/stores/settings");

    const settings = loadSettings();

    expect(settings.rememberTocState).toBe(true);
    expect(settings.rememberOpenDocuments).toBe(true);
  });

  it("preserves an existing user's explicit disabled choices", async () => {
    storage.set(
      "mdhero-settings",
      JSON.stringify({ rememberTocState: false, rememberOpenDocuments: false }),
    );
    vi.resetModules();
    const { loadSettings } = await import("../../src/lib/stores/settings");

    const settings = loadSettings();

    expect(settings.rememberTocState).toBe(false);
    expect(settings.rememberOpenDocuments).toBe(false);
  });
});
