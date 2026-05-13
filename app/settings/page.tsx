'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileImage, setProfileImage] = useState('')

  const [showEmail, setShowEmail] = useState(true)
  const [showPhone, setShowPhone] = useState(false)

  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfileName(
          profile.full_name ||
            profile.username ||
            ''
        )

        setProfileEmail(profile.email || '')

        setProfilePhone(profile.phone || '')

        setProfileImage(
          profile.profile_image ||
            profile.avatar_url ||
            ''
        )

        setShowEmail(
          profile.show_email ?? true
        )

        setShowPhone(
          profile.show_phone ?? false
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
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('profiles')
      .upsert({
        id: user.id,

        full_name: profileName,
        username: profileName,

        email: profileEmail,
        phone: profilePhone,

        profile_image: profileImage,
        avatar_url: profileImage,

        show_email: showEmail,
        show_phone: showPhone
      })

    if (newPassword.trim()) {
      await supabase.auth.updateUser({
        password: newPassword
      })
    }

    setSaving(false)

    alert('Profile saved')
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Loading...
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        padding: '24px'
      }}
    >
      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          display: 'grid',
          gap: 24
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20
          }}
        >
          <label
            style={{
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <input
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={(e) => {
                const file =
                  e.target.files?.[0]

                if (!file) return

                const reader =
                  new FileReader()

                reader.onloadend = () => {
                  setProfileImage(
                    reader.result as string
                  )
                }

                reader.readAsDataURL(file)
              }}
            />

            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: '999px',
                overflow: 'hidden',
                background: '#222',
                border:
                  '3px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt='profile'
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 13,
                    opacity: 0.7
                  }}
                >
                  Add Photo
                </span>
              )}
            </div>
          </label>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 42,
                fontWeight: 800
              }}
            >
              Settings
            </h1>

            <div
              style={{
                opacity: 0.65,
                marginTop: 6
              }}
            >
              Manage your account
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#141414',
            borderRadius: 28,
            padding: 24,
            display: 'grid',
            gap: 18,
            border:
              '1px solid rgba(255,255,255,0.08)'
          }}
        >
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

          <input
            className='input'
            placeholder='Email'
            value={profileEmail}
            onChange={(e) =>
              setProfileEmail(
                e.target.value
              )
            }
          />

          <input
            className='input'
            placeholder='Phone'
            value={profilePhone}
            onChange={(e) =>
              setProfilePhone(
                e.target.value
              )
            }
          />

          <div
            style={{
              display: 'grid',
              gap: 14,
              marginTop: 4
            }}
          >
            <label
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center'
              }}
            >
              Show email publicly

              <input
                type='checkbox'
                checked={showEmail}
                onChange={(e) =>
                  setShowEmail(
                    e.target.checked
                  )
                }
              />
            </label>

            <label
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center'
              }}
            >
              Show phone publicly

              <input
                type='checkbox'
                checked={showPhone}
                onChange={(e) =>
                  setShowPhone(
                    e.target.checked
                  )
                }
              />
            </label>
          </div>

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

          <button
            className='button'
            onClick={saveProfile}
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
