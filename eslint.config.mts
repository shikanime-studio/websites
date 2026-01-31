import config from "@shikanime-studio/eslint-config";
import { defineConfig } from "eslint/config";
import { browser, node } from "globals";

export default defineConfig(
  {
    extends: [...config.configs.astro],
    files: ["**/*.astro"],
  },
  {
    extends: [
      ...config.configs.base,
      ...config.configs.react,
      ...config.configs.tanstack,
    ],
    files: ["**/*.{js,mjs,ts,mts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...browser,
        ...node,
      },
      parserOptions: {
        project: null,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "18.3.1",
      },
    },
  },
  {
    extends: [...config.configs.tailwind],
    files: ["**/*.{css}"],
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
);
