export default function WelcomeStep() {
  return (
    <div style={{display:'grid',gap:8}}>
      <div className='muted'>Step 1 of 7</div>
      <h1 style={{fontSize:'clamp(54px,9vw,96px)',lineHeight:.88,margin:0,fontWeight:900}}>
        Welcome to CheapFinds
      </h1>
      <p className='muted' style={{fontSize:18}}>
        Shop smarter. Discover better products. Find your style.
      </p>
    </div>
  )
}
