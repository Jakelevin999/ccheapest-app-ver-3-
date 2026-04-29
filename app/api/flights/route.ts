import { NextResponse } from 'next/server';

function googleFlightsLink(from:string,to:string,depart:string,ret:string){
  const q=`flights from ${from} to ${to} ${depart}${ret?` returning ${ret}`:''}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

function airlineInitials(name='Flight'){
  return name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase() || 'FL';
}

function formatTime(raw=''){
  if(!raw) return '';
  const d=new Date(raw);
  if(Number.isNaN(d.getTime())) return String(raw).replace(/.*T/,'').slice(0,5);
  return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}

export async function POST(req:Request){
  const {from,to,depart,returnDate,guests}=await req.json();
  const key=process.env.SERPAPI_KEY;

  if(!key||!from||!to||!depart){
    return NextResponse.json({flights:[],error:'Missing SERPAPI_KEY or flight fields'});
  }

  try{
    const u=new URL('https://serpapi.com/search.json');
    u.searchParams.set('engine','google_flights');
    u.searchParams.set('departure_id',String(from).trim().toUpperCase());
    u.searchParams.set('arrival_id',String(to).trim().toUpperCase());
    u.searchParams.set('outbound_date',depart);
    if(returnDate) u.searchParams.set('return_date',returnDate);
    u.searchParams.set('adults',String(guests||1));
    u.searchParams.set('currency','USD');
    u.searchParams.set('hl','en');
    u.searchParams.set('api_key',key);

    const res=await fetch(u.toString(),{cache:'no-store'});
    const data=await res.json();
    const source=[...(data.best_flights||[]),...(data.other_flights||[])];

    const flights=source.map((f:any)=>{
      const legs=f.flights||[];
      const first=legs[0]||{};
      const last=legs[legs.length-1]||first;
      const airline=first.airline||'Flight';
      const stops=Math.max(0,legs.length-1);
      const duration=f.total_duration?`${Math.floor(f.total_duration/60)}h ${f.total_duration%60}m`:'';
      const departTime=formatTime(first.departure_airport?.time);
      const arrivalTime=formatTime(last.arrival_airport?.time);
      return {
        name:airline,
        logo:first.airline_logo || '',
        initials:airlineInitials(airline),
        price:typeof f.price==='number'?`$${f.price}`:(f.price?String(f.price):''),
        link:googleFlightsLink(from,to,depart,returnDate),
        departTime,
        arrivalTime,
        note:`${departTime||'Depart'} → ${arrivalTime||'Arrive'}${duration?` • ${duration}`:''}${stops?` • ${stops} stop${stops>1?'s':''}`:' • nonstop'}`
      };
    }).filter((f:any)=>f.price)
      .sort((a:any,b:any)=>Number(a.price.replace(/[^0-9.]/g,''))-Number(b.price.replace(/[^0-9.]/g,'')))
      .slice(0,10);

    return NextResponse.json({flights,error:data.error||null});
  }catch(error){
    return NextResponse.json({flights:[],error:'Flight lookup failed'});
  }
}
