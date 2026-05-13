interface Props {
  spending: string
  setSpending: (value:string) => void
}

export default function SpendingStep({ spending, setSpending }: Props) {
  return (
    <div className='settingsButtonGrid'>
      {['Saver','Standard','Baller'].map(item => (
        <button
          key={item}
          type='button'
          className={spending === item ? 'tierButton active' : 'tierButton'}
          onClick={() => setSpending(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
