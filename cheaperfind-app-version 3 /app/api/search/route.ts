import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function identifyFromImage(imageData: string) {
  if (!process.env.OPENAI_API_KEY) {
    return { productType: 'shirt', brandGuess: '', color: '', styleKeywords: ['streetwear', 'similar style'], searchQuery: 'streetwear shirt similar cheaper' };
  }
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: [
      { type: 'text', text: 'Identify this retail product for shopping search. Return compact JSON only with productType, brandGuess, color, styleKeywords array, searchQuery.' },
      { type: 'image_url', image_url: { url: imageData } }
    ]}],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(response.choices[0].message.content || '{}');
}

async function identifyFromUrl(url: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 CheaperFindBot' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
  const image = $('meta[property="og:image"]').attr('content') || '';
  const price = $('meta[property="product:price:amount"]').attr('content') || '';
  return { productType: 'product', brandGuess: '', color: '', styleKeywords: [title], searchQuery: `${title} cheaper alternative`, original: { title, image, price, url } };
}

async function shoppingSearch(query: string) {
  if (!process.env.SERPAPI_API_KEY) {
    return [
      { title: 'Demo result: similar budget option', price: '$29.99', source: 'Example Store', link: 'https://example.com', image: '', reason: 'Demo until API key is added' },
      { title: 'Demo result: closer premium match', price: '$49.99', source: 'Example Store', link: 'https://example.com', image: '', reason: 'Demo until API key is added' }
    ];
  }
  const endpoint = new URL('https://serpapi.com/search.json');
  endpoint.searchParams.set('engine', 'google_shopping');
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('api_key', process.env.SERPAPI_API_KEY);
  const res = await fetch(endpoint.toString());
  const data = await res.json();
  return (data.shopping_results || []).slice(0, 12).map((r: any) => ({ title: r.title, price: r.price, source: r.source, link: r.link || r.product_link, image: r.thumbnail, reason: 'Shopping result' }));
}

export async function POST(req: Request) {
  try {
    const { url, imageData } = await req.json();
    const identified = imageData ? await identifyFromImage(imageData) : await identifyFromUrl(url);
    const results = await shoppingSearch(identified.searchQuery || identified.original?.title || 'cheaper product alternative');
    return NextResponse.json({ identified, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
