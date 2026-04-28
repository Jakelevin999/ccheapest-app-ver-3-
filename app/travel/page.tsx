'use client';
import { useState } from 'react';

type Product = { title:string; price:string; source:string; link:string; image:string; };
type Flight = { name:string; logo:string; price:string; link:string; note:string; };

const flightSites = [
  { name:'Delta', logo:'DL', link:'https://www.delta.com/flight-search/search-results' },
  { name:'United', logo:'UA', link:'https://www.united.com/en/us/fsr/choose-flights' },
  { name:'American', logo:'AA', link:'https://www.aa.com/booking/find-flights' },
  { name:'Southwest', logo:'SW', link:'https://www.southwest.com/air/booking/' },
  { name:'JetBlue', logo:'JB', link:'https://www.jetblue.com/booking/flights' },
  { name:'Spirit', logo:'NK', link:'https://www.spirit.com/' },
  { name:'Expedia', logo:'EX', link:'https://www.expedia.com/Flights' },
  { name:'Kayak', logo:'KY', link:'https://www.kayak.com/flights' }
];

function shopSearch(q:string){return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`;}
function priceNum(p=''){const n=Number(String(p).replace(/[^0-9.]/g,''));return Number.isFinite(n)?n:999999;}

export default function Travel(){
  const [destination,setDestination]=useState('');
  const [date,setDate]=useState('');
  const [gender,setGender]=useState('Men');
  const [guests,setGuests]=useState('1');
  const [searched,setSearched]=useState(false);
  const [loading,setLoading]=useState(false);
  const [outfits,setOutfits]=useState<Product[]>([]);
  const [accessories,setAccessories]=useState<Product[]>([]);

  const dest=destination.trim();
  const dateText=date?new Date(date+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}):'date';

  const flights:Flight[]=flightSites.map((f,i)=>({
    ...f,
    price:'Live fare',
    note:`${dest||'Destination'} • ${dateText} • ${guests} guest${guests==='1'?'':'s'}`
  }));

  async function fetchProducts(query:string, mode?:string){
    const res=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({description:query,mode})});
    const data=await res.json();
    return (data.results||[]).sort((a:Product,b:Product)=>priceNum(a.price)-priceNum(b.price)).slice(0,12);
  }

  async function searchTrip(){
    setSearched(true);
    setLoading(true);
    const outfitQuery=`${gender} ${dest} travel outfit clothes shoes apparel fashion`;
    const accessoryQuery=`${dest} travel accessories luggage packing cubes eye mask neck pillow phone holder toiletry bag`;
    const [fit,acc]=await Promise.all([
      fetchProducts(outfitQuery,'style'),
      fetchProducts(accessoryQuery)
    ]);
    setOutfits(fit);
    setAccessories(acc);
    setLoading(false);
  }

  function FlightRow(){return <section style={{width:'100%',marginTop:26}}><h2 style={{fontSize:24,margin:'0 0 12px'}}>Cheapest flights</h2><div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:12}}>{flights.map(f=><a key={f.name} href={f.link} target='_blank' rel='noreferrer' style={{minWidth:175}}><div className='card' style={{minHeight:165,padding:18,display:'flex',flexDirection:'column',justifyContent:'space-between'}}><div style={{width:60,height:60,borderRadius:18,background:'var(--surface2)',display:'grid',placeItems:'center',fontWeight:950,fontSize:22}}>{f.logo}</div><div><h3 style={{margin:'12px 0 4px',fontSize:18}}>{f.name}</h3><p className='price' style={{fontSize:22}}>{f.price}</p><p className='muted' style={{fontSize:12}}>{f.note}</p></div></div></a>)}</div></section>}

  function ProductRow({title,items}:{title:string;items:Product[]}){return <section style={{width:'100%',marginTop:26}}><h2 style={{fontSize:24,margin:'0 0 12px'}}>{title}</h2><div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:12}}>{items.map((p,i)=><a key={(p.link||p.title)+i} href={p.link||shopSearch(p.title)} target='_blank' rel='noreferrer' style={{minWidth:230}}><div className='card' style={{minHeight:330,padding:16,display:'flex',flexDirection:'column',gap:10}}>{p.image?<img src={p.image} alt={p.title} style={{width:'100%',height:160,objectFit:'contain',borderRadius:18,background:'var(--surface2)'}}/>:<div className='imagePlaceholder'/>}<h3 style={{fontSize:15,lineHeight:1.2,margin:0,minHeight:54}}>{p.title}</h3><p className='price' style={{fontSize:22}}>{p.price||'Check price'}</p><p className='muted' style={{fontSize:13}}>{p.source}</p></div></a>)}</div></section>}

  return <div style={{width:'100%',maxWidth:980,margin:'0 auto'}}>
    <h1 style={{fontSize:'clamp(42px,7vw,72px)',margin:'20px 0',letterSpacing:'-.06em'}}>Travel</h1>
    <div className='card' style={{display:'grid',gap:12}}>
      <input className='input' placeholder='Destination' value={destination} onChange={e=>setDestination(e.target.value)}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        <input className='input' type='date' value={date} onChange={e=>setDate(e.target.value)}/>
        <select className='input' value={gender} onChange={e=>setGender(e.target.value)}><option>Men</option><option>Women</option><option>Unisex</option></select>
        <input className='input' type='number' min='1' placeholder='Guests' value={guests} onChange={e=>setGuests(e.target.value)}/>
      </div>
      <button className='button' onClick={searchTrip} disabled={!dest||loading}>{loading?'Loading products...':'Search trip'}</button>
    </div>
    {searched&&<><FlightRow/>{loading?<div className='card empty' style={{marginTop:26}}><h2>Loading travel picks...</h2></div>:<><ProductRow title='Outfits for your trip' items={outfits}/><ProductRow title='Travel accessories' items={accessories}/></>}</>}
  </div>;
}
