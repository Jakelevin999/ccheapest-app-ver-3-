'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '../../components/ThemeProvider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(localStorage.getItem('cheaperfind:pfp'));
  }, []);

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

  return <section className="settingsPage">
    <h1>Settings</h1>

    <div className="card settingsCard">
      <h2>Profile</h2>
      <label className="profileUploadBox">
        <input type="file" accept="image/*" onChange={handleUpload} />
        {preview ? <img src={preview} alt="Profile" /> : <span>👤</span>}
      </label>
      <p className="muted">Tap the circle to add or change your profile picture.</p>
    </div>

    <div className="card settingsCard">
      <h2>Appearance</h2>
      <div className="segmented">
        {(['light','dark','system'] as const).map(option => <button key={option} className={theme === option ? 'selected' : ''} onClick={() => setTheme(option)}>{option}</button>)}
      </div>
    </div>

    <div className="card settingsCard">
      <h2>Search Preferences</h2>
      <label className="settingRow"><span>Prioritize cheapest item first</span><input type="checkbox" defaultChecked /></label>
      <label className="settingRow"><span>Show similar dupes</span><input type="checkbox" defaultChecked /></label>
      <label className="settingRow"><span>Include used/resale marketplaces</span><input type="checkbox" /></label>
    </div>
  </section>;
}
