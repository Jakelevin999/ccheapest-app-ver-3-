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
  const signupComplete =
    name.trim() &&
    email.trim() &&
    phone.trim() &&
    password.trim()

function next() {
  if (step === 1 && (!name || !email || !phone || !password)) return
  if (step === 2 && !profileImage) return
  if (step === 3 && !gender) return
  if (step === 4 && !spending) return
  if (step === 5 && selectedStyles.length === 0) return

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
            <button
  type='button'
  className='button'
  onClick={next}
  disabled={isStepInvalid}
  style={{
    opacity: isStepInvalid ? 0.5 : 1,
    pointerEvents: isStepInvalid ? 'none' : 'auto',
    background: isStepInvalid ? '#bdbdbd' : '#000',
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
