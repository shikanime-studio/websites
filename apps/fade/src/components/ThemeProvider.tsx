import type { ReactNode } from 'react'
import type { Theme } from '../lib/db'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useEffect } from 'react'
import { ThemeContext } from '../hooks/useTheme'
import { settingsCollection } from '../lib/db'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: theme } = useLiveQuery(q =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, 'theme'))
      .findOne(),
  )

  const themeValue = theme?.value as Theme | undefined

  useEffect(() => {
    const root = document.documentElement

    if (themeValue) {
      root.setAttribute('data-theme', themeValue)
    }
    else {
      root.removeAttribute('data-theme')
    }
  }, [themeValue])

  const setTheme = (newTheme?: Theme) => {
    if (!newTheme) {
      if (theme) {
        settingsCollection.delete('theme')
      }
      return
    }

    if (theme) {
      settingsCollection.update('theme', (draft) => {
        draft.value = newTheme
      })
    }
    else {
      settingsCollection.insert({
        id: 'theme',
        value: newTheme,
      })
    }
  }

  return (
    <ThemeContext value={{ theme: themeValue, setTheme }}>
      {children}
    </ThemeContext>
  )
}
