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
    return <section style={{marginTop:26}}><h2>{title}</h2><div style={{display:'flex',gap:14,overflowX:'auto'}}>{items.slice(0,10).map((p,i)=><a key={i} href={p.link||shopSearch(p.title)} target='_blank'><div className='card' style={{minWidth:220,padding:14}}>{p.image?<img src={p.image} style={{width:'100%',height:140,objectFit:'contain'}}/>:null}<h3>{p.title}</h3><p className='price'>{p.price}</p></div></a>)}<a href="#" onClick={(e)=>{e.preventDefault();window.open(shopSearch(title+' '+to),'_blank')}}><div className='card' style={{minWidth:220,display:'grid',placeItems:'center'}}>See more</div></a></div></section>
  }

  function RowFlights(){return <section style={{marginTop:26}}><h2>Flights</h2><div style={{display:'flex',gap:14,overflowX:'auto'}}>{flights.map((f,i)=><a key={i} href={f.link} target='_blank'><div className='card' style={{minWidth:180,padding:14}}><div>{f.logo}</div><h3>{f.name}</h3><p className='price'>{f.price}</p><p>{f.note}</p></div></a>)}</div></section>}

  return <div style={{maxWidth:980,margin:'0 auto'}}>
    <h1>Travel</h1>
    <div className='card'>
      <input placeholder='From (airport code like LAX)' value={from} onChange={e=>setFrom(e.target.value)}/>
      <input placeholder='To (airport code like JFK)' value={to} onChange={e=>setTo(e.target.value)}/>
      <input type='date' value={depart} onChange={e=>setDepart(e.target.value)}/>
      <input type='date' value={ret} onChange={e=>setRet(e.target.value)}/>
      <select value={gender} onChange={e=>setGender(e.target.value)}><option>Men</option><option>Women</option></select>
      <input type='number' value={guests} onChange={e=>setGuests(e.target.value)}/>
      <button onClick={searchTrip}>Search</button>
    </div>
    {searched && (loading? <div>Loading...</div>:<>
      <RowFlights/>
      <RowProducts title='Outfits' items={outfits}/>
      <RowProducts title='Accessories' items={accessories}/>
    </>)}
  </div>;
}
