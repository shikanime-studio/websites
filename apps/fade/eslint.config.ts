import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'

export default antfu(
  {
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
    yaml: false,
  },
  {
    ignores: [
      'dist/**',
      '.wrangler/**',
      '.tanstack/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    files: ['**/routeTree.gen.ts'],
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
    },
  },
  {
    files: ['**/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  ...pluginQuery.configs['flat/recommended'],
  ...pluginRouter.configs['flat/recommended'],
)
