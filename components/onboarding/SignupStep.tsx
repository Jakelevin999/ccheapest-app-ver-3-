interface Props {
  name: string
  setName: (value:string) => void
  email: string
  setEmail: (value:string) => void
  phone: string
  setPhone: (value:string) => void
  password: string
  setPassword: (value:string) => void
}
const inputStyle = {
  color:'#111111',
  background:'#ffffff',
  WebkitTextFillColor:'#111111'
}
export default function SignupStep({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword
}: Props) {
  return (
    <div
      style={{
        display:'grid',
        gap:14
      }}
    >
      <input
        className='input'
        style={inputStyle}
        autoComplete='off'
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
        style={inputStyle}
        autoComplete='off'
        placeholder='Email address'
        value={email}
        onChange={(e)=>
          setEmail(
            e.target.value
          )
        }
      />
      <input
        className='input'
        style={inputStyle}
        autoComplete='off'
        placeholder='Phone number'
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
        style={inputStyle}
        autoComplete='off'
        placeholder='Password'
        value={password}
        onChange={(e)=>
          setPassword(
            e.target.value
          )
        }
      />
    </div>
  )
}
