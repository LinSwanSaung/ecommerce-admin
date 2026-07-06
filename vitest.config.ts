import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // DOM APIs for component tests
    globals: true, // lets Testing Library auto-cleanup between tests
    setupFiles: "./vitest.setup.ts",
    css: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
