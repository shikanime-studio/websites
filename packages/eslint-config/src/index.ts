import { defineConfig, globalIgnores } from "eslint/config";
import astroPlugin from "eslint-plugin-astro";
import { tanstackConfig as tanstack } from "@tanstack/eslint-config";
import markdown from "@eslint/markdown";
import json from "@eslint/json";
import eslint from "@eslint/js";
import css from "@eslint/css";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { tailwind4 } from "tailwind-csstree";
import tseslint from "typescript-eslint";

export const baseConfig = defineConfig(
  globalIgnores([
    "**/.devenv",
    "**/.direnv",
    "**/dist",
    "**/package-lock.json",
  ]),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
);

export const jsonConfig = defineConfig({
  plugins: { json },
  language: "json/json",
});

export const markdownConfig = defineConfig({
  plugins: { markdown },
  language: "markdown/commonmark",
});

export const reactConfig = defineConfig(
  reactPlugin.configs.flat["recommended"] ?? {},
  reactPlugin.configs.flat["jsx-runtime"] ?? {},
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
);

export const astroConfig = defineConfig(
  globalIgnores(["**/.astro"]),
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  astroPlugin.configs["flat/recommended"],
  astroPlugin.configs["flat/jsx-a11y-strict"],
);

export const tailwindConfig = defineConfig({
  plugins: {
    css,
  },
  language: "css/css",
  languageOptions: {
    customSyntax: tailwind4,
  },
});

export const tanstackConfig = defineConfig(tanstack);

export default {
  configs: {
    base: baseConfig,
    json: jsonConfig,
    markdown: markdownConfig,
    react: reactConfig,
    astro: astroConfig,
    tailwind: tailwindConfig,
    tanstack: tanstackConfig,
  },
};
