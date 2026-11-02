import antfu from "@antfu/eslint-config";

export default antfu(
  {
    formatters: true,
    stylistic: false,
  },
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.json"],
    rules: {
      "format/prettier": "off",
      "jsonc/sort-keys": "off",
    },
  },
  {
    // Markdown is formatted by rumdl in treefmt; Prettier disagrees with it
    // about blank lines inside lists.
    files: ["**/*.md"],
    rules: {
      "format/prettier": "off",
    },
  },
);
