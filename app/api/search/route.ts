import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanText(value = '') {
  return value.replace(/\s+/g, ' ').replace(/access to this page has been denied/gi, '').trim();
}

function extractPrice(value = '') {
  const match = String(value).replace(/,/g, '').match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return match ? Number(match[1]) : 0;
}

function scoreDeal(price: number, average: number) {
  if (!price || !average) return 5;
  const ratio = price / average;
  if (ratio <= 0.55) return 10;
  if (ratio <= 0.65) return 9;
  if (ratio <= 0.78) return 8;
  if (ratio <= 0.9) return 7;
  if (ratio <= 1.05) return 6;
  if (ratio <= 1.2) return 5;
  return 4;
}

function cheapTrust(source = '', link = '') {
  const text = `${source} ${link}`.toLowerCase();
  if (/bestbuy|apple|target|walmart|amazon|adorama|bhphotovideo|b&h|nike|zara|hm.com|uniqlo|costco|samsclub/.test(text)) return 9;
  if (/ebay|depop|poshmark|mercari|goat|stockx/.test(text)) return 7;
  if (/shein|temu|aliexpress/.test(text)) return 5;
  return 6;
}

function queryFromUrl(rawUrl: string) {
  try {
    const u = new URL(rawUrl);
    const pathWords = decodeURIComponent(u.pathname)
      .replace(/[-_+\/]+/g, ' ')
      .replace(/\b(product|products|p|dp|item|shop|collections|mens|womens|store|detail|sku)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleanText(pathWords || u.hostname.replace('www.', ''));
  } catch {
    return cleanText(rawUrl);
  }
}

async function identifyFromImage(imageData: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: [
      { type: 'text', text: 'Identify this retail product for shopping. Return JSON only with searchQuery, productType, brandGuess, color, and styleKeywords array. Make searchQuery concise and product-specific.' },
      { type: 'image_url', image_url: { url: imageData } }
    ]}],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(response.choices[0].message.content || '{}');
}

async function identifyFromUrl(url: string) {
  const q = queryFromUrl(url);
  return { productType: 'product', brandGuess: '', color: '', styleKeywords: [q], searchQuery: `${q} buy` };
}

async function shoppingSearch(query: string) {
  const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];

  const endpoint = new URL('https://serpapi.com/search.json');
  endpoint.searchParams.set('engine', 'google_shopping');
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('api_key', apiKey);
  endpoint.searchParams.set('gl', 'us');
  endpoint.searchParams.set('hl', 'en');

  const res = await fetch(endpoint.toString());
  const data = await res.json();
  const raw = (data.shopping_results || []).filter((r: any) => r.title && (r.link || r.product_link));
  const prices = raw.map((r: any) => extractPrice(r.price || r.extracted_price)).filter(Boolean);
  const avg = prices.length ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;

  return raw.slice(0, 12).map((r: any) => {
    const priceNum = extractPrice(r.price || r.extracted_price);
    const link = r.link || r.product_link;
    return {
      title: r.title,
      price: r.price || (priceNum ? `$${priceNum}` : 'Check price'),
      extractedPrice: priceNum,
      source: r.source || r.seller || 'Store',
      link,
      image: r.thumbnail || r.serpapi_thumbnail || '',
      reason: '',
      dealRating: scoreDeal(priceNum, avg),
      cheapTrustRating: cheapTrust(r.source || r.seller || '', link),
      isLiveResult: true
    };
  });
}

export async function POST(req: Request) {
  try {
    const { url, imageData } = await req.json();
    const identified = imageData ? await identifyFromImage(imageData) : await identifyFromUrl(url);
    const searchQuery = cleanText(identified.searchQuery || 'product buy');
    const results = await shoppingSearch(searchQuery);
    return NextResponse.json({ identified: { ...identified, searchQuery }, results, needsShoppingApi: !process.env.SERPAPI_KEY && !process.env.SERPAPI_API_KEY });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
