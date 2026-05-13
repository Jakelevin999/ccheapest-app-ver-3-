# CheaperFind MVP

AI shopping app: upload a product photo or paste a product URL, identify the item, search for cheaper alternatives, and show buy links.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Add API keys

- `OPENAI_API_KEY` for image identification
- `SERPAPI_API_KEY` for Google Shopping results
- Supabase keys for login/saved items
- Stripe keys for subscriptions

Without keys, the app returns demo results so the UI still works.

## Before App Store

1. Deploy web MVP to Vercel.
2. Test image uploads and product links.
3. Add Supabase auth and saved items.
4. Add Stripe subscription page.
5. Wrap with Capacitor or rebuild in React Native/Expo.
6. Test through TestFlight.
7. Submit Apple privacy labels, screenshots, app description, and privacy policy.

## New app UI features

- Bottom tab navigation: Search, Results, Favorites, Premium, Settings
- Favorites can be saved locally with the heart button
- Settings includes Light, Dark, and System theme modes
- Favorites are stored in `localStorage` for the MVP. For production, connect the same UI to Supabase using `docs/supabase-schema.sql`.

<!-- deployment trigger after reset -->
<!-- fresh deployment build trigger -->
