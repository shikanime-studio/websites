import antfu from "@antfu/eslint-config";

export default antfu(
  {
    astro: true,
    formatters: true,
    stylistic: false,
  },
  {
    files: ["**/*.css", "**/*.json", "**/*.jsonc"],
    rules: {
      "format/prettier": "off",
      "jsonc/sort-keys": "off",
    },
  },
  {
    ignores: [".astro/**", "dist/**", ".wrangler/**"],
  },
);
