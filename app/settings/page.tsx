'use client';

import {
  useEffect,
  useState
} from 'react';

import { supabase } from '../../lib/supabase';

const spendingLevels = [
  'Saver',
  'Standard',
  'Baller'
];

const themes = [
  'Dark',
  'Light',
  'System'
];

export default function SettingsPage() {
  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [profileName, setProfileName] =
    useState('');

  const [profileEmail, setProfileEmail] =
    useState('');

  const [profilePhone, setProfilePhone] =
    useState('');

  const [profileImage, setProfileImage] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [showEmail, setShowEmail] =
    useState(false);

  const [showPhone, setShowPhone] =
    useState(false);

  const [spendingLevel, setSpendingLevel] =
    useState('Standard');

  const [theme, setTheme] =
    useState('System');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const {
        data: { user }
      } =
        await supabase.auth.getUser();

      if (!user) {
        window.location.href =
          '/login';

        return;
      }

      const { data: profile } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

      if (profile) {
        setProfileName(
          profile.full_name ||
            ''
        );

        setProfileEmail(
          profile.email || ''
        );

        setProfilePhone(
          profile.phone || ''
        );

        setProfileImage(
          profile.profile_image ||
            ''
        );
      }

      const savedTier =
        localStorage.getItem(
          'cheaperfind:priceTier'
        );

      if (savedTier) {
        setSpendingLevel(
          savedTier
        );
      }

      const savedTheme =
        localStorage.getItem(
          'cheaperfind:theme'
        );

      if (savedTheme) {
        setTheme(savedTheme);
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveProfile() {
    setSaving(true);

    const {
      data: { user }
    } =
      await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,

        full_name:
          profileName,

        email:
          profileEmail,

        phone:
          profilePhone,

        profile_image:
          profileImage
      });

    if (
      newPassword.trim()
    ) {
      await supabase.auth.updateUser(
        {
          password:
            newPassword
        }
      );
    }

    localStorage.setItem(
      'cheaperfind:priceTier',
      spendingLevel
    );

    window.dispatchEvent(
      new Event(
        'cheaperfind:priceTier-changed'
      )
    );

    localStorage.setItem(
      'cheaperfind:theme',
      theme
    );

    window.dispatchEvent(
      new Event(
        'cheaperfind:theme-changed'
      )
    );

    localStorage.setItem(
      'cheaperfind:pfp',
      profileImage
    );

    window.dispatchEvent(
      new Event(
        'cheaperfind:pfp-changed'
      )
    );

    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Loading...
      </div>
    );
  }

  return (
    <section className='smallSettings'>
      <div className='card compactSettingsCard'>
        <label className='cleanProfileUpload'>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (!file) return;

              const reader =
                new FileReader();

              reader.onloadend =
                () => {
                  setProfileImage(
                    reader.result as string
                  );
                };

              reader.readAsDataURL(
                file
              );
            }}
          />

          {profileImage ? (
            <img
              src={profileImage}
              alt='profile'
            />
          ) : (
            <span>👤</span>
          )}
        </label>

        <div className='settingsStack'>
          <input
            className='input'
            placeholder='Full Name'
            value={profileName}
            onChange={(e) =>
              setProfileName(
                e.target.value
              )
            }
          />

          <div
            style={{
              position:'relative'
            }}
          >
            <input
              className='input'
              type={
                showEmail
                  ? 'text'
                  : 'password'
              }
              value={profileEmail}
              readOnly
            />

            <button
              type='button'
              onClick={() =>
                setShowEmail(
                  !showEmail
                )
              }
              style={{
                position:'absolute',
                right:14,
                top:'50%',
                transform:
                  'translateY(-50%)',
                border:'none',
                background:'transparent',
                color:'var(--muted)',
                fontWeight:700,
                cursor:'pointer'
              }}
            >
              {showEmail
                ? 'Hide'
                : 'Show'}
            </button>
          </div>

          <div
            style={{
              position:'relative'
            }}
          >
            <input
              className='input'
              type={
                showPhone
                  ? 'text'
                  : 'password'
              }
              value={profilePhone}
              readOnly
            />

            <button
              type='button'
              onClick={() =>
                setShowPhone(
                  !showPhone
                )
              }
              style={{
                position:'absolute',
                right:14,
                top:'50%',
                transform:
                  'translateY(-50%)',
                border:'none',
                background:'transparent',
                color:'var(--muted)',
                fontWeight:700,
                cursor:'pointer'
              }}
            >
              {showPhone
                ? 'Hide'
                : 'Show'}
            </button>
          </div>
        </div>
      </div>

      <div className='card compactSettingsCard'>
        <h2>
          Spending Level
        </h2>

        <div className='settingsButtonGrid'>
          {spendingLevels.map(
            (level) => (
              <button
                key={level}
                type='button'
                className={
                  spendingLevel ===
                  level
                    ? 'tierButton active'
                    : 'tierButton'
                }
                onClick={() =>
                  setSpendingLevel(
                    level
                  )
                }
              >
                {level}
              </button>
            )
          )}
        </div>
      </div>

      <div className='card compactSettingsCard'>
        <h2>Theme</h2>

        <div className='settingsButtonGrid'>
          {themes.map(
            (t) => (
              <button
                key={t}
                type='button'
                className={
                  theme === t
                    ? 'tierButton active'
                    : 'tierButton'
                }
                onClick={() =>
                  setTheme(t)
                }
              >
                {t}
              </button>
            )
          )}
        </div>
      </div>

      <div className='card compactSettingsCard'>
        <h2>
          Change Password
        </h2>

        <input
          className='input'
          type='password'
          placeholder='New Password'
          value={newPassword}
          onChange={(e) =>
            setNewPassword(
              e.target.value
            )
          }
        />
      </div>

      <button
        className='button'
        onClick={saveProfile}
        disabled={saving}
      >
        {saving
          ? 'Saving...'
          : 'Save Changes'}
      </button>
    </section>
  );
}
