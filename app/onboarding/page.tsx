'use client'

import { useState } from 'react'

const slides = [
  {
    title: 'Welcome to CheapFinds',
    subtitle: 'Shop smarter. Discover better products. Find your style.',
    type: 'welcome'
  },
  {
    title: 'Create your account',
    subtitle: 'Save your style, favorites, and shopping preferences.',
    type: 'signup'
  },
  {
    title: 'Add a profile photo',
    subtitle: 'Make your profile feel personal.',
    type: 'photo'
  },
  {
    title: 'Choose your style',
    subtitle: 'This helps personalize your recommendations.',
    type: 'gender'
  },
  {
    title: 'Choose your spending style',
    subtitle: 'Your shopping experience adapts to your budget.',
    type: 'spending'
  },
  {
    title: 'Select style interests',
    subtitle: 'Choose aesthetics you actually wear.',
    type: 'styles'
  },
  {
    title: 'You are all set',
    subtitle: 'Start discovering products tailored to you.',
    type: 'done'
  }
]

const styles = ['Streetwear','Minimal','Luxury','Vintage','Techwear','Athleisure','Scandinavian','Y2K','Business Casual','Summer Linen','Designer','Neutral Tones']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const slide = slides[step]
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [spending, setSpending] = useState('Standard')
  const [gender, setGender] = useState('Mens')

  function next(){
    if(step < slides.length - 1) setStep(step + 1)
  }

  function toggleStyle(style:string){
    setSelectedStyles(current => current.includes(style)
      ? current.filter(x => x !== style)
      : [...current, style]
    )
  }

  return (
    <div className='styleCenter' style={{minHeight:'100vh',padding:'24px'}}>
      <div className='card' style={{maxWidth:560,width:'100%',display:'grid',gap:18}}>
        <div style={{display:'grid',gap:8}}>
          <div className='muted'>Step {step + 1} of {slides.length}</div>
          <h1 style={{fontSize:'clamp(36px,6vw,58px)',lineHeight:.95,margin:0}}>{slide.title}</h1>
          <p className='muted' style={{fontSize:16}}>{slide.subtitle}</p>
        </div>

        {slide.type === 'signup' && (
          <div style={{display:'grid',gap:12}}>
            <input className='input' placeholder='Full name' />
            <input className='input' placeholder='Email address' />
            <input className='input' placeholder='Phone number' />
            <input className='input' type='password' placeholder='Password' />
          </div>
        )}

        {slide.type === 'photo' && (
          <label className='cleanProfileUpload' style={{width:140,height:140,margin:'0 auto'}}>
            👤
            <input type='file' accept='image/*' />
          </label>
        )}

        {slide.type === 'gender' && (
          <div className='settingsButtonGrid'>
            {['Mens','Womens','Unisex'].map(item => (
              <button
                key={item}
                className={gender === item ? 'tierButton active' : 'tierButton'}
                onClick={() => setGender(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {slide.type === 'spending' && (
          <div className='settingsButtonGrid'>
            {['Saver','Standard','Baller'].map(item => (
              <button
                key={item}
                className={spending === item ? 'tierButton active' : 'tierButton'}
                onClick={() => setSpending(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {slide.type === 'styles' && (
          <div className='filterRow'>
            {styles.map(style => (
              <button
                key={style}
                className={selectedStyles.includes(style) ? 'filter active' : 'filter'}
                onClick={() => toggleStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        )}

        <button className='button' onClick={next}>
          {step === slides.length - 1 ? 'Start Shopping' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
