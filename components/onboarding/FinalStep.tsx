export default function FinalStep() {
  return (
    <div style={{display:'grid',gap:8}}>
      <div className='muted'>Final Step</div>
      <h1 style={{fontSize:'clamp(54px,9vw,96px)',lineHeight:.88,margin:0,fontWeight:900}}>
        You are all set
      </h1>
      <p className='muted' style={{fontSize:18}}>
        Start discovering products tailored to you.
      </p>
    </div>
  )
}
