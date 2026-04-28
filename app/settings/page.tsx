'use client';
import { useTheme } from '../../components/ThemeProvider';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return <section>
    <div className="pageHeader"><span className="badge">Personalize</span><h1>Settings</h1><p className="muted">Control the app appearance and basic preferences.</p></div>
    <div className="card settingsCard">
      <h2>Appearance</h2>
      <p className="muted">Choose light, dark, or match your phone/computer.</p>
      <div className="segmented">
        {(['light','dark','system'] as const).map(option => <button key={option} className={theme === option ? 'selected' : ''} onClick={() => setTheme(option)}>{option}</button>)}
      </div>
    </div>
    <div className="card settingsCard">
      <h2>Search preferences</h2>
      <label className="settingRow"><span>Prioritize cheapest item first</span><input type="checkbox" defaultChecked /></label>
      <label className="settingRow"><span>Show similar dupes</span><input type="checkbox" defaultChecked /></label>
      <label className="settingRow"><span>Include used/resale marketplaces</span><input type="checkbox" /></label>
    </div>
  </section>;
}
