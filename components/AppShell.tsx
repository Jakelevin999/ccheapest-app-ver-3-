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
  { href: '/cart', label: 'Cart', icon: '🛒' }
];
const onboardKey = 'cheaperfind:onboarded';
const steps = [
  { title: 'Welcome to Cheap Finds', text: 'Find better prices, smarter alternatives, and products that fit the way you actually shop.' },
  { title: 'Sign up', text: 'Add your basic info so your account feels personal.' },
  { title: 'Add a profile picture', text: 'Tap the circle to make your profile yours.' },
  { title: 'Shop smarter', text: 'Search by description, link, or photo. Cheap Finds compares options and helps you pick better deals.' },
  { title: 'Swipe your style', text: 'Use Style like a shopping swipe deck. Skip what you hate, save or add what you like.' },
  { title: 'Plan trips faster', text: 'Travel pulls together flights, outfits, and useful accessories around your itinerary.' }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pfp, setPfp] = useState('');
  const [showOnboard, setShowOnboard] = useState(false);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const load = () => setPfp(localStorage.getItem('cheaperfind:pfp') || '');
    load();
    setShowOnboard(localStorage.getItem(onboardKey) !== 'yes');
    setReady(true);
    window.addEventListener('cheaperfind:pfp-changed', load);
    return () => window.removeEventListener('cheaperfind:pfp-changed', load);
  }, []);

  function nextStep() {
    if (step < steps.length - 1) setStep(step + 1);
    else finishOnboarding();
  }
  function prevStep() {
    if (step > 0) setStep(step - 1);
  }
  function finishOnboarding() {
    localStorage.setItem(onboardKey, 'yes');
    if (name.trim()) localStorage.setItem('cheaperfind:name', name.trim());
    if (phone.trim()) localStorage.setItem('cheaperfind:phone', phone.trim());
    setShowOnboard(false);
  }
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      localStorage.setItem('cheaperfind:pfp', data);
      setPfp(data);
      window.dispatchEvent(new Event('cheaperfind:pfp-changed'));
    };
    reader.readAsDataURL(file);
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    setTouchStart(null);
    if (diff < -55) nextStep();
    if (diff > 55) prevStep();
  }

  return <ThemeProvider>
    {ready && showOnboard && <div className="onboardingOverlay" onTouchStart={e=>setTouchStart(e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
      <div className="onboardingCard">
        <div className="onboardTop"><span className="brandMark">C</span><button type="button" onClick={finishOnboarding}>Skip</button></div>
        <div className="onboardDots">{steps.map((_, i)=><span key={i} className={i===step ? 'active' : ''} />)}</div>
        <div className="onboardBody">
          <h1>{steps[step].title}</h1>
          <p>{steps[step].text}</p>
          {step === 1 && <div className="onboardFields"><input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /><input className="input" placeholder="Phone number" inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)} /></div>}
          {step === 2 && <label className="onboardPhoto"><input type="file" accept="image/*" onChange={handlePhoto} />{pfp ? <img src={pfp} alt="Profile" /> : <span>👤</span>}</label>}
          {step >= 3 && <div className="onboardDemoIcon">{step === 3 ? '⌕' : step === 4 ? '🧥' : '✈'}</div>}
        </div>
        <div className="onboardBottom"><button type="button" className="onboardBack" onClick={prevStep} disabled={step===0}>←</button><button type="button" className="onboardNext" onClick={nextStep}>{step === steps.length - 1 ? 'Start' : '➜'}</button></div>
      </div>
    </div>}
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
        {tabs.map(tab => <Link key={tab.href} href={tab.href} className={`tab ${tab.center ? 'centerTab' : ''} ${pathname === tab.href || (tab.href === '/' && pathname === '/results') ? 'active' : ''}`}>
          <span>{tab.icon}</span><small>{tab.label}</small>
        </Link>)}
      </nav>
    </main>
  </ThemeProvider>;
}
