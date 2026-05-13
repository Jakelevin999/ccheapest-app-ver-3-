'use client'

import { useEffect, useState } from 'react'

export default function AccountCenter() {
  const [profileImage, setProfileImage] = useState('')
  const [name, setName] = useState('Jake Levin')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    const savedImage = localStorage.getItem('cheaperfind:profileImage')
    const savedName = localStorage.getItem('cheaperfind:name')
    const savedEmail = localStorage.getItem('cheaperfind:email')
    const savedPhone = localStorage.getItem('cheaperfind:phone')

    if (savedImage) setProfileImage(savedImage)
    if (savedName) setName(savedName)
    if (savedEmail) setEmail(savedEmail)
    if (savedPhone) setPhone(savedPhone)
  }, [])

  return (
    <div className='card' style={{display:'grid',gap:18}}>
      <div style={{display:'flex',alignItems:'center',gap:18}}>
        {profileImage ? (
          <img
            src={profileImage}
            alt='Profile'
            style={{width:92,height:92,borderRadius:'999px',objectFit:'cover'}}
          />
        ) : (
          <div style={{width:92,height:92,borderRadius:'999px',background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}}>
            👤
          </div>
        )}

        <div style={{display:'grid',gap:4}}>
          <h2 style={{margin:0}}>{name}</h2>
          <div className='muted'>{email || 'No email added'}</div>
          <div className='muted'>{phone || 'No phone number added'}</div>
        </div>
      </div>

      <input className='input' value={name} onChange={(e) => {
        setName(e.target.value)
        localStorage.setItem('cheaperfind:name', e.target.value)
      }} placeholder='Full name' />

      <input className='input' value={email} onChange={(e) => {
        setEmail(e.target.value)
        localStorage.setItem('cheaperfind:email', e.target.value)
      }} placeholder='Email address' />

      <input className='input' value={phone} onChange={(e) => {
        setPhone(e.target.value)
        localStorage.setItem('cheaperfind:phone', e.target.value)
      }} placeholder='Phone number' />
    </div>
  )
}
