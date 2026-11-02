import antfu from "@antfu/eslint-config";

export default antfu(
  {
    formatters: true,
    stylistic: false,
    jsx: {
      a11y: true,
    },
    react: {
      reactCompiler: true,
    },
  },
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.css", "**/*.json"],
    rules: {
      "format/prettier": "off",
      "jsonc/sort-keys": "off",
    },
  },
);
