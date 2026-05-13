'use client'

import WelcomeStep from '../../components/onboarding/WelcomeStep'
import SignupStep from '../../components/onboarding/SignupStep'
import PhotoStep from '../../components/onboarding/PhotoStep'
import GenderStep from '../../components/onboarding/GenderStep'
import SpendingStep from '../../components/onboarding/SpendingStep'
import StylesStep from '../../components/onboarding/StylesStep'
import FinalStep from '../../components/onboarding/FinalStep'
import { signUp } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

export default function OnboardingFlow() {
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
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.trim().length > 0

  const photoValid = profileImage.trim().length > 0
  const genderValid = gender.trim().length > 0
  const spendingValid = spending.trim().length > 0
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
        console.error(error)
        alert('Signup failed')
        setLoading(false)
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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const disabledStyle = {
    opacity: 0.45,
    pointerEvents: 'none' as const,
    background: '#bdbdbd'
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
          gap: 22
        }}
      >
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

            <button
              type='button'
              className='button'
              disabled={!signupValid}
              style={!signupValid ? disabledStyle : {}}
              onClick={() => {
                if (!signupValid) return
                setStep(2)
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <PhotoStep
              profileImage={profileImage}
              setProfileImage={setProfileImage}
            />

            <button
              type='button'
              className='button'
              disabled={!photoValid}
              style={!photoValid ? disabledStyle : {}}
              onClick={() => {
                if (!photoValid) return
                setStep(3)
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <GenderStep
              gender={gender}
              setGender={setGender}
            />

            <button
              type='button'
              className='button'
              disabled={!genderValid}
              style={!genderValid ? disabledStyle : {}}
              onClick={() => {
                if (!genderValid) return
                setStep(4)
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <SpendingStep
              spending={spending}
              setSpending={setSpending}
            />

            <button
              type='button'
              className='button'
              disabled={!spendingValid}
              style={!spendingValid ? disabledStyle : {}}
              onClick={() => {
                if (!spendingValid) return
                setStep(5)
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <StylesStep
              selectedStyles={selectedStyles}
              toggleStyle={toggleStyle}
            />

            <button
              type='button'
              className='button'
              disabled={!stylesValid}
              style={!stylesValid ? disabledStyle : {}}
              onClick={() => {
                if (!stylesValid) return
                setStep(6)
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 6 && (
          <>
            <FinalStep />

            <button
              type='button'
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
