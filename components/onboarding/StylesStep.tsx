interface Props {
  selectedStyles: string[]
  toggleStyle: (value:string) => void
}

const styles = ['Streetwear','Minimal','Luxury','Vintage','Techwear','Athleisure','Scandinavian','Y2K','Business Casual','Summer Linen','Designer','Neutral Tones']

export default function StylesStep({ selectedStyles, toggleStyle }: Props) {
  return (
    <div className='filterRow'>
      {styles.map(style => (
        <button
          key={style}
          type='button'
          className={selectedStyles.includes(style) ? 'filter active' : 'filter'}
          onClick={() => toggleStyle(style)}
        >
          {style}
        </button>
      ))}
    </div>
  )
}
