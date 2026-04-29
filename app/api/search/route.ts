import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function cleanText(v=''){return v.replace(/\s+/g,' ').trim();}
function extractPrice(v=''){const m=String(v).replace(/,/g,'').match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);return m?Number(m[1]):0;}
function cheapTrust(source='',link=''){const t=(source+link).toLowerCase();if(/amazon|walmart|target|nike|apple|bestbuy|zara|hm.com|uniqlo|asos|nordstrom|macys|gap|urbanoutfitters|stockx|goat/.test(t))return 9;if(/ebay|depop|poshmark|mercari|etsy/.test(t))return 7;return 6;}
function isAbsoluteUrl(link=''){return /^https?:\/\//i.test(link);}
function safeFallbackLink(title='', query=''){return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(title || query || 'product')}`;}
function bestDirectLink(r:any, query=''){
  let link = r.link || r.product_link || r.merchant?.link || r.seller_link || '';
  if (!link || !isAbsoluteUrl(link)) return safeFallbackLink(r.title, query);
  if (link.includes('google.com')) {
    try {
      const parsed = new URL(link);
      const real = parsed.searchParams.get('url') || parsed.searchParams.get('q');
      if (real && isAbsoluteUrl(real) && !real.includes('google.com')) return real;
    } catch {}
  }
  return link;
}
function isApparel(r:any){
  const text = `${r.title || ''} ${r.source || ''} ${r.seller || ''}`.toLowerCase();
  const apparel = /shirt|t-shirt|tee|hoodie|sweatshirt|jacket|coat|pants|jeans|shorts|dress|skirt|sweater|cardigan|blazer|tank|top|cargo|trousers|denim|flannel|vest|sneaker|shoe|boot|loafer|sandal|hat|cap|beanie|belt|bag|purse|backpack|apparel|clothing|outfit/.test(text);
  const bad = /plug|adapter|charger|cable|battery|replacement|case|screen|protector|tool|lamp|light|toy|book|food|supplement|vitamin|part|input|power|electrical|connector/.test(text);
  return apparel && !bad;
}
async function identifyImage(imageData:string){
  if(!imageData || !process.env.OPENAI_API_KEY) return '';
  try{
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [{
        role: 'user',
        content: [
          { type: 'input_text', text: 'Identify the main purchasable product in this image for shopping search. Return ONLY a short product search phrase with item type, color/material/brand if visible. Do not include sentences. Example: stainless steel water flask black lid' },
          { type: 'input_image', image_url: imageData, detail: 'low' }
        ]
      }]
    });
    return cleanText(response.output_text || '');
  }catch{
    return '';
  }
}
async function shoppingSearch(query:string,page=1,apparelOnly=false){
  const key=process.env.SERPAPI_KEY;
  if(!key || !query)return [];
  const url=new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine','google_shopping');
  url.searchParams.set('q',query);
  url.searchParams.set('api_key',key);
  url.searchParams.set('start',String((page-1)*20));
  url.searchParams.set('gl','us');
  url.searchParams.set('hl','en');
  const res=await fetch(url.toString(),{cache:'no-store'});
  const data=await res.json();
  return (data.shopping_results||[])
    .filter((r:any)=>r.title && (r.price||r.extracted_price) && (!apparelOnly || isApparel(r)))
    .map((r:any)=>{
      const priceNum=extractPrice(r.price||r.extracted_price);
      const direct=bestDirectLink(r, query);
      return {title:r.title,price:r.price||`$${priceNum}`,extractedPrice:priceNum,source:r.source||r.seller||'Store',link:direct,image:r.thumbnail||r.serpapi_thumbnail||'',dealRating:Math.round(Math.min(10,Math.max(1,10-(priceNum/50)))),cheapTrustRating:cheapTrust(r.source||r.seller||'',direct)};
    })
    .filter((p:any)=>isAbsoluteUrl(p.link))
    .sort((a:any,b:any)=>a.extractedPrice-b.extractedPrice);
}
export async function POST(req:Request){
  const {description,url,imageData,page,mode}=await req.json();
  let query='';
  const apparelOnly = mode === 'style' || (description || '').toLowerCase().includes('apparel only');

  if(imageData){
    const identified = await identifyImage(imageData);
    query = identified ? `${identified} cheaper alternatives buy` : '';
  }

  if(!query && description && description.trim().length>2){
    query=cleanText(description) + (apparelOnly ? ' clothing apparel outfit fashion' : ' cheaper alternatives buy');
  }else if(!query && url){
    try{const u=new URL(url);query=cleanText(u.pathname.replace(/[-_/]/g,' ')) + ' cheaper alternatives buy';}catch{query=url;}
  }

  const results=await shoppingSearch(query,page||1,apparelOnly);
  return NextResponse.json({results, query});
}
