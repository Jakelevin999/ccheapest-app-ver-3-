'use client';

import {
  useEffect
} from 'react';

export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    function applyTheme() {
      const savedTheme =
        localStorage.getItem(
          'cheaperfind:theme'
        ) || 'System';

      if (
        savedTheme ===
        'System'
      ) {
        document.documentElement.removeAttribute(
          'data-theme'
        );
      } else {
        document.documentElement.setAttribute(
          'data-theme',
          savedTheme.toLowerCase()
        );
      }
    }

    applyTheme();

    window.addEventListener(
      'cheaperfind:theme-changed',
      applyTheme
    );

    return () => {
      window.removeEventListener(
        'cheaperfind:theme-changed',
        applyTheme
      );
    };
  }, []);

  return <>{children}</>;
}
