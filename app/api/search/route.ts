Go to:

app/api/search/route.ts

Delete EVERYTHING and replace it with this cleaner fixed version that:

* restores results
* keeps fast parallel searching
* keeps Saver cheaper
* removes the broken over-filtering
* improves fallback behavior
* avoids “No results” dead ends

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const BLOCKED_MARKETPLACES = [
  'temu',
  'aliexpress',
  'alibaba',
  'dhgate',
  'taobao',
  'tiktok shop',
  'wish',
  'banggood',
  'lightinthebox',
  'romwe',
  'jollychic',
  'gearbest',
  '1688'
];
const PRICE_TIERS:any = {
  Saver: {
    max: 60,
    words:
      'cheap budget affordable sale discount low price dupe'
  },
  Standard: {
    max: 250,
    words:
      'best value quality popular'
  },
  Baller: {
    max: 2500,
    words:
      'luxury premium designer high end boutique'
  }
};
function cleanText(v='') {
  return v
    .replace(/\s+/g, ' ')
    .trim();
}
function extractPrice(v:any='') {
  const m = String(v)
    .replace(/,/g, '')
    .match(
      /\$?([0-9]+(?:\.[0-9]{1,2})?)/
    );
  return m
    ? Number(m[1])
    : 0;
}
function extractRating(r:any) {
  const raw =
    r.rating ??
    r.product_rating ??
    r.reviews_rating ??
    r.snippet ??
    '';
  const m = String(raw).match(
    /([0-5](?:\.\d)?)/
  );
  return Number(m?.[1] || 0);
}
function passesRating(r:any) {
  const rating =
    extractRating(r);
  if (!rating)
    return true;
  return rating >= 3.5;
}
function isAbsoluteUrl(link='') {
  return /^https?:\/\//i.test(
    link
  );
}
function blockedStore(
  source='',
  link='',
  title=''
) {
  const t =
    `${source} ${link} ${title}`.toLowerCase();
  return BLOCKED_MARKETPLACES.some(
    (x) => t.includes(x)
  );
}
function shuffle<T>(
  arr:T[]
) {
  return [...arr].sort(
    () => Math.random() - 0.5
  );
}
function buildSearchQuery(
  base='',
  opts:any={}
) {
  let q = cleanText(base);
  if (
    opts.priceTier &&
    PRICE_TIERS[
      opts.priceTier
    ]
  ) {
    q +=
      ' ' +
      PRICE_TIERS[
        opts.priceTier
      ].words;
  }
  if (
    Array.isArray(
      opts.specialFilters
    ) &&
    opts.specialFilters.length
  ) {
    q +=
      ' ' +
      opts.specialFilters.join(
        ' '
      );
  }
  return cleanText(q);
}
async function identifyImage(
  imageData:string
) {
  if (
    !imageData ||
    !process.env.OPENAI_API_KEY
  )
    return '';
  try {
    const client =
      new OpenAI({
        apiKey:
          process.env.OPENAI_API_KEY
      });
    const response =
      await client.responses.create({
        model:
          'gpt-4.1-mini',
        input: [
          {
            role: 'user',
            content: [
              {
                type:
                  'input_text',
                text:
                  'Identify the main product in this image for shopping.'
              },
              {
                type:
                  'input_image',
                image_url:
                  imageData,
                detail: 'low'
              }
            ]
          }
        ]
      });
    return cleanText(
      response.output_text ||
        ''
    );
  } catch {
    return '';
  }
}
async function shoppingSearch(
  query:string,
  opts:any={}
) {
  const key =
    process.env.SERPAPI_KEY;
  if (!key || !query)
    return [];
  const pages = [1,2,3];
  const responses =
    await Promise.all(
      pages.map(async (p) => {
        const url =
          new URL(
            'https://serpapi.com/search.json'
          );
        url.searchParams.set(
          'engine',
          'google_shopping'
        );
        url.searchParams.set(
          'q',
          query
        );
        url.searchParams.set(
          'api_key',
          key
        );
        url.searchParams.set(
          'start',
          String(
            (p - 1) * 20
          )
        );
        url.searchParams.set(
          'gl',
          'us'
        );
        url.searchParams.set(
          'hl',
          'en'
        );
        const res =
          await fetch(
            url.toString(),
            {
              cache:
                'no-store'
            }
          );
        return res.json();
      })
    );
  const raw:any[] = [];
  for (const data of responses) {
    raw.push(
      ...(data.shopping_results ||
        [])
    );
  }
  const tier =
    PRICE_TIERS[
      opts.priceTier
    ];
  const maxPrice =
    tier?.max;
  const mapped = shuffle(raw)
    .filter(
      (r:any) =>
        r.title &&
        (r.price ||
          r.extracted_price)
    )
    .filter(
      (r:any) =>
        passesRating(r)
    )
    .map((r:any) => {
      const priceNum =
        extractPrice(
          r.price ||
            r.extracted_price
        );
      return {
        title: r.title,
        price:
          r.price ||
          `$${priceNum}`,
        extractedPrice:
          priceNum,
        source:
          r.source ||
          'Store',
        link:
          r.link || '',
        image:
          r.thumbnail ||
          '',
        rating:
          extractRating(r)
      };
    })
    .filter(
      (p:any) =>
        isAbsoluteUrl(
          p.link
        )
    )
    .filter(
      (p:any) =>
        !blockedStore(
          p.source,
          p.link,
          p.title
        )
    )
    .filter((p:any) => {
      if (!maxPrice)
        return true;
      const price =
        p.extractedPrice;
      if (!price)
        return true;
      return (
        price <=
        maxPrice * 1.35
      );
    });
  const seen =
    new Set<string>();
  const deduped:any[] = [];
  for (const p of mapped) {
    const key =
      `${p.title}-${p.source}`.toLowerCase();
    if (seen.has(key))
      continue;
    seen.add(key);
    deduped.push(p);
  }
  return deduped.slice(0, 40);
}
export async function POST(
  req:Request
) {
  const {
    description,
    url,
    imageData,
    specialFilters,
    priceTier
  } = await req.json();
  let query = '';
  if (
    imageData &&
    !description
  ) {
    const identified =
      await identifyImage(
        imageData
      );
    query = identified
      ? `${identified} buy`
      : '';
  }
  if (
    !query &&
    description
  ) {
    query =
      cleanText(
        description
      ) + ' buy';
  }
  if (!query && url) {
    try {
      const u =
        new URL(url);
      query =
        cleanText(
          u.pathname.replace(
            /[-_/]/g,
            ' '
          )
        ) + ' buy';
    } catch {
      query = url;
    }
  }
  query =
    buildSearchQuery(
      query,
      {
        specialFilters,
        priceTier
      }
    );
  let results =
    await shoppingSearch(
      query,
      {
        specialFilters,
        priceTier
      }
    );
  // fallback if too strict
  if (results.length < 4) {
    results =
      await shoppingSearch(
        cleanText(
          description ||
            query
        ),
        {
          priceTier:
            'Standard'
        }
      );
  }
  return NextResponse.json({
    results,
    query,
    priceTier,
    specialFilters
  });
}
