interface Props {
  gender: string
  setGender: (value:string) => void
}

export default function GenderStep({ gender, setGender }: Props) {
  return (
    <div className='settingsButtonGrid'>
      {['Mens','Womens','Unisex'].map(item => (
        <button
          key={item}
          type='button'
          className={gender === item ? 'tierButton active' : 'tierButton'}
          onClick={() => setGender(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
