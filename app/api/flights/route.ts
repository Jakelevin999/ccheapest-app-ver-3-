import { NextResponse } from 'next/server';

const airportMap: Record<string,string> = {
  'LA':'LAX','LOS ANGELES':'LAX','LAX':'LAX',
  'ORLANDO':'MCO','MCO':'MCO',
  'NEW YORK':'JFK','NYC':'JFK','JFK':'JFK',
  'MIAMI':'MIA','MIA':'MIA',
  'LAS VEGAS':'LAS','VEGAS':'LAS','LAS':'LAS',
  'CHICAGO':'ORD','ORD':'ORD',
  'ATLANTA':'ATL','ATL':'ATL',
  'SAN FRANCISCO':'SFO','SF':'SFO','SFO':'SFO',
  'DALLAS':'DFW','DFW':'DFW',
  'DENVER':'DEN','DEN':'DEN'
};

function airport(v=''){
  const key=String(v).trim().toUpperCase();
  return airportMap[key] || key;
}

function googleFlightsLink(from:string,to:string,depart:string,ret:string){
  const q=`flights from ${airport(from)} to ${airport(to)} ${depart}${ret?` returning ${ret}`:''}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

function initials(name='Flight'){
  return name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase() || 'FL';
}

function formatTime(raw=''){
  if(!raw)return '';
  const d=new Date(raw);
  if(Number.isNaN(d.getTime())) return String(raw).replace(/.*T/,'').slice(0,5);
  return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}

export async function POST(req:Request){
  const body=await req.json();
  const from=airport(body.from);
  const to=airport(body.to);
  const depart=body.depart;
  const returnDate=body.returnDate;
  const guests=body.guests || 1;
  const key=process.env.SERPAPI_KEY;

  if(!key||!from||!to||!depart){
    return NextResponse.json({flights:[],error:'Missing SERPAPI_KEY or route fields'});
  }

  try{
    const u=new URL('https://serpapi.com/search.json');
    u.searchParams.set('engine','google_flights');
    u.searchParams.set('departure_id',from);
    u.searchParams.set('arrival_id',to);
    u.searchParams.set('outbound_date',depart);
    if(returnDate)u.searchParams.set('return_date',returnDate);
    u.searchParams.set('adults',String(guests));
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
        initials:initials(airline),
        price:typeof f.price==='number'?`$${f.price}`:(f.price?String(f.price):''),
        link:googleFlightsLink(from,to,depart,returnDate),
        note:`${departTime||'Depart'} → ${arrivalTime||'Arrive'}${duration?` • ${duration}`:''}${stops?` • ${stops} stop${stops>1?'s':''}`:' • nonstop'}`
      };
    }).filter((f:any)=>f.price)
      .sort((a:any,b:any)=>Number(a.price.replace(/[^0-9.]/g,''))-Number(b.price.replace(/[^0-9.]/g,'')))
      .slice(0,12);

    return NextResponse.json({flights,error:data.error||null,used:{from,to}});
  }catch{
    return NextResponse.json({flights:[],error:'Flight lookup failed'});
  }
}
