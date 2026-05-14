import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const BLOCKED_MARKETPLACES = [
  'temu',
  'aliexpress',
  'alibaba',
  'dhgate',
  'taobao',
  'tiktok shop',
  'tiktok',
  'wish',
  'banggood',
  'lightinthebox',
  'romwe',
  'jollychic',
  'gearbest',
  'made-in-china',
  'madeinchina',
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

  return Number(m?.[1] || 0);
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
                  'Identify the main purchasable product in this image for shopping search.'
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

  // FAST PARALLEL SEARCHES
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
    opts.priceTier &&
    PRICE_TIERS[
      opts.priceTier
    ]
      ? PRICE_TIERS[
          opts.priceTier
        ]
      : null;

  const maxPrice =
    opts.maxPrice ||
    tier?.max;

  return raw

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

    .filter(
      (p:any) =>
        !maxPrice ||
        p.extractedPrice <=
          Number(maxPrice)
    )

    .slice(0, 40);
}

export async function POST(
  req:Request
) {
  const {
    description,
    url,
    imageData,
    specialFilters,
    maxPrice,
    priceTier
  } = await req.json();

  let query = '';

  // ONLY RUN IMAGE AI IF NEEDED
  if (
    imageData &&
    !description
  ) {
    const identified =
      await identifyImage(
        imageData
      );

    query = identified
      ? `${identified} cheaper alternatives buy`
      : '';
  }

  if (
    !query &&
    description &&
    description.trim()
      .length > 2
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
        ) +
        ' cheaper alternatives buy';
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
        maxPrice,
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
