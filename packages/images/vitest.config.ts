import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      // Tests, declarations and WGSL sources are not executable TypeScript.
      exclude: ["src/**/*.test.ts", "src/**/*.d.ts", "src/shaders/**"],
      reporter: ["text"],
    },
  },
});
