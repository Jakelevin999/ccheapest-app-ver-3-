import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cleanText(value = '') {
  return value.replace(/\s+/g, ' ').replace(/access to this page has been denied/gi, '').trim();
}

function queryFromUrl(rawUrl: string) {
  try {
    const u = new URL(rawUrl);
    const pathWords = decodeURIComponent(u.pathname)
      .replace(/[-_+\/]+/g, ' ')
      .replace(/\b(product|products|p|dp|item|shop|collections|mens|womens)\b/gi, ' ')
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
      { type: 'text', text: 'Identify this retail product for shopping search. Return compact JSON only with productType, brandGuess, color, styleKeywords array, searchQuery.' },
      { type: 'image_url', image_url: { url: imageData } }
    ]}],
    response_format: { type: 'json_object' }
  });
  return JSON.parse(response.choices[0].message.content || '{}');
}

async function identifyFromUrl(url: string) {
  const fallback = queryFromUrl(url);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = cleanText($('meta[property="og:title"]').attr('content') || $('title').text() || fallback);
    const image = $('meta[property="og:image"]').attr('content') || '';
    const price = $('meta[property="product:price:amount"]').attr('content') || '';
    const blocked = !title || /access denied|access to this page has been denied|forbidden|captcha/i.test(title + ' ' + html.slice(0, 500));
    const finalTitle = blocked ? fallback : title;
    return { productType: 'product', brandGuess: '', color: '', styleKeywords: [finalTitle], searchQuery: `${finalTitle} cheaper alternative`, original: { title: finalTitle, image, price, url } };
  } catch {
    return { productType: 'product', brandGuess: '', color: '', styleKeywords: [fallback], searchQuery: `${fallback} cheaper alternative`, original: { title: fallback, image: '', price: '', url } };
  }
}

function fallbackSearchLinks(query: string) {
  const q = encodeURIComponent(query);
  return [
    { title: `Search Google Shopping for ${query}`, price: 'Live prices', source: 'Google Shopping', link: `https://www.google.com/search?tbm=shop&q=${q}`, image: '', reason: 'Connect SERPAPI_KEY for in-app prices' },
    { title: `Find ${query} on Amazon`, price: 'Compare', source: 'Amazon', link: `https://www.amazon.com/s?k=${q}`, image: '', reason: 'Opens live marketplace search' },
    { title: `Find ${query} on Depop`, price: 'Compare', source: 'Depop', link: `https://www.depop.com/search/?q=${q}`, image: '', reason: 'Good for cheaper used fashion' },
    { title: `Find ${query} on SHEIN`, price: 'Compare', source: 'SHEIN', link: `https://us.shein.com/pdsearch/${q}/`, image: '', reason: 'Good for cheap dupes' }
  ];
}

async function shoppingSearch(query: string) {
  const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;
  if (!apiKey) return fallbackSearchLinks(query);

  const endpoint = new URL('https://serpapi.com/search.json');
  endpoint.searchParams.set('engine', 'google_shopping');
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('api_key', apiKey);
  const res = await fetch(endpoint.toString());
  const data = await res.json();
  const live = (data.shopping_results || []).slice(0, 12).map((r: any) => ({ title: r.title, price: r.price, source: r.source, link: r.link || r.product_link, image: r.thumbnail, reason: 'Live shopping result' }));
  return live.length ? live : fallbackSearchLinks(query);
}

export async function POST(req: Request) {
  try {
    const { url, imageData } = await req.json();
    const identified = imageData ? await identifyFromImage(imageData) : await identifyFromUrl(url);
    const searchQuery = cleanText(identified.searchQuery || identified.original?.title || 'cheaper product alternative');
    const results = await shoppingSearch(searchQuery);
    return NextResponse.json({ identified: { ...identified, searchQuery }, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}
