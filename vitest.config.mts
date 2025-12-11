import { defineConfig, defaultExclude } from "vitest/config";

export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [...defaultExclude, ".direnv/**"],
  },
});
