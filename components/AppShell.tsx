'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './ThemeProvider';

const tabs = [
  { href: '/travel', label: 'Travel', icon: '✈' },
  { href: '/style', label: 'Style', icon: '🧥' },
  { href: '/', label: 'Shop', icon: '⌕', center: true },
  { href: '/favorites', label: 'Saved', icon: '♡' },
  { href: '/cart', label: 'Cart', icon: '🛒' }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <ThemeProvider>
    <main className="appShell">
      <header className="topbar cleanTopbar">
        <Link href="/" className="brand"><span className="brandMark">C</span><span>CheaperFind</span></Link>
        <Link href="/settings" className="roundIcon">⚙</Link>
      </header>
      <div className="screen">{children}</div>
      <nav className="tabbar cleanTabbar" aria-label="Main navigation">
        {tabs.map(tab => <Link key={tab.href} href={tab.href} className={`tab ${tab.center ? 'centerTab' : ''} ${pathname === tab.href || (tab.href === '/' && pathname === '/results') ? 'active' : ''}`}>
          <span>{tab.icon}</span><small>{tab.label}</small>
        </Link>)}
      </nav>
    </main>
  </ThemeProvider>;
}
