'use client'

import { useState } from 'react'
import { signUp } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

const buttonStyle = {
  width: '100%',
  height: '56px',
  borderRadius: '18px',
  border: 'none',
  background: '#000',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer'
} as const

const inputStyle = {
  width: '100%',
  height: '56px',
  borderRadius: '18px',
  border: '1px solid #ddd',
  padding: '0 18px',
  fontSize: '16px',
  background: '#fff',
  color: '#111',
  caretColor: '#111'
} as const

const titleStyle = {
  fontSize: '56px',
  lineHeight: 0.9,
  fontWeight: 800,
  marginBottom: 12
} as const

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
    <h1 style={titleStyle}>Welcome to CheaperFind</h1>

    <button
      style={buttonStyle}
      onClick={() => setStep(1)}
    >
      Continue
    </button>

    <button
      style={{
        background: 'transparent',
        border: 'none',
        color: '#666',
        fontSize: '15px',
        cursor: 'pointer',
        marginTop: '-6px'
      }}
      onClick={() => {
        window.location.href = '/login'
      }}
    >
      Already have an account? Login
    </button>
  </>
)}

        {step === 1 && (
          <>
            <h1 style={titleStyle}>Create Account</h1>

            <input
              style={inputStyle}
              placeholder='Full name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              style={inputStyle}
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={inputStyle}
              placeholder='Phone'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              style={inputStyle}
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              style={{
                ...buttonStyle,
                opacity: signupValid ? 1 : 0.4,
                pointerEvents: signupValid ? 'auto' : 'none'
              }}
              disabled={!signupValid}
              onClick={() => {
                if (!signupValid) return
                setStep(2)
              }}
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  )
}
