import { NextResponse } from 'next/server';

function googleFlightsLink(from:string,to:string,depart:string,ret:string){
  const q=`flights from ${from} to ${to} ${depart}${ret?` returning ${ret}`:''}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}

export async function POST(req:Request){
  const {from,to,depart,returnDate,guests}=await req.json();
  const key=process.env.SERPAPI_KEY;
  const fallback=[
    {name:'Google Flights',logo:'GF',price:'View prices',link:googleFlightsLink(from,to,depart,returnDate),note:`${from||'From'} → ${to||'To'} • ${guests||1} guest`},
    {name:'Expedia',logo:'EX',price:'View prices',link:'https://www.expedia.com/Flights',note:'Trusted booking site'},
    {name:'Kayak',logo:'KY',price:'View prices',link:'https://www.kayak.com/flights',note:'Compare flight prices'},
    {name:'Delta',logo:'DL',price:'View prices',link:'https://www.delta.com/flight-search/search-results',note:'Official airline'},
    {name:'United',logo:'UA',price:'View prices',link:'https://www.united.com/en/us/fsr/choose-flights',note:'Official airline'},
    {name:'American',logo:'AA',price:'View prices',link:'https://www.aa.com/booking/find-flights',note:'Official airline'},
    {name:'Southwest',logo:'SW',price:'View prices',link:'https://www.southwest.com/air/booking/',note:'Official airline'},
    {name:'Spirit',logo:'NK',price:'View prices',link:'https://www.spirit.com/',note:'Official airline'}
  ];
  if(!key||!from||!to||!depart)return NextResponse.json({flights:fallback});
  try{
    const u=new URL('https://serpapi.com/search.json');
    u.searchParams.set('engine','google_flights');
    u.searchParams.set('departure_id',from);
    u.searchParams.set('arrival_id',to);
    u.searchParams.set('outbound_date',depart);
    if(returnDate)u.searchParams.set('return_date',returnDate);
    u.searchParams.set('adults',String(guests||1));
    u.searchParams.set('currency','USD');
    u.searchParams.set('api_key',key);
    const res=await fetch(u.toString());
    const data=await res.json();
    const source=[...(data.best_flights||[]),...(data.other_flights||[])];
    const flights=source.slice(0,10).map((f:any)=>{
      const first=f.flights?.[0]||{};
      const airline=first.airline||'Flight';
      return {name:airline,logo:(airline||'FL').split(' ').map((x:string)=>x[0]).join('').slice(0,2).toUpperCase(),price:f.price?`$${f.price}`:'View prices',link:googleFlightsLink(from,to,depart,returnDate),note:`${first.departure_airport?.id||from} → ${first.arrival_airport?.id||to}`};
    });
    return NextResponse.json({flights:flights.length?flights:fallback});
  }catch{
    return NextResponse.json({flights:fallback});
  }
}
