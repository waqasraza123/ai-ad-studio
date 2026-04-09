import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage"
    },
    environment: "jsdom",
    exclude: ["dist/**", "node_modules/**", "e2e/**"],
    include: ["src/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"]
  }
})
