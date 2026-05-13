import AccountCenter from './AccountCenter'

export default function SettingsLayout() {
  return (
    <div style={{display:'grid',gap:20,paddingBottom:120}}>
      <AccountCenter />

      <div className='card settingsCard cleanSettingsCard compactSettingsCard'>
        <h2>Appearance</h2>
        <div className='settingsButtonGrid'>
          <button className='tierButton active'>light</button>
          <button className='tierButton'>dark</button>
          <button className='tierButton'>system</button>
        </div>
      </div>

      <div className='card settingsCard cleanSettingsCard compactSettingsCard'>
        <h2>Default Spending</h2>
        <div className='settingsButtonGrid'>
          <button className='tierButton'>Saver</button>
          <button className='tierButton active'>Standard</button>
          <button className='tierButton'>Baller</button>
        </div>
      </div>

      <div className='card settingsCard cleanSettingsCard compactSettingsCard'>
        <h2>Search Preferences</h2>

        <div className='settingsStack'>
          <label className='settingRow cleanSettingRow'>
            <span>Show similar dupes</span>
            <input type='checkbox' defaultChecked />
          </label>

          <label className='settingRow cleanSettingRow'>
            <span>Include resale marketplaces</span>
            <input type='checkbox' />
          </label>
        </div>
      </div>
    </div>
  )
}
