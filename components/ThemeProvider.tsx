'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import {
  usePathname
} from 'next/navigation'

type ThemeMode =
  | 'light'
  | 'dark'
  | 'system'

type ThemeContextType = {
  theme: ThemeMode

  setTheme: (
    theme: ThemeMode
  ) => void
}

const ThemeContext =
  createContext<ThemeContextType>(
    {
      theme: 'system',

      setTheme: () => {}
    }
  )

export function ThemeProvider({
  children
}: {
  children: React.ReactNode
}) {
  const pathname =
    usePathname()

  const [theme, setThemeState] =
    useState<ThemeMode>(
      'system'
    )

  const authPages = [
    '/onboarding',
    '/login',
    '/signup'
  ]

  const disableTheme =
    authPages.some((p) =>
      pathname.startsWith(p)
    )

  useEffect(() => {
    const saved =
      localStorage.getItem(
        'cheaperfind:theme'
      ) as ThemeMode | null

    if (
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'system'
    ) {
      setThemeState(saved)
    }
  }, [])

  useEffect(() => {
    const root =
      document.documentElement

    if (disableTheme) {
      root.removeAttribute(
        'data-theme'
      )

      return
    }

    if (
      theme === 'system'
    ) {
      const prefersDark =
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches

      root.setAttribute(
        'data-theme',
        prefersDark
          ? 'dark'
          : 'light'
      )
    }

    else {
      root.setAttribute(
        'data-theme',
        theme
      )
    }

    localStorage.setItem(
      'cheaperfind:theme',
      theme
    )

    window.dispatchEvent(
      new Event(
        'cheaperfind:theme-changed'
      )
    )
  }, [theme, disableTheme])

  function setTheme(
    next: ThemeMode
  ) {
    setThemeState(next)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(
    ThemeContext
  )
}
