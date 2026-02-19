import antfu from '@antfu/eslint-config'

export default antfu(
  {
    astro: true,
    autoRenamePlugins: true,
    formatters: true,
    gitignore: true,
    jsdoc: true,
    jsonc: true,
    jsx: {
      a11y: true,
    },
    react: {
      reactCompiler: true,
    },
    regexp: true,
    stylistic: true,
    typescript: true,
  },
  {
    ignores: ['**/routeTree.gen.ts', '**/README.md'],
  },
  {
    files: ['apps/reiya/src/schema.ts'],
    rules: {
      'ts/no-use-before-define': 'off',
    },
  },
  {
    files: ['apps/fade/src/routes/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
)
