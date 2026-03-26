import antfu from '@antfu/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'

export default antfu(
  {
    formatters: true,
    jsx: {
      a11y: true,
    },
    react: {
      reactCompiler: true,
    },
  },
  ...pluginQuery.configs['flat/recommended'],
)
