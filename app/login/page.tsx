'use client'

import { useState } from 'react'
import { signIn } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
  setLoading(true)
  setError('')

  const { error } = await signIn(email, password)

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    setError('User not found')
    setLoading(false)
    return
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_complete) {
    localStorage.setItem(
      'cheaperfind:onboardingComplete',
      'true'
    )

    window.location.href = '/'
    return
  }

  window.location.href = '/onboarding'
  }

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'#f5f5f7'}}>
      <div className='card' style={{width:'100%',maxWidth:460,display:'grid',gap:18}}>
        <h1 style={{margin:0}}>Login</h1>

        <input
          className='input'
          placeholder='Email'
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className='input'
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        {error && <div style={{color:'red',fontSize:14}}>{error}</div>}

        <button className='button' onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  )
}
