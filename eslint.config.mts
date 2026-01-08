import css from "@eslint/css";
import eslint from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import prettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import { tailwind4 } from "tailwind-csstree";
import tseslint from "typescript-eslint";
import { tanstackConfig } from "@tanstack/eslint-config";

export default defineConfig(
  globalIgnores([
    "**/.astro",
    "**/.devenv",
    "**/*.d.ts",
    "**/dist",
    "**/package-lock.json",
  ]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: "18.3.1",
      },
    },
  },
  {
    files: ["**/*.astro"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
      astro.configs["flat/recommended"],
      astro.configs["flat/jsx-a11y-strict"],
    ],
  },
  {
    files: ["**/*.json"],
    language: "json/json",
    extends: [json.configs.recommended],
  },
  {
    files: ["**/*.md"],
    language: "markdown/commonmark",
    extends: [markdown.configs.recommended],
  },
  {
    files: ["**/*.css"],
    plugins: {
      css,
    },
    language: "css/css",
    languageOptions: {
      customSyntax: tailwind4,
    },
  },
  prettier,
  tanstackConfig,
);
