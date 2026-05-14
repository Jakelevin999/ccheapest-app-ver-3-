'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../components/ThemeProvider'

const spendingLevels = [
  'Saver',
  'Standard',
  'Baller'
]

export default function SettingsPage() {
  const {
    theme,
    setTheme
  } = useTheme()

  const [loading, setLoading] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [profileName, setProfileName] =
    useState('')

  const [profileEmail, setProfileEmail] =
    useState('')

  const [profilePhone, setProfilePhone] =
    useState('')

  const [profileImage, setProfileImage] =
    useState('')

  const [showEmail, setShowEmail] =
    useState(false)

  const [showPhone, setShowPhone] =
    useState(false)

  const [newPassword, setNewPassword] =
    useState('')

  const [priceTier, setPriceTier] =
    useState('Standard')

  useEffect(() => {
    const savedTier =
      localStorage.getItem(
        'cheaperfind:priceTier'
      )

    if (savedTier) {
      setPriceTier(savedTier)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'cheaperfind:priceTier',
      priceTier
    )

    window.dispatchEvent(
      new Event(
        'cheaperfind:priceTier-changed'
      )
    )
  }, [priceTier])

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)

      const {
        data: { user }
      } =
        await supabase.auth.getUser()

      if (!user) {
        window.location.href =
          '/login'

        return
      }

      const { data: profile } =
        await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

      if (profile) {
        setProfileName(
          profile.full_name ||
            ''
        )

        setProfileEmail(
          profile.email || ''
        )

        setProfilePhone(
          profile.phone || ''
        )

        setProfileImage(
          profile.profile_image ||
            ''
        )
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  async function saveProfile() {
    setSaving(true)

    const {
      data: { user }
    } =
      await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,

          full_name:
            profileName,

          email:
            profileEmail,

          phone:
            profilePhone,

          profile_image:
            profileImage
        },

        {
          onConflict:'id'
        }
      )

    localStorage.setItem(
      'cheaperfind:pfp',
      profileImage
    )

    window.dispatchEvent(
      new Event(
        'cheaperfind:pfp-changed'
      )
    )

    if (
      newPassword.trim()
    ) {
      await supabase.auth.updateUser(
        {
          password:
            newPassword
        }
      )
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ padding:40 }}>
        Loading...
      </div>
    )
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
                e.target.files?.[0]

              if (!file) return

              const reader =
                new FileReader()

              reader.onloadend =
                () => {
                  setProfileImage(
                    reader.result as string
                  )
                }

              reader.readAsDataURL(
                file
              )
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
              fontSize:12,
              fontWeight:700,
              color:'var(--muted)',
              marginBottom:-6,
              marginTop:2
            }}
          >
            Email
          </div>

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
              fontSize:12,
              fontWeight:700,
              color:'var(--muted)',
              marginBottom:-6,
              marginTop:2
            }}
          >
            Phone Number
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
                  priceTier ===
                  level
                    ? 'tierButton active'
                    : 'tierButton'
                }
                onClick={() =>
                  setPriceTier(
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
          {[
            'dark',
            'light',
            'system'
          ].map((mode) => (
            <button
              key={mode}
              type='button'
              className={
                theme === mode
                  ? 'tierButton active'
                  : 'tierButton'
              }
              onClick={() =>
                setTheme(
                  mode as any
                )
              }
            >
              {mode.charAt(0)
                .toUpperCase() +
                mode.slice(1)}
            </button>
          ))}
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
  )
}
