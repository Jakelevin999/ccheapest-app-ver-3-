Replace your ENTIRE app/settings/page.tsx with this:

'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
export default function SettingsPage() {
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
  const [hideEmail, setHideEmail] =
    useState(true)
  const [hidePhone, setHidePhone] =
    useState(true)
  const [newPassword, setNewPassword] =
    useState('')
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
            profile.username ||
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
            profile.avatar_url ||
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
    const updates = {
      id: user.id,
      full_name: profileName,
      username: profileName,
      email: profileEmail,
      phone: profilePhone,
      profile_image: profileImage,
      avatar_url: profileImage
    }
    const { error } =
      await supabase
        .from('profiles')
        .upsert(updates, {
          onConflict: 'id'
        })
    if (error) {
      console.error(error)
      alert(error.message)
      setSaving(false)
      return
    }
    if (newPassword.trim()) {
      const {
        error: passwordError
      } =
        await supabase.auth.updateUser(
          {
            password: newPassword
          }
        )
      if (passwordError) {
        alert(
          passwordError.message
        )
      }
    }
    setSaving(false)
    window.location.reload()
  }
  if (loading) {
    return (
      <div style={{ padding: 40 }}>
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
              reader.onloadend = () => {
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
              position: 'relative'
            }}
          >
            <input
              className='input'
              placeholder='Email'
              type={
                hideEmail
                  ? 'password'
                  : 'text'
              }
              value={profileEmail}
              onChange={(e) =>
                setProfileEmail(
                  e.target.value
                )
              }
            />
            <button
              type='button'
              onClick={() =>
                setHideEmail(
                  !hideEmail
                )
              }
              style={{
                position:
                  'absolute',
                right: 14,
                top: '50%',
                transform:
                  'translateY(-50%)',
                background:
                  'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {hideEmail
                ? '👁️'
                : '🙈'}
            </button>
          </div>
          <div
            style={{
              position: 'relative'
            }}
          >
            <input
              className='input'
              placeholder='Phone'
              type={
                hidePhone
                  ? 'password'
                  : 'text'
              }
              value={profilePhone}
              onChange={(e) =>
                setProfilePhone(
                  e.target.value
                )
              }
            />
            <button
              type='button'
              onClick={() =>
                setHidePhone(
                  !hidePhone
                )
              }
              style={{
                position:
                  'absolute',
                right: 14,
                top: '50%',
                transform:
                  'translateY(-50%)',
                background:
                  'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {hidePhone
                ? '👁️'
                : '🙈'}
            </button>
          </div>
        </div>
      </div>
      <div className='card compactSettingsCard'>
        <h2>
          Change Password
        </h2>
        <div className='settingsStack'>
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
