'use client';
import { useState } from 'react';

type Product = { title:string; price:string; source:string; link:string; image:string; };
type Flight = { name:string; logo:string; price:string; link:string; note:string; };

function shopSearch(q:string){return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;}
function priceNum(p=''){const n=Number(String(p).replace(/[^0-9.]/g,''));return Number.isFinite(n)?n:999999;}

export default function Travel(){
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [depart,setDepart]=useState('');
  const [ret,setRet]=useState('');
  const [gender,setGender]=useState('Men');
  const [guests,setGuests]=useState('1');
  const [searched,setSearched]=useState(false);
  const [loading,setLoading]=useState(false);
  const [flights,setFlights]=useState<Flight[]>([]);
  const [outfits,setOutfits]=useState<Product[]>([]);
  const [accessories,setAccessories]=useState<Product[]>([]);

  async function fetchProducts(query:string, mode?:string){
    const res=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:query,mode})});
    const data=await res.json();
    return (data.results||[]).sort((a:Product,b:Product)=>priceNum(a.price)-priceNum(b.price));
  }

  async function fetchFlights(){
    const res=await fetch('/api/flights',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({from,to,depart,returnDate:ret,guests})});
    const data=await res.json();
    setFlights(data.flights||[]);
  }

  async function searchTrip(){
    setSearched(true);
    setLoading(true);
    await fetchFlights();
    const outfitQuery=`${gender} ${to} travel outfit clothes shoes apparel`;
    const accessoryQuery=`${to} travel accessories luggage packing cubes eye mask`;
    const [fit,acc]=await Promise.all([
      fetchProducts(outfitQuery,'style'),
      fetchProducts(accessoryQuery)
    ]);
    setOutfits(fit);
    setAccessories(acc);
    setLoading(false);
  }

  function RowProducts({title,items}:{title:string;items:Product[]}){
    return <section style={{marginTop:26}}><h2 style={{fontSize:24,margin:'0 0 12px',letterSpacing:'-.04em'}}>{title}</h2><div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:12}}>{items.slice(0,10).map((p,i)=><a key={i} href={p.link||shopSearch(p.title)} target='_blank' rel='noreferrer' style={{minWidth:230}}><div className='card' style={{minHeight:330,padding:16,display:'flex',flexDirection:'column',gap:10}}>{p.image?<img src={p.image} alt={p.title} style={{width:'100%',height:160,objectFit:'contain',borderRadius:18,background:'var(--surface2)'}}/>:<div className='imagePlaceholder'/>}<h3 style={{fontSize:15,lineHeight:1.2,margin:0,minHeight:54}}>{p.title}</h3><p className='price' style={{fontSize:22}}>{p.price||'Check price'}</p><p className='muted' style={{fontSize:13}}>{p.source}</p></div></a>)}<a href='#' onClick={(e)=>{e.preventDefault();window.open(shopSearch(title+' '+to),'_blank')}} style={{minWidth:230}}><div className='card' style={{minHeight:330,display:'grid',placeItems:'center',fontWeight:900}}>See more</div></a></div></section>
  }

  function RowFlights(){return <section style={{marginTop:26}}><h2 style={{fontSize:24,margin:'0 0 12px',letterSpacing:'-.04em'}}>Flights</h2><div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:12}}>{flights.map((f,i)=><a key={i} href={f.link} target='_blank' rel='noreferrer' style={{minWidth:180}}><div className='card' style={{minHeight:165,padding:18,display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div style={{width:60,height:60,borderRadius:18,background:'var(--surface2)',display:'grid',placeItems:'center',fontWeight:950,fontSize:22}}>{f.logo}</div><div><h3 style={{margin:'12px 0 4px',fontSize:18}}>{f.name}</h3><p className='price' style={{fontSize:22}}>{f.price}</p><p className='muted' style={{fontSize:12}}>{f.note}</p></div></div></a>)}</div></section>}

  return <div style={{width:'100%',maxWidth:980,margin:'0 auto'}}>
    <h1 style={{fontSize:'clamp(42px,7vw,72px)',margin:'20px 0',letterSpacing:'-.06em'}}>Travel</h1>
    <div className='card' style={{maxWidth:720,margin:'0 auto',display:'grid',gap:14,padding:20,borderRadius:24}}>
      <input className='input' placeholder='From (LAX)' value={from} onChange={e=>setFrom(e.target.value.toUpperCase())}/>
      <input className='input' placeholder='To (JFK)' value={to} onChange={e=>setTo(e.target.value.toUpperCase())}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <input className='input' type='date' value={depart} onChange={e=>setDepart(e.target.value)}/>
        <input className='input' type='date' value={ret} onChange={e=>setRet(e.target.value)}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <select className='input' value={gender} onChange={e=>setGender(e.target.value)}><option>Men</option><option>Women</option><option>Unisex</option></select>
        <input className='input' type='number' min='1' placeholder='Guests' value={guests} onChange={e=>setGuests(e.target.value)}/>
      </div>
      <button className='button' onClick={searchTrip} disabled={!from.trim()||!to.trim()||!depart||loading}>{loading?'Loading...':'Search'}</button>
    </div>
    {searched && (loading? <div className='card empty' style={{marginTop:26}}><h2>Loading travel picks...</h2></div>:<>
      <RowFlights/>
      <RowProducts title='Outfits' items={outfits}/>
      <RowProducts title='Accessories' items={accessories}/>
    </>)}
  </div>;
}
