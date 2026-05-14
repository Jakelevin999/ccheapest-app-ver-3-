import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const BLOCKED_MARKETPLACES = [
  'temu',
  'aliexpress',
  'alibaba',
  'dhgate',
  'taobao',
  'wish',
  'banggood',
  'lightinthebox',
  'romwe',
  'gearbest',
  '1688'
];

const PRICE_TIERS:any = {
  Saver: {
    max: 75,
    words:
      'budget affordable sale outlet discount low price'
  },

  Standard: {
    max: 250,
    words:
      'popular best value regular price quality'
  },

  Baller: {
    max: 5000,
    words:
      'luxury designer premium high end'
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
    r.extensions?.join(' ') ??
    r.snippet ??
    '';

  const m = String(raw).match(
    /([0-5](?:\.\d)?)/
  );

  return Number(
    m?.[1] || 0
  );
}

function passesRating(r:any) {
  const rating =
    extractRating(r);

  if (!rating)
    return true;

  return rating >= 4;
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

  return cleanText(q);
}

async function identifyImage(
  imageData:string
) {
  if (
    !imageData ||
    !process.env.OPENAI_API_KEY
  ) {
    return '';
  }

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
            role:'user',

            content:[
              {
                type:
                  'input_text',

                text:
                  'Identify the product in this image.'
              },

              {
                type:
                  'input_image',

                image_url:
                  imageData,

                detail:'low'
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

  const pages = [0,20,40];

  const responses =
    await Promise.all(
      pages.map(async (start) => {
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
          String(start)
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

  const mapped = raw

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
          r.seller ||
          'Store',

        link:
          r.product_link ||
          r.link ||
          '',

        image:
          r.thumbnail ||
          r.serpapi_thumbnail ||
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

    .filter(
      (p:any) =>
        !maxPrice ||
        p.extractedPrice <=
          maxPrice
    );

  const seen =
    new Set<string>();

  return mapped.filter(
    (p:any) => {
      const key =
        `${p.title}-${p.source}`.toLowerCase();

      if (seen.has(key))
        return false;

      seen.add(key);

      return true;
    }
  );
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

  else if (!query && url) {
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

  const results =
    await shoppingSearch(
      query,
      {
        specialFilters,
        priceTier
      }
    );

  return NextResponse.json({
    results,
    query,
    priceTier,
    specialFilters
  });
}
