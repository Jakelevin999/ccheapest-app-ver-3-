'use client';

import Link from 'next/link';

import {
  useEffect,
  useState
} from 'react';

import {
  usePathname
} from 'next/navigation';

import {
  ThemeProvider
} from './ThemeProvider';

const tabs = [
  {
    href: '/travel',
    label: 'Travel',
    icon: '✈'
  },

  {
    href: '/style',
    label: 'Style',
    icon: '🧥'
  },

  {
    href: '/',
    label: 'Shop',
    icon: '⌕',
    center: true
  },

  {
    href: '/favorites',
    label: 'Saved',
    icon: '♡'
  },

  {
    href: '/cart',
    label: 'Cart',
    icon: '🛒'
  }
];

export default function AppShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname =
    usePathname();

  const [pfp, setPfp] =
    useState('');

  useEffect(() => {
    function loadProfilePic() {
      const saved =
        localStorage.getItem(
          'cheaperfind:pfp'
        ) || '';

      setPfp(saved);
    }

    loadProfilePic();

    window.addEventListener(
      'cheaperfind:pfp-changed',
      loadProfilePic
    );

    window.addEventListener(
      'storage',
      loadProfilePic
    );

    return () => {
      window.removeEventListener(
        'cheaperfind:pfp-changed',
        loadProfilePic
      );

      window.removeEventListener(
        'storage',
        loadProfilePic
      );
    };
  }, []);

  return (
    <ThemeProvider>
      <main className='appShell'>
        <header className='topbar cleanTopbar'>
          <Link
            href='/'
            className='brand'
          >
            <span className='brandMark'>
              C
            </span>

            <span>
              CheaperFind
            </span>
          </Link>

          <div
            style={{
              display:'flex',
              alignItems:'center',
              gap:10
            }}
          >
            <Link
              href='/settings'
              className='profileBubble'
            >
              {pfp ? (
                <img
                  src={pfp}
                  alt='Profile'
                  style={{
                    width:'100%',
                    height:'100%',
                    objectFit:'cover',
                    borderRadius:'999px'
                  }}
                />
              ) : (
                <span>👤</span>
              )}
            </Link>

            <Link
              href='/settings'
              className='roundIcon gearIcon'
            >
              ⚙
            </Link>
          </div>
        </header>

        <div className='screen'>
          {children}
        </div>

        <nav
          className='tabbar cleanTabbar'
          aria-label='Main navigation'
        >
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`tab ${
                tab.center
                  ? 'centerTab'
                  : ''
              } ${
                pathname ===
                  tab.href ||
                (tab.href ===
                  '/' &&
                  pathname ===
                    '/results')
                  ? 'active'
                  : ''
              }`}
            >
              <span>
                {tab.icon}
              </span>

              <small>
                {tab.label}
              </small>
            </Link>
          ))}
        </nav>
      </main>
    </ThemeProvider>
  );
}
