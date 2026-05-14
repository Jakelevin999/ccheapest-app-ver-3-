'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

type ThemeMode =
  | 'light'
  | 'dark'
  | 'system';

type ThemeContextType = {
  theme: ThemeMode;

  setTheme: (
    theme: ThemeMode
  ) => void;
};

const ThemeContext =
  createContext<ThemeContextType>(
    {
      theme: 'system',

      setTheme: () => {}
    }
  );

export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemeMode>(
      'system'
    );

  useEffect(() => {
    const saved =
      localStorage.getItem(
        'cheaperfind:theme'
      ) as ThemeMode | null;

    if (
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'system'
    ) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    function applyTheme() {
      const root =
        document.documentElement;

      if (
        theme === 'system'
      ) {
        const prefersDark =
          window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;

        root.setAttribute(
          'data-theme',
          prefersDark
            ? 'dark'
            : 'light'
        );
      }

      else {
        root.setAttribute(
          'data-theme',
          theme
        );
      }

      localStorage.setItem(
        'cheaperfind:theme',
        theme
      );

      window.dispatchEvent(
        new Event(
          'cheaperfind:theme-changed'
        )
      );
    }

    applyTheme();

    const media =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      );

    const listener = () => {
      if (
        theme === 'system'
      ) {
        applyTheme();
      }
    };

    media.addEventListener(
      'change',
      listener
    );

    return () => {
      media.removeEventListener(
        'change',
        listener
      );
    };
  }, [theme]);

  function setTheme(
    next: ThemeMode
  ) {
    setThemeState(next);
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
  );
}

export function useTheme() {
  return useContext(
    ThemeContext
  );
}
