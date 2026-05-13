'use client'

import { useState } from 'react'
import { signUp } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [profileImage, setProfileImage] = useState('')
  const [gender, setGender] = useState('')
  const [spending, setSpending] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])

  const signupValid =
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    password.trim()

  const photoValid = profileImage.trim()
  const genderValid = gender.trim()
  const spendingValid = spending.trim()
  const stylesValid = selectedStyles.length > 0

  function toggleStyle(style: string) {
    setSelectedStyles(current =>
      current.includes(style)
        ? current.filter(x => x !== style)
        : [...current, style]
    )
  }

  async function finishOnboarding() {
    if (loading) return

    try {
      setLoading(true)

      const { data, error } = await signUp(email, password)

      if (error || !data?.user) {
        alert('Signup failed')
        return
      }

      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
        email,
        phone,
        profile_image: profileImage,
        gender,
        spending_tier: spending,
        style_preferences: selectedStyles,
        onboarding_complete: true
      })

      localStorage.setItem(
        'cheaperfind:onboardingComplete',
        'true'
      )

      window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }

  return (
   <div
  style={{
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    background: '#f5f5f7',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    overflowY: 'auto'
  }}
>
     <div
  style={{
    width: '100%',
    maxWidth: 560,
    display: 'grid',
    gap: 22,
    background: '#fff',
    padding: '40px',
    borderRadius: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
  }}
>
        {step === 0 && (
          <>
            <h1>Welcome to CheaperFind</h1>

            <button
              className='button'
              onClick={() => setStep(1)}
            >
              Continue
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Create Account</h1>

            <input
              className='input'
              placeholder='Full name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className='input'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className='input'
              placeholder='Phone'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className='input'
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className='button'
              disabled={!signupValid}
              onClick={() => {
                if (!signupValid) return
                setStep(2)
              }}
              style={{
                opacity: signupValid ? 1 : 0.4,
                pointerEvents: signupValid ? 'auto' : 'none'
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Add Profile Photo</h1>

            <input
              type='file'
              accept='image/*'
              onChange={(e) => {
                const file = e.target.files?.[0]

                if (!file) return

                const reader = new FileReader()

                reader.onloadend = () => {
                  setProfileImage(reader.result as string)
                }

                reader.readAsDataURL(file)
              }}
            />

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

            <button
              className='button'
              disabled={!photoValid}
              onClick={() => {
                if (!photoValid) return
                setStep(3)
              }}
              style={{
                opacity: photoValid ? 1 : 0.4,
                pointerEvents: photoValid ? 'auto' : 'none'
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Select Gender</h1>

            {['Mens', 'Womens', 'Unisex'].map(item => (
              <button
                key={item}
                className='button'
                onClick={() => setGender(item)}
              >
                {item}
              </button>
            ))}

            <button
              className='button'
              disabled={!genderValid}
              onClick={() => {
                if (!genderValid) return
                setStep(4)
              }}
              style={{
                opacity: genderValid ? 1 : 0.4,
                pointerEvents: genderValid ? 'auto' : 'none'
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h1>Select Spending Tier</h1>

            {['Saver', 'Standard', 'Baller'].map(item => (
              <button
                key={item}
                className='button'
                onClick={() => setSpending(item)}
              >
                {item}
              </button>
            ))}

            <button
              className='button'
              disabled={!spendingValid}
              onClick={() => {
                if (!spendingValid) return
                setStep(5)
              }}
              style={{
                opacity: spendingValid ? 1 : 0.4,
                pointerEvents: spendingValid ? 'auto' : 'none'
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <h1>Select Styles</h1>

            {[
              'Streetwear',
              'Minimal',
              'Luxury',
              'Vintage'
            ].map(style => (
              <button
                key={style}
                className='button'
                onClick={() => toggleStyle(style)}
              >
                {style}
              </button>
            ))}

            <button
              className='button'
              disabled={!stylesValid}
              onClick={() => {
                if (!stylesValid) return
                setStep(6)
              }}
              style={{
                opacity: stylesValid ? 1 : 0.4,
                pointerEvents: stylesValid ? 'auto' : 'none'
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 6 && (
          <>
            <h1>Finish</h1>

            <button
              className='button'
              onClick={finishOnboarding}
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Start Shopping'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
