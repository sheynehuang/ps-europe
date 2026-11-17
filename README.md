# PS. Europe 🎈

A playful travel companion for a 3-week Europe trip (Paris → Lucerne → Florence → Rome → Barcelona → Lisbon, 9–29 Dec 2026).

## Run it

```bash
npm install          # behind the office proxy? add: --noproxy=registry.npmjs.org
npm run dev          # opens on http://localhost:5173 and your LAN IP (open that on your iPhone)
npm test             # expense-splitting + currency maths
npm run build        # static site in dist/ (works on any static host, uses #/ routes)
```

**Deploy (free):** push to `main` on GitHub. `.github/workflows/deploy.yml` tests, builds and publishes to GitHub Pages (enable it once under Settings → Pages → Source: *GitHub Actions*).

On iPhone: open the LAN URL (or your GitHub Pages URL) in Safari → Share → **Add to Home Screen** for a full-screen app feel.

## What's where

| Tab | Features |
|---|---|
| **Home** | Countdown, trip stats, route, up next, quick access, crew activity |
| **Plan** | Itinerary by city → day. Activities, flights, trains, stays, reservations, each with time, location, notes, cost, linked saved place |
| **Explore** | Leaflet/OpenStreetMap map, saved places by category, visited ticks, "add to plan" links places to activities. Tap the map to drop a pin |
| **Money** | Multi-currency expenses converted to TWD, categories, shared vs personal, budget, charts, who owes whom |
| **More → Wallet** | Booking tickets (pulled from the itinerary), documents, emergency numbers with tap-to-call |
| **More → Memories** | Daily journal with photos, mood, city filter |
| **More → Crew** | Members, invites, "viewing as" switcher, activity feed with who added or edited what |
| **More → Tools** | Currency converter (live rates from open.er-api.com, or type them yourself), flight status links (FlightAware/Google), checklist, wishlist |

No live data is faked. Exchange rates are fetched only when you tap **Fetch latest**, and flight status opens real trackers. Bookings, codes and prices in the demo data are samples; **More → Reset demo data** restores them.

## Code layout

```
src/data/seed.js      sample trip data (all collections)
src/data/backend.js   load/save. The only place that knows storage (localStorage today)
src/data/store.jsx    React context: add / update / remove + "who changed it" stamps + activity log
src/lib/              dates, money (tested), rates, image compression, category metadata
src/components/       Sheet, FormSheet (config-driven forms), Seg, Avatar, ItemCard, ItemSheet, HeroArt
src/pages/            one file per screen
supabase/schema.sql   tables + row-level security matching the data model
```

## Supabase (shared data + login)

Already wired up in `src/data/backend.js`. All data lives in one `rows` table (JSON per item). A local cache plus an outbox keep the app usable when the connection drops, and changes sync when it comes back. Realtime pushes edits to the other phone.

One-time setup:
1. Supabase → SQL Editor: paste `supabase/schema.sql`, put your real emails in step 6, then Run.
2. Authentication → Emails → **Magic Link** template: add `{{ .Token }}` so the email contains a 6-digit code. Codes work in home-screen apps; links don't.
3. Sign in. The first sign-in fills the shared trip with the demo data.

Invite more people from the Crew page (adds them to `members`).
