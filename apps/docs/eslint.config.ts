import antfu from "@antfu/eslint-config";

export default antfu(
  {
    formatters: false,
    react: true,
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
    ignores: [
      "build/**",
      ".docusaurus/**",
      "src/css/**",
      "src/worker-configuration.d.ts",
    ],
  },
);
