import { NextResponse } from 'next/server';

function googleFlightsLink(from:string,to:string,depart:string,ret:string){
  const q=`flights from ${from} to ${to} ${depart}${ret?` returning ${ret}`:''}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

function airlineLogo(name='Flight'){
  return name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase() || 'FL';
}

export async function POST(req:Request){
  const {from,to,depart,returnDate,guests}=await req.json();
  const key=process.env.SERPAPI_KEY;

  const fallback=[
    {name:'Google Flights',logo:'GF',price:'Check prices',link:googleFlightsLink(from,to,depart,returnDate),note:`${from||'From'} → ${to||'To'} • ${guests||1} guest`},
    {name:'Expedia',logo:'EX',price:'Check prices',link:'https://www.expedia.com/Flights',note:'Trusted booking site'},
    {name:'Kayak',logo:'KY',price:'Check prices',link:'https://www.kayak.com/flights',note:'Compare flight prices'}
  ];

  if(!key||!from||!to||!depart){
    return NextResponse.json({flights:fallback,error:'Missing SERPAPI_KEY or flight fields'});
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
      const first=f.flights?.[0]||{};
      const last=f.flights?.[f.flights?.length-1]||first;
      const airline=first.airline||'Flight';
      const stops=(f.flights?.length||1)-1;
      const duration=f.total_duration?`${Math.floor(f.total_duration/60)}h ${f.total_duration%60}m`:'';
      return {
        name:airline,
        logo:airlineLogo(airline),
        price:typeof f.price==='number'?`$${f.price}`:(f.price?String(f.price):'Check prices'),
        link:googleFlightsLink(from,to,depart,returnDate),
        note:`${first.departure_airport?.id||from} → ${last.arrival_airport?.id||to}${duration?` • ${duration}`:''}${stops?` • ${stops} stop${stops>1?'s':''}`:' • nonstop'}`
      };
    }).filter((f:any)=>f.price && f.price !== 'Check prices')
      .sort((a:any,b:any)=>Number(a.price.replace(/[^0-9.]/g,''))-Number(b.price.replace(/[^0-9.]/g,'')))
      .slice(0,10);

    return NextResponse.json({flights:flights.length?flights:fallback,rawError:data.error||null});
  }catch(error){
    return NextResponse.json({flights:fallback,error:'Flight lookup failed'});
  }
}
