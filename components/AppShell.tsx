'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './ThemeProvider';

const tabs = [
  { href: '/travel', label: 'Travel', icon: '✈' },
  { href: '/style', label: 'Style', icon: '🧥' },
  { href: '/', label: 'Shop', icon: '⌕', center: true },
  { href: '/favorites', label: 'Saved', icon: '♡' },
  { href: '/cart', label: 'Cart', icon: '🛒', cart: true }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pfp, setPfp] = useState('');
  const [cartGlow, setCartGlow] = useState(false);

  useEffect(() => {
    const load = () => setPfp(localStorage.getItem('cheaperfind:pfp') || '');
    load();
    window.addEventListener('cheaperfind:pfp-changed', load);
    return () => window.removeEventListener('cheaperfind:pfp-changed', load);
  }, []);

  useEffect(() => {
    let glowTimer: ReturnType<typeof setTimeout> | null = null;
    function illuminateCart() {
      setCartGlow(true);
      if (glowTimer) clearTimeout(glowTimer);
      glowTimer = setTimeout(() => setCartGlow(false), 1200);
    }
    window.addEventListener('cheaperfind:cart-changed', illuminateCart);
    return () => {
      window.removeEventListener('cheaperfind:cart-changed', illuminateCart);
      if (glowTimer) clearTimeout(glowTimer);
    };
  }, []);

  return <ThemeProvider>
    <main className="appShell">
      <header className="topbar cleanTopbar">
        <Link href="/" className="brand"><span className="brandMark">C</span><span>CheaperFind</span></Link>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="profileBubble">{pfp ? <img src={pfp} alt="Profile" /> : <span>👤</span>}</div>
          <Link href="/settings" className="roundIcon gearIcon">⚙</Link>
        </div>
      </header>
      <div className="screen">{children}</div>
      <nav className="tabbar cleanTabbar" aria-label="Main navigation">
        {tabs.map(tab => <Link key={tab.href} href={tab.href} className={`tab ${tab.center ? 'centerTab' : ''} ${tab.cart && cartGlow ? 'cartGlow' : ''} ${pathname === tab.href || (tab.href === '/' && pathname === '/results') ? 'active' : ''}`}>
          <span>{tab.icon}</span><small>{tab.label}</small>
        </Link>)}
      </nav>
    </main>
  </ThemeProvider>;
}
