'use client';
import { useState } from 'react';
import { useTheme } from '../../components/ThemeProvider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [preview, setPreview] = useState<string | null>(null);

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

  return <section>
    <div className="card settingsCard">
      <h2>Profile</h2>
      <div className="pfpUpload">
        <label className="profileUploadBox">
          <input type="file" accept="image/*" onChange={handleUpload} />
          {preview ? <img src={preview} /> : <span>Upload Profile Picture</span>}
        </label>
      </div>
    </div>

    <div className="card settingsCard">
      <h2>Appearance</h2>
      <div className="segmented">
        {(['light','dark','system'] as const).map(option => <button key={option} className={theme === option ? 'selected' : ''} onClick={() => setTheme(option)}>{option}</button>)}
      </div>
    </div>
  </section>;
}
