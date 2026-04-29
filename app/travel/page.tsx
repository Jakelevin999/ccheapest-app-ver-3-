'use client';
import { useState } from 'react';

type Product = { title:string; price:string; source:string; link:string; image:string; };
type Flight = { name:string; logo:string; initials:string; price:string; link:string; note:string; departTime?:string; arrivalTime?:string };

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

  function RowFlights(){return <section style={{marginTop:26}}><h2 style={{fontSize:24,margin:'0 0 12px'}}>Flights</h2><div style={{display:'flex',gap:14,overflowX:'auto'}}>{flights.map((f,i)=><a key={i} href={f.link} target='_blank' style={{minWidth:200}}><div className='card' style={{padding:16}}>

      {f.logo ? (
        <img src={f.logo} style={{width:50,height:50,objectFit:'contain'}}/>
      ) : (
        <div style={{width:50,height:50,display:'grid',placeItems:'center'}}>{f.initials}</div>
      )}

      <h3>{f.name}</h3>
      <p className='price'>{f.price}</p>
      <p>{f.note}</p>

    </div></a>)}</div></section>}

  return <div style={{maxWidth:980,margin:'0 auto'}}>
    <h1>Travel</h1>

    <div className='card' style={{maxWidth:720,margin:'0 auto'}}>
      <input placeholder='From (LAX)' value={from} onChange={e=>setFrom(e.target.value)}/>
      <input placeholder='To (JFK)' value={to} onChange={e=>setTo(e.target.value)}/>
      <input type='date' value={depart} onChange={e=>setDepart(e.target.value)}/>
      <input type='date' value={ret} onChange={e=>setRet(e.target.value)}/>
      <select value={gender} onChange={e=>setGender(e.target.value)}><option>Men</option><option>Women</option></select>
      <input type='number' value={guests} onChange={e=>setGuests(e.target.value)}/>
      <button onClick={searchTrip}>Search</button>
    </div>

    {searched && (loading? <div>Loading...</div>:<>
      <RowFlights/>
    </>)}

  </div>;
}
