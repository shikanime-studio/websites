import antfu from "@antfu/eslint-config";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";

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
    ignores: ["dist/**", ".wrangler/**", ".tanstack/**", ".output/**"],
  },
  {
    files: ["**/*.css", "**/*.json", "**/*.jsonc"],
    rules: {
      "format/prettier": "off",
      "jsonc/sort-keys": "off",
    },
  },
  {
    files: ["**/routeTree.gen.ts"],
    rules: {
      "eslint-comments/no-unlimited-disable": "off",
    },
  },
  {
    files: ["**/routes/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["**/routes/consent.tsx"],
    rules: {
      // tsc's TS4111 requires bracket access on index-signature records.
      "dot-notation": "off",
    },
  },
  ...pluginQuery.configs["flat/recommended"],
  ...pluginRouter.configs["flat/recommended"],
);
