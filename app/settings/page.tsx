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
        setProfileName(profile.full_name || '')
        setProfileEmail(profile.email || '')
        setProfilePhone(profile.phone || '')
        setProfileImage(profile.profile_image || '')
        setShowEmail(profile.show_email ?? true)
        setShowPhone(profile.show_phone ?? false)
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
        email: profileEmail,
        phone: profilePhone,
        profile_image: profileImage,
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
    return <div style={{ padding: 40 }}>Loading...</div>
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        padding: '32px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#fff',
          borderRadius: 28,
          padding: 32,
          display: 'grid',
          gap: 18,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
        }}
      >
        <h1 style={{ margin: 0, fontSize: 48 }}>
          Settings
        </h1>

        {profileImage && (
          <img
            src={profileImage}
            alt='profile'
            style={{
              width: 120,
              height: 120,
              borderRadius: '999px',
              objectFit: 'cover'
            }}
          />
        )}

        <input
          className='input'
          placeholder='Profile Image URL'
          value={profileImage}
          onChange={(e) =>
            setProfileImage(e.target.value)
          }
        />

        <input
          className='input'
          placeholder='Full Name'
          value={profileName}
          onChange={(e) =>
            setProfileName(e.target.value)
          }
        />

        <input
          className='input'
          placeholder='Email'
          value={profileEmail}
          onChange={(e) =>
            setProfileEmail(e.target.value)
          }
        />

        <input
          className='input'
          placeholder='Phone'
          value={profilePhone}
          onChange={(e) =>
            setProfilePhone(e.target.value)
          }
        />

        <label
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}
        >
          <input
            type='checkbox'
            checked={showEmail}
            onChange={(e) =>
              setShowEmail(e.target.checked)
            }
          />

          Show email publicly
        </label>

        <label
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center'
          }}
        >
          <input
            type='checkbox'
            checked={showPhone}
            onChange={(e) =>
              setShowPhone(e.target.checked)
            }
          />

          Show phone publicly
        </label>

        <input
          className='input'
          type='password'
          placeholder='New Password'
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
        />

        <button
          className='button'
          onClick={saveProfile}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
