use client'

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
  const signupComplete =
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    password.trim()

  async function next() {
   if (step === 1 && !signupComplete) {
  return
}

if (step === 2 && !profileImage) {
  return
}

if (step === 3 && !gender) {
  return
}

if (step === 4 && !spending) {
  return
}

if (step === 5 && selectedStyles.length === 0) {
  return
    }

    if (step === 6) {
  setLoading(true)

  const { data, error } = await signUp(email, password)

  if (error || !data.user) {
    console.error(error)
    setLoading(false)
    return
  }

  localStorage.setItem('cheaperfind:onboardingComplete', 'true')
  localStorage.setItem('cheaperfind:name', name)
  localStorage.setItem('cheaperfind:email', email)
  localStorage.setItem('cheaperfind:phone', phone)

  if (profileImage) {
    localStorage.setItem('cheaperfind:profileImage', profileImage)
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

  window.location.href = '/'
  return
}

    setStep(step + 1)
  }

  function toggleStyle(style:string) {
    setSelectedStyles(current =>
      current.includes(style)
        ? current.filter(x => x !== style)
        : [...current, style]
    )
  }

const isStepInvalid =
  (step === 1 && !signupComplete) ||
  (step === 2 && profileImage.trim() === '') ||
  (step === 3 && gender.trim() === '') ||
  (step === 4 && spending.trim() === '') ||
  (step === 5 && selectedStyles.length === 0)

  return (
    <div style={{position:'fixed',inset:0,width:'100vw',height:'100vh',background:'#f5f5f7',zIndex:999999,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:560,display:'grid',gap:22}}>
        {step === 0 && <WelcomeStep />}

        {step === 1 && (
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
        )}
if (step === 1 && !signupComplete) return
if (step === 2 && profileImage.trim() === '') return
if (step === 3 && gender.trim() === '') return
if (step === 4 && spending.trim() === '') return
if (step === 5 && selectedStyles.length === 0) return

      <button
  className='button'
  onClick={next}
  disabled={loading || isStepInvalid}
  style={{
    opacity: loading || isStepInvalid ? 0.5 : 1,
    pointerEvents: loading || isStepInvalid ? 'none' : 'auto',
    background: loading || isStepInvalid ? '#bdbdbd' : '#000',
    transition: '0.2s'
  }}
>
  {loading
    ? 'Creating account...'
    : step === 6
    ? 'Start Shopping'
    : 'Continue'}
</button>
        {step === 1 && (
  <button
    type='button'
    className='button secondary'
    onClick={() => {
      window.location.href = '/login'
    }}
  >
    Already have an account? Login
  </button>
)}
      </div>
    </div>
  )
}
