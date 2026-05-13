'use client'

import { useState } from 'react'
import WelcomeStep from './WelcomeStep'
import SignupStep from './SignupStep'
import PhotoStep from './PhotoStep'
import GenderStep from './GenderStep'
import SpendingStep from './SpendingStep'
import StylesStep from './StylesStep'
import FinalStep from './FinalStep'
import { signUp } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [profileImage, setProfileImage] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [spending, setSpending] = useState('')
  const [gender, setGender] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const signupValid =
    name.trim() !== '' &&
    email.trim() !== '' &&
    phone.trim() !== '' &&
    password.trim() !== ''

  const photoValid = profileImage.trim() !== ''
  const genderValid = gender.trim() !== ''
  const spendingValid = spending.trim() !== ''
  const stylesValid = selectedStyles.length > 0

  async function finishOnboarding() {
    if (loading) return

    try {
      setLoading(true)

      const { data, error } = await signUp(email, password)

      if (error || !data?.user) {
        console.error(error)
        setLoading(false)
        return
      }

      localStorage.setItem('cheaperfind:onboardingComplete', 'true')
      localStorage.setItem('cheaperfind:name', name)
      localStorage.setItem('cheaperfind:email', email)
      localStorage.setItem('cheaperfind:phone', phone)
      localStorage.setItem('cheaperfind:profileImage', profileImage)
      localStorage.setItem('cheaperfind:gender', gender)
      localStorage.setItem('cheaperfind:spending', spending)
      localStorage.setItem('cheaperfind:selectedStyles', JSON.stringify(selectedStyles))

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

      window.location.href = '/'
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function toggleStyle(style: string) {
    setSelectedStyles(current =>
      current.includes(style)
        ? current.filter(x => x !== style)
        : [...current, style]
    )
  }

  return (
    <div style={{position:'fixed',inset:0,width:'100vw',height:'100vh',background:'#f5f5f7',zIndex:999999,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:560,display:'grid',gap:22}}>

        {step === 0 && (
          <>
            <WelcomeStep />

            <button
              type='button'
              className='button'
              onClick={() => setStep(1)}
            >
              Continue
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <SignupStep
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              password={password}
              setPassword={setPassword}
            />

            {signupValid && (
              <button
                type='button'
                className='button'
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <PhotoStep
              profileImage={profileImage}
              setProfileImage={setProfileImage}
            />

            {photoValid && (
              <button
                type='button'
                className='button'
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <GenderStep
              gender={gender}
              setGender={setGender}
            />

            {genderValid && (
              <button
                type='button'
                className='button'
                onClick={() => setStep(4)}
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <SpendingStep
              spending={spending}
              setSpending={setSpending}
            />

            {spendingValid && (
              <button
                type='button'
                className='button'
                onClick={() => setStep(5)}
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === 5 && (
          <>
            <StylesStep
              selectedStyles={selectedStyles}
              toggleStyle={toggleStyle}
            />

            {stylesValid && (
              <button
                type='button'
                className='button'
                onClick={() => setStep(6)}
              >
                Continue
              </button>
            )}
          </>
        )}

        {step === 6 && (
          <>
            <FinalStep />

            <button
              type='button'
              className='button'
              onClick={finishOnboarding}
            >
              {loading ? 'Creating account...' : 'Start Shopping'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
