import {
    
    createContext,
    useContext,
    useEffect,
    useState
} from 'react'
import type {ReactNode} from 'react';

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'fade-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
            if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
        }
        return 'system'
    })

  useEffect(() => {
    const root = document.documentElement;
        localStorage.setItem(THEME_STORAGE_KEY, theme)

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = () => {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.setAttribute("data-theme", systemTheme);
      };

            applySystemTheme()
            mediaQuery.addEventListener('change', applySystemTheme)
            return () => mediaQuery.removeEventListener('change', applySystemTheme)
        } else {
            root.setAttribute('data-theme', theme)
        }
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }
  }, [theme]);

    const toggleTheme = () => {
        setThemeState((prev) => {
            if (prev === 'system') return 'dark'
            return prev === 'dark' ? 'light' : 'dark'
        })
    }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
