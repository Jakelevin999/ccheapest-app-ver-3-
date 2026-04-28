'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './ThemeProvider';

const tabs = [
  { href: '/', label: 'Search', icon: '⌕' },
  { href: '/purchases', label: 'Purchases', icon: '🛍' },
  { href: '/travel', label: 'Travel', icon: '✈' },
  { href: '/style', label: 'Style', icon: '✦' },
  { href: '/favorites', label: 'Favorites', icon: '♡' },
  { href: '/settings', label: 'Settings', icon: '⚙' }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <ThemeProvider>
    <main className="appShell">
      <header className="topbar">
        <Link href="/" className="brand"><span className="brandMark">C</span><span>CheaperFind</span></Link>
        <span className="statusPill">Beta MVP</span>
      </header>
      <div className="screen">{children}</div>
      <nav className="tabbar" aria-label="Main navigation">
        {tabs.map(tab => <Link key={tab.href} href={tab.href} className={`tab ${pathname === tab.href ? 'active' : ''}`}>
          <span>{tab.icon}</span><small>{tab.label}</small>
        </Link>)}
      </nav>
    </main>
  </ThemeProvider>;
}
