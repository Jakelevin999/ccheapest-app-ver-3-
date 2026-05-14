'use client'

import { useState } from 'react'
import { signUp } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

const buttonStyle = {
  width:'100%',
  height:'56px',
  borderRadius:'18px',
  border:'none',
  background:'#111',
  color:'#fff',
  fontSize:'16px',
  fontWeight:700,
  cursor:'pointer'
} as const

const inputStyle = {
  width:'100%',
  height:'56px',
  borderRadius:'18px',
  border:'1px solid #ddd',
  padding:'0 18px',
  fontSize:'16px',
  background:'#fff',
  color:'#111111',
  WebkitTextFillColor:'#111111',
  caretColor:'#111111',
  outline:'none'
} as const

const titleStyle = {
  fontSize:'54px',
  lineHeight:0.92,
  fontWeight:800,
  margin:0,
  color:'#111'
} as const

export default function OnboardingPage() {
  const [step,setStep] =
    useState(0)

  const [loading,setLoading] =
    useState(false)

  const [name,setName] =
    useState('')

  const [email,setEmail] =
    useState('')

  const [phone,setPhone] =
    useState('')

  const [password,setPassword] =
    useState('')

  const [profileImage,setProfileImage] =
    useState('')

  const [gender,setGender] =
    useState('')

  const [spending,setSpending] =
    useState('')

  const [
    selectedStyles,
    setSelectedStyles
  ] = useState<string[]>([])

  const signupValid =
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    password.trim()

  function toggleStyle(
    style:string
  ) {
    setSelectedStyles(
      current =>
        current.includes(style)
          ? current.filter(
              x => x !== style
            )
          : [
              ...current,
              style
            ]
    )
  }

  async function finishOnboarding() {
    if (loading) return

    try {
      setLoading(true)

      const {
        data,
        error
      } =
        await signUp(
          email,
          password
        )

      if (
        error ||
        !data?.user
      ) {
        alert(
          'Signup failed'
        )

        return
      }

      await supabase
        .from('profiles')
        .upsert({
          id:data.user.id,

          full_name:name,

          email,

          phone,

          profile_image:
            profileImage,

          gender,

          spending_tier:
            spending,

          style_preferences:
            selectedStyles,

          onboarding_complete:true
        })

      localStorage.setItem(
        'cheaperfind:onboardingComplete',
        'true'
      )

      localStorage.setItem(
        'cheaperfind:priceTier',
        spending
      )

      window.location.href =
        '/'
    }

    finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position:'fixed',
        inset:0,
        background:'#f5f5f7',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:'24px',
        overflowY:'auto'
      }}
    >
      <div
        style={{
          width:'100%',
          maxWidth:560,
          background:'#fff',
          borderRadius:'32px',
          padding:'40px',
          display:'grid',
          gap:22,
          boxShadow:
            '0 10px 40px rgba(0,0,0,0.08)'
        }}
      >
        {step === 0 && (
          <>
            <h1 style={titleStyle}>
              Welcome to
              CheaperFind
            </h1>

            <button
              style={buttonStyle}
              onClick={() =>
                setStep(1)
              }
            >
              Continue
            </button>

            <button
              style={{
                background:'transparent',
                border:'none',
                color:'#666',
                fontSize:'15px',
                cursor:'pointer',
                marginTop:'-6px'
              }}
              onClick={() => {
                window.location.href =
                  '/login'
              }}
            >
              Already have an
              account? Login
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h1 style={titleStyle}>
              Create Account
            </h1>

            <input
              style={inputStyle}
              placeholder='Full name'
              value={name}
              onChange={(e)=>
                setName(
                  e.target.value
                )
              }
            />

            <input
              style={inputStyle}
              placeholder='Email'
              value={email}
              onChange={(e)=>
                setEmail(
                  e.target.value
                )
              }
            />

            <input
              style={inputStyle}
              placeholder='Phone'
              value={phone}
              onChange={(e)=>
                setPhone(
                  e.target.value
                )
              }
            />

            <input
              style={inputStyle}
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e)=>
                setPassword(
                  e.target.value
                )
              }
            />

            <button
              style={{
                ...buttonStyle,
                opacity:
                  signupValid
                    ? 1
                    : 0.4,
                pointerEvents:
                  signupValid
                    ? 'auto'
                    : 'none'
              }}
              onClick={() =>
                setStep(2)
              }
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={titleStyle}>
              Add Profile Photo
            </h1>

            <label
              style={{
                width:120,
                height:120,
                borderRadius:'999px',
                background:'#f1f1f3',
                border:'1px solid #ddd',
                overflow:'hidden',
                cursor:'pointer',
                display:'grid',
                placeItems:'center',
                margin:'0 auto'
              }}
            >
              <input
                type='file'
                accept='image/*'
                style={{
                  display:'none'
                }}
                onChange={(e) => {
                  const file =
                    e.target
                      .files?.[0]

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
                  src={
                    profileImage
                  }
                  alt='profile'
                  style={{
                    width:'100%',
                    height:'100%',
                    objectFit:'cover'
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize:42
                  }}
                >
                  👤
                </span>
              )}
            </label>

            <button
              style={{
                ...buttonStyle,
                opacity:
                  profileImage
                    ? 1
                    : 0.4,
                pointerEvents:
                  profileImage
                    ? 'auto'
                    : 'none'
              }}
              onClick={() =>
                setStep(3)
              }
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={titleStyle}>
              Select Gender
            </h1>

            <div
              style={{
                display:'grid',
                gap:12
              }}
            >
              {[
                'Male',
                'Female',
                'Other'
              ].map((g) => (
                <button
                  key={g}
                  style={{
                    ...buttonStyle,
                    background:
                      gender === g
                        ? '#111'
                        : '#f1f1f3',
                    color:
                      gender === g
                        ? '#fff'
                        : '#111'
                  }}
                  onClick={() =>
                    setGender(g)
                  }
                >
                  {g}
                </button>
              ))}
            </div>

            <button
              style={{
                ...buttonStyle,
                opacity:
                  gender
                    ? 1
                    : 0.4,
                pointerEvents:
                  gender
                    ? 'auto'
                    : 'none'
              }}
              onClick={() =>
                setStep(4)
              }
            >
              Continue
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h1 style={titleStyle}>
              Spending Level
            </h1>

            <div
              style={{
                display:'grid',
                gap:12
              }}
            >
              {[
                'Saver',
                'Standard',
                'Baller'
              ].map((tier) => (
                <button
                  key={tier}
                  style={{
                    ...buttonStyle,
                    background:
                      spending === tier
                        ? '#111'
                        : '#f1f1f3',
                    color:
                      spending === tier
                        ? '#fff'
                        : '#111'
                  }}
                  onClick={() =>
                    setSpending(
                      tier
                    )
                  }
                >
                  {tier}
                </button>
              ))}
            </div>

            <button
              style={{
                ...buttonStyle,
                opacity:
                  spending
                    ? 1
                    : 0.4,
                pointerEvents:
                  spending
                    ? 'auto'
                    : 'none'
              }}
              onClick={() =>
                setStep(5)
              }
            >
              Continue
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <h1 style={titleStyle}>
              Pick Your Style
            </h1>

            <div
              style={{
                display:'flex',
                flexWrap:'wrap',
                gap:10
              }}
            >
              {[
                'Streetwear',
                'Minimal',
                'Luxury',
                'Vintage',
                'Sporty',
                'Designer'
              ].map((style) => (
                <button
                  key={style}
                  style={{
                    ...buttonStyle,
                    width:'auto',
                    padding:'0 20px',
                    background:
                      selectedStyles.includes(
                        style
                      )
                        ? '#111'
                        : '#f1f1f3',
                    color:
                      selectedStyles.includes(
                        style
                      )
                        ? '#fff'
                        : '#111'
                  }}
                  onClick={() =>
                    toggleStyle(
                      style
                    )
                  }
                >
                  {style}
                </button>
              ))}
            </div>

            <button
              style={buttonStyle}
              onClick={
                finishOnboarding
              }
            >
              {loading
                ? 'Creating Account...'
                : 'Finish'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
