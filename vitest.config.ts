import { defineConfig } from "vitest/config";

// Standalone Vitest config (kept separate from vite.config.js so unit tests run
// without the SvelteKit plugin / SSR machinery). Targets the pure helpers under
// tests/unit.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
