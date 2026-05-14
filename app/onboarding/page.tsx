'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const completed =
      localStorage.getItem(
        'cheaperfind:onboardingComplete'
      )

    if (completed === 'true') {
      window.location.href = '/'
    }
  }, [])

  const signupValid =
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    password.trim()

  const photoValid =
    profileImage.trim()

  const genderValid =
    gender.trim()

  const spendingValid =
    spending.trim()

  const stylesValid =
    selectedStyles.length > 0

  function toggleStyle(style:string) {
    setSelectedStyles(current =>
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
      } = await signUp(
        email,
        password
      )

      if (
        error ||
        !data?.user
      ) {
        alert('Signup failed')
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

      window.location.href = '/'
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
        width:'100vw',
        height:'100vh',
        minHeight:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:24,
        background:'#f5f5f7',
        zIndex:999999,
        overflowY:'auto'
      }}
    >
      <div
        style={{
          width:'100%',
          maxWidth:520,
          display:'grid',
          gap:18,
          background:'#fff',
          padding:'34px',
          borderRadius:'30px',
          boxShadow:
            '0 10px 40px rgba(0,0,0,0.08)'
        }}
      >
        {step === 0 && (
          <>
            <h1
              style={{
                fontSize:56,
                lineHeight:0.9,
                margin:0
              }}
            >
              Welcome to
              CheaperFind
            </h1>

            <button
              className='button'
              onClick={() =>
                setStep(1)
              }
            >
              Continue
            </button>

            <button
              onClick={() => {
                window.location.href =
                  '/login'
              }}
              style={{
                background:'transparent',
                border:'none',
                color:'#666',
                cursor:'pointer',
                fontSize:15
              }}
            >
              Already have an account?
              Login
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Create Account</h1>

            <input
              className='input'
              style={{
                color:'#111',
                WebkitTextFillColor:'#111'
              }}
              placeholder='Full name'
              value={name}
              onChange={(e)=>
                setName(
                  e.target.value
                )
              }
            />

            <input
              className='input'
              style={{
                color:'#111',
                WebkitTextFillColor:'#111'
              }}
              placeholder='Email'
              value={email}
              onChange={(e)=>
                setEmail(
                  e.target.value
                )
              }
            />

            <input
              className='input'
              style={{
                color:'#111',
                WebkitTextFillColor:'#111'
              }}
              placeholder='Phone'
              value={phone}
              onChange={(e)=>
                setPhone(
                  e.target.value
                )
              }
            />

            <input
              className='input'
              type='password'
              style={{
                color:'#111',
                WebkitTextFillColor:'#111'
              }}
              placeholder='Password'
              value={password}
              onChange={(e)=>
                setPassword(
                  e.target.value
                )
              }
            />

            <button
              className='button'
              disabled={!signupValid}
              onClick={() =>
                setStep(2)
              }
              style={{
                opacity:
                  signupValid
                    ? 1
                    : 0.4
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Add Profile Photo</h1>

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
                  src={profileImage}
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
              className='button'
              disabled={!photoValid}
              onClick={() =>
                setStep(3)
              }
              style={{
                opacity:
                  photoValid
                    ? 1
                    : 0.4
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Select Gender</h1>

            <div
              style={{
                display:'grid',
                gap:10
              }}
            >
              {[
                'Mens',
                'Womens',
                'Unisex'
              ].map(item => (
                <button
                  key={item}
                  className='button'
                  onClick={() =>
                    setGender(item)
                  }
                  style={{
                    background:
                      gender === item
                        ? '#000'
                        : '#ececf1',
                    color:
                      gender === item
                        ? '#fff'
                        : '#111'
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              className='button'
              disabled={!genderValid}
              onClick={() =>
                setStep(4)
              }
              style={{
                opacity:
                  genderValid
                    ? 1
                    : 0.4
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h1>Select Spending Tier</h1>

            <div
              style={{
                display:'grid',
                gap:10
              }}
            >
              {[
                'Saver',
                'Standard',
                'Baller'
              ].map(item => (
                <button
                  key={item}
                  className='button'
                  onClick={() =>
                    setSpending(item)
                  }
                  style={{
                    background:
                      spending === item
                        ? '#000'
                        : '#ececf1',
                    color:
                      spending === item
                        ? '#fff'
                        : '#111'
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              className='button'
              disabled={!spendingValid}
              onClick={() =>
                setStep(5)
              }
              style={{
                opacity:
                  spendingValid
                    ? 1
                    : 0.4
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <h1>Select Styles</h1>

            <div
              style={{
                display:'grid',
                gap:10
              }}
            >
              {[
                'Streetwear',
                'Minimal',
                'Luxury',
                'Vintage'
              ].map(style => (
                <button
                  key={style}
                  className='button'
                  onClick={() =>
                    toggleStyle(style)
                  }
                  style={{
                    background:
                      selectedStyles.includes(
                        style
                      )
                        ? '#000'
                        : '#ececf1',
                    color:
                      selectedStyles.includes(
                        style
                      )
                        ? '#fff'
                        : '#111'
                  }}
                >
                  {style}
                </button>
              ))}
            </div>

            <button
              className='button'
              disabled={!stylesValid}
              onClick={() =>
                setStep(6)
              }
              style={{
                opacity:
                  stylesValid
                    ? 1
                    : 0.4
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
              onClick={
                finishOnboarding
              }
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
