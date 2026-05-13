'use client'

import { useState } from 'react'
import WelcomeStep from './WelcomeStep'
import SignupStep from './SignupStep'
import PhotoStep from './PhotoStep'
import GenderStep from './GenderStep'
import SpendingStep from './SpendingStep'
import StylesStep from './StylesStep'
import FinalStep from './FinalStep'

export default function OnboardingFlow() {
  const [step, setStep] = useState(0)
  const [profileImage, setProfileImage] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [spending, setSpending] = useState('Standard')
  const [gender, setGender] = useState('Mens')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  function next() {
    if (step === 1) {
      if (!name || !email || !phone || !password) {
        return
      }
    }

    if (step === 6) {
      localStorage.setItem('cheaperfind:onboardingComplete', 'true')
      localStorage.setItem('cheaperfind:name', name)
      localStorage.setItem('cheaperfind:email', email)
      localStorage.setItem('cheaperfind:phone', phone)
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

        {step === 2 && <PhotoStep profileImage={profileImage} setProfileImage={setProfileImage} />}
        {step === 3 && <GenderStep gender={gender} setGender={setGender} />}
        {step === 4 && <SpendingStep spending={spending} setSpending={setSpending} />}
        {step === 5 && <StylesStep selectedStyles={selectedStyles} toggleStyle={toggleStyle} />}
        {step === 6 && <FinalStep />}

        <button className='button' onClick={next}>
          {step === 6 ? 'Start Shopping' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
