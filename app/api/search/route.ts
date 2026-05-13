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

const BLOCKED_STYLE_RESALE = [
  'ebay',
  'mercari'
];

const OFFICIAL_RETAILERS =
  /amazon|walmart|target|bestbuy|best buy|nike|adidas|apple|zara|uniqlo|asos|nordstrom|macys|gap|old navy|urban outfitters|stockx|goat|rei|costco|wayfair|gucci|neiman marcus|saks|bloomingdale|farfetch|ssense|net-a-porter|mr porter|prada|balenciaga|dior|louis vuitton|mytheresa|fwrd|revolve|matches|luisaviaroma|harrods|selfridges/i;

const BALLER_RETAILERS =
  /nordstrom|neiman marcus|saks|bloomingdale|farfetch|ssense|net-a-porter|mr porter|prada|balenciaga|dior|louis vuitton|matches|mytheresa|fwrd|revolve|luisaviaroma|harrods|selfridges|boutique|stockx|goat/i;

const GREEN_WORDS =
  /bpa free|greenguard|green guard|vegan|cruelty free|non toxic|organic|recycled|sustainable|eco|fair trade|fsc|certified|gots|oeko|bluesign/i;

const KNOWN_BRANDS = [
  'nike',
  'adidas',
  'apple',
  'sony',
  'dyson',
  'stanley',
  'yeti',
  'lululemon',
  'alo',
  'zara',
  'uniqlo',
  'gap',
  'carhartt',
  'levi',
  'north face',
  'patagonia',
  'new balance',
  'asics',
  'puma',
  'reebok',
  'vans',
  'converse',
  'gucci',
  'prada',
  'dior',
  'balenciaga'
];

const PRICE_TIERS:any = {
  Saver: {
    max: 35,

    words:
      'cheap budget low price discount sale dupe affordable under $35'
  },

  Standard: {
    max: 180,

    words:
      'best value quality popular mid range everyday premium'
  },

  Baller: {
    max: 2500,

    words:
      'luxury designer premium high end exclusive boutique'
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
  return extractRating(r) >= 4;
}

function isAbsoluteUrl(link='') {
  return /^https?:\/\//i.test(
    link
  );
}

function productKey(p:any) {
  return cleanText(
    `${p.title}-${p.source}-${p.price}`
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 180);
}

function sourceKey(v='') {
  return cleanText(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 3)
    .join(' ');
}

function randomSeed(seed:any) {
  return Math.floor(
    (Number(seed) || 0) +
      Date.now() +
      Math.random() *
        1000000
  );
}

function shuffle<T>(
  arr:T[],
  seed=1
) {
  const out = [...arr];

  let s =
    Math.max(
      1,
      Number(seed) || 1
    ) *
      9301 +
    49297;

  for (
    let i = out.length - 1;
    i > 0;
    i--
  ) {
    s =
      (s * 9301 + 49297) %
      233280;

    const j = Math.floor(
      (s / 233280) *
        (i + 1)
    );

    [out[i], out[j]] = [
      out[j],
      out[i]
    ];
  }

  return out;
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

function blockedForStyle(
  source='',
  link='',
  title=''
) {
  const t =
    `${source} ${link} ${title}`.toLowerCase();

  return BLOCKED_STYLE_RESALE.some(
    (x) => t.includes(x)
  );
}

function cheapTrust(
  source='',
  link='',
  title=''
) {
  const t = (
    source +
    link +
    title
  ).toLowerCase();

  if (
    blockedStore(
      source,
      link,
      title
    )
  )
    return 1;

  if (
    OFFICIAL_RETAILERS.test(t)
  )
    return 9;

  return 5;
}

function greenScore(
  title='',
  source=''
) {
  const t =
    `${title} ${source}`;

  if (
    GREEN_WORDS.test(t)
  )
    return 8;

  return 4;
}

function detectBrand(q='') {
  const lower =
    q.toLowerCase();

  return KNOWN_BRANDS.find(
    (b) =>
      lower.includes(b)
  );
}

function buildSearchQuery(
  base='',
  opts:any={}
) {
  let q = cleanText(base);

  const brand =
    detectBrand(q);

  if (brand) {
    q = `${brand} ${q}`;
  }

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
                  'Identify the product in this image for shopping.'
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

function diversify(
  items:any[],
  seed=1
) {
  return shuffle(
    items,
    seed
  );
}

async function shoppingSearch(
  query:string,
  page=1,
  opts:any={}
) {
  const key =
    process.env.SERPAPI_KEY;

  if (!key || !query)
    return [];

  const entropy =
    randomSeed(
      opts.seed
    );

  const pageCount = 3;

  const pages = [
    1, 2, 3
  ];

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

  const mapped = shuffle(
    raw,
    entropy + 3
  )

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

    .filter(
      (r:any) =>
        !blockedStore(
          r.source ||
            '',
          r.link || '',
          r.title || ''
        )
    )

    .filter(
      (r:any) =>
        !opts.apparelOnly ||
        !blockedForStyle(
          r.source ||
            '',
          r.link || '',
          r.title || ''
        )
    )

    .map((r:any) => {
      const priceNum =
        extractPrice(
          r.price ||
            r.extracted_price
        );

      const source =
        r.source ||
        r.seller ||
        'Store';

      return {
        title: r.title,

        price:
          r.price ||
          `$${priceNum}`,

        extractedPrice:
          priceNum,

        source,

        link:
          r.link || '',

        image:
          r.thumbnail ||
          '',

        cheapTrustRating:
          cheapTrust(
            source,
            r.link,
            r.title
          ),

        greenRating:
          greenScore(
            r.title,
            source
          ),

        rating:
          extractRating(r)
      };
    })

    .filter(
      (p:any) =>
        isAbsoluteUrl(
          p.link
        ) &&
        p.extractedPrice >
          0
    )

    .filter(
      (p:any) =>
        !maxPrice ||
        p.extractedPrice <=
          Number(maxPrice)
    );

  const seen =
    new Set<string>();

  const deduped:any[] = [];

  for (const p of mapped) {
    const key =
      productKey(p);

    const sk =
      sourceKey(
        p.source
      );

    if (
      seen.has(
        `${key}-${sk}`
      )
    )
      continue;

    seen.add(
      `${key}-${sk}`
    );

    deduped.push(p);
  }

  return diversify(
    deduped,
    entropy + 11
  ).slice(0, 40);
}

export async function POST(
  req:Request
) {
  const {
    description,
    url,
    imageData,
    page,
    mode,
    specialFilters,
    maxPrice,
    priceTier,
    seed
  } = await req.json();

  const entropy =
    randomSeed(seed);

  let query = '';

  const apparelOnly =
    mode === 'style';

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
      ) +
      (apparelOnly
        ? ' clothing fashion'
        : ' buy');
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
      page || 1,
      {
        apparelOnly,
        specialFilters,
        maxPrice,
        priceTier,
        seed: entropy
      }
    );

  return NextResponse.json({
    results,
    query,
    priceTier,
    specialFilters,
    seed: entropy
  });
}
