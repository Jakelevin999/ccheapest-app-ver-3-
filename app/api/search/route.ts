import { NextResponse } from 'next/server';

function cleanText(v=''){return v.replace(/\s+/g,' ').trim();}

function extractPrice(v=''){const m=String(v).replace(/,/g,'').match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);return m?Number(m[1]):0;}

function cheapTrust(source='',link=''){const t=(source+link).toLowerCase();if(/amazon|walmart|target|nike|apple|bestbuy/.test(t))return 9;if(/ebay|depop/.test(t))return 7;return 6;}

async function shoppingSearch(query:string,page=1){
  const key=process.env.SERPAPI_KEY;
  if(!key)return [];
  const url=new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine','google_shopping');
  url.searchParams.set('q',query);
  url.searchParams.set('api_key',key);
  url.searchParams.set('start',String((page-1)*20));

  const res=await fetch(url.toString());
  const data=await res.json();

  return (data.shopping_results||[])
    .filter((r:any)=>r.title && (r.price||r.extracted_price) && (r.link||r.product_link))
    .map((r:any)=>{
      const priceNum=extractPrice(r.price||r.extracted_price);
      const link=r.link||r.product_link;
      return {
        title:r.title,
        price:r.price||`$${priceNum}`,
        extractedPrice:priceNum,
        source:r.source||'Store',
        link,
        image:r.thumbnail||'',
        dealRating:Math.min(10,Math.max(1,10-(priceNum/50))),
        cheapTrustRating:cheapTrust(r.source,link)
      }
    })
    .sort((a:any,b:any)=>a.extractedPrice-b.extractedPrice);
}

export async function POST(req:Request){
  const {description,url,page}=await req.json();

  let query='';

  if(description && description.trim().length>2){
    query=cleanText(description)+' buy';
  }else if(url){
    try{
      const u=new URL(url);
      query=cleanText(u.pathname.replace(/[-_/]/g,' '));
    }catch{query=url;}
  }

  const results=await shoppingSearch(query,page||1);

  return NextResponse.json({results});
}
