'use client';

import Link from 'next/link';
import {
  useEffect,
  useState
} from 'react';

import { usePathname } from 'next/navigation';

import { ThemeProvider } from './ThemeProvider';

import { supabase } from '../lib/supabase';

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
    let channel: any;

    async function loadProfile() {
      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

      const image =
        profile?.profile_image ||
        profile?.avatar_url ||
        '';

      setPfp(image);
    }

    async function setupRealtime() {
      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel(
          'profile-changes'
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          () => {
            loadProfile();
          }
        )
        .subscribe();
    }

    loadProfile();

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
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
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div className='profileBubble'>
              {pfp ? (
                <img
                  src={pfp}
                  alt='Profile'
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius:
                      '999px',
                    objectFit:
                      'cover',
                    display:
                      'block'
                  }}
                />
              ) : (
                <span>
                  👤
                </span>
              )}
            </div>

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
