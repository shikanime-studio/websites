import antfu from '@antfu/eslint-config'

export default antfu(
  {
    astro: true,
    formatters: true,
    jsx: {
      a11y: true,
    },
    react: {
      reactCompiler: true,
    },
  },
  {
    ignores: [
      '.astro/**',
      'dist/**',
      '.wrangler/**',
    ],
  },
)
