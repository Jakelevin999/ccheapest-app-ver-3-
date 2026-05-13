import { Dispatch, SetStateAction } from 'react'

interface Props {
  profileImage: string
  setProfileImage: Dispatch<SetStateAction<string>>
}

export default function PhotoStep({ profileImage, setProfileImage }: Props) {
  return (
    <label className='cleanProfileUpload' style={{width:180,height:180,margin:'0 auto'}}>
      {profileImage ? (
        <img
          src={profileImage}
          alt='Profile'
          style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'999px'}}
        />
      ) : (
        '👤'
      )}

      <input
        type='file'
        accept='image/*'
        onChange={(e) => {
          const file = e.target.files?.[0]

          if (!file) return

          const reader = new FileReader()

          reader.onloadend = () => {
            const result = reader.result as string

            setProfileImage(result)

            localStorage.setItem('cheaperfind:profileImage', result)
          }

          reader.readAsDataURL(file)
        }}
      />
    </label>
  )
}
