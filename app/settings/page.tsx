'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '../../components/ThemeProvider';

const priceTiers = ['Saver','Standard','Baller'];
const priceTierKey = 'cheaperfind:priceTier';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [preview, setPreview] = useState<string | null>(null);
  const [priceTier, setPriceTier] = useState('Standard');
  const [showDupes, setShowDupes] = useState(true);
  const [resale, setResale] = useState(false);

  useEffect(() => {
    setPreview(localStorage.getItem('cheaperfind:pfp'));
    const saved = localStorage.getItem(priceTierKey);
    if (saved && priceTiers.includes(saved)) setPriceTier(saved);
  }, []);

  function setDefaultTier(tier:string) {
    setPriceTier(tier);
    localStorage.setItem(priceTierKey, tier);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      localStorage.setItem('cheaperfind:pfp', data);
      window.dispatchEvent(new Event('cheaperfind:pfp-changed'));
      setPreview(data);
    };
    reader.readAsDataURL(file);
  }

  return <section className="settingsPage cleanSettings">
    <h1>Settings</h1>

    <div className="card settingsCard cleanSettingsCard compactSettingsCard">
      <div className="settingsHeaderRow">
        <div><h2>Profile</h2><p className="muted">Add or change your profile picture.</p></div>
        <label className="profileUploadBox cleanProfileUpload"><input type="file" accept="image/*" onChange={handleUpload} />{preview ? <img src={preview} alt="Profile" /> : <span>👤</span>}</label>
      </div>
    </div>

    <div className="card settingsCard cleanSettingsCard compactSettingsCard">
      <h2>Appearance</h2>
      <div className="tierOptions compactTierOptions">{(['light','dark','system'] as const).map(option => <button type="button" key={option} className={theme === option ? 'tierButton active' : 'tierButton'} onClick={() => setTheme(option)}>{option}</button>)}</div>
    </div>

    <div className="card settingsCard cleanSettingsCard compactSettingsCard">
      <h2>Default Spending</h2>
      <p className="muted">Applies automatically to Shop and Style.</p>
      <div className="tierOptions compactTierOptions">{priceTiers.map(t => <button type="button" key={t} className={priceTier === t ? 'tierButton active' : 'tierButton'} onClick={() => setDefaultTier(t)}>{t}</button>)}</div>
    </div>

    <div className="card settingsCard cleanSettingsCard compactSettingsCard">
      <h2>Search Preferences</h2>
      <label className="settingRow cleanSettingRow"><span>Show similar dupes</span><input type="checkbox" checked={showDupes} onChange={e=>setShowDupes(e.target.checked)} /></label>
      <label className="settingRow cleanSettingRow"><span>Include resale marketplaces</span><input type="checkbox" checked={resale} onChange={e=>setResale(e.target.checked)} /></label>
    </div>
  </section>;
}
