import type { ReactNode } from 'react'
import type { Theme } from '../lib/db'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useEffect } from 'react'
import { ThemeContext } from '../hooks/useTheme'
import { settingsCollection } from '../lib/db'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: currentSettings } = useLiveQuery(q =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, 'ui'))
      .findOne(),
  )

  const themeValue = currentSettings?.theme as Theme | undefined

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
    if (currentSettings) {
      settingsCollection.update('ui', (draft) => {
        draft.theme = newTheme
      })
      return
    }

    if (!newTheme)
      return

    settingsCollection.insert({
      id: 'ui',
      theme: newTheme,
    })
  }

  return (
    <ThemeContext value={{ theme: themeValue, setTheme }}>
      {children}
    </ThemeContext>
  )
}
