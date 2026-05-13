export default function SignupStep() {
  return (
    <div style={{display:'grid',gap:14}}>
      <input className='input' placeholder='Full name' />
      <input className='input' placeholder='Email address' />
      <input className='input' placeholder='Phone number' />
      <input className='input' type='password' placeholder='Password' />
    </div>
  )
}
