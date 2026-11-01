# Pasyar

Your Catanduanes trip, planned in 60 seconds. A mobile-first web app (PWA) for DOST IGNITE Catanduanes 2026.

Travelers answer five questions and get a day-by-day plan built only from real places and local operators, drawn as a route on the map, then book guides, rooms, vans and boats in one checkout. Operators get a free dashboard. The province gets demand data.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Production: `npm run build && npm start`.

## Deploy on Vercel

1. vercel.com → Add New → Project → import `Arkrne/Pasyar`.
2. Framework preset: Next.js (auto-detected). Leave build and output settings at their defaults. Root directory: `./`.
3. Optional environment variables: `ANTHROPIC_API_KEY` (AI concierge) and `NEXT_PUBLIC_SITE_URL` (your custom domain).
4. Deploy. Every push to `main` redeploys.

Optional `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...   # turns on Claude for the "Ask Pasyar" concierge (falls back to built-in answers without it)
PASYAR_MODEL=claude-sonnet-5-5
NEXT_PUBLIC_SITE_URL=https://your-domain
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Landing: cinematic hero, quick start, scroll-drawn route, towns, community, storm mode, operators, money split |
| `/plan` | Wizard, one question per screen |
| `/trip` | Itinerary with animated route map, swap / lock / remove, cheaper / adventurous, storm re-plan, share, save, checkout, concierge |
| `/explore` | Tappable municipality map (11 towns), town history, food, festivals, operators, directory, transport board, alerts, emergency |
| `/community` | Feed, double-tap like, copy-this-trip, posts with photo upload, verified reviews |
| `/trips` | QR e-tickets, live booking status, saved offline plans |
| `/market` | Pasalubong marketplace (abacá, pili, latik, crafts) |
| `/business` | Operator dashboard: live inbox, accept/decline, listings, prices, featured, POS, sales calendar, commission ledger, review replies |
| `/insights` | LGU / DOT data view |
| `/about` | The pitch: problem, solution, business model canvas, unit economics, Q&A, roadmap |
| `/credits` | Photo and data credits |

## Demo script (about 4 minutes)

1. **Landing.** Let the hero crossfade once. Scroll slowly through "Watch your trip draw itself".
2. **Plan.** Tap Plan my trip → 3 days → Barkada → Comfortable → Surf + Hills → Fly to Virac → Build.
3. **Reveal.** Route draws on the map. Scroll the days; the map follows. Tap Swap on a stop, then Cheaper.
4. **Storm.** Profile → Simulate typhoon, back to the trip → "Re-plan for the storm". Boats and beaches disappear.
5. **Book.** Book → Pay. QR ticket appears.
6. **Operator.** Open `/business` **in a second tab before booking** and the new booking toasts in live. Accept it; the traveler's Trips tab updates.
7. **Community.** Copy this trip on Bea's post → it becomes your editable plan.
8. **Explore.** Tap Pandan on the map → history, food, festivals, operators.
9. **Insights.** Show money reaching each town.

Profile → Reset demo data puts everything back.

## How the planner works

`src/lib/planner.ts` is deterministic and grounded: it scores places by interests, ratings, group type and weather, splits the island into four areas, loops the island on longer trips, orders stops by nearest neighbour, estimates van drive times, and attaches bookable services. It never invents a place or price. The concierge (`/api/concierge`) gives Claude the same data and tells it to stay inside it.

`npx tsx scripts/plan-smoke.ts` prints sample plans for 1, 3, 5 and 7 days.

## Data honesty

- Places, history, festivals, food and fees come from Wikipedia, provincial tourism write-ups and recent traveler reports. Fees are as last reported; confirm on site.
- Coordinates were geocoded from OpenStreetMap.
- **Operator names are placeholders** until real partners sign letters of intent. Payments are simulated.
- Places marked "Nearby area" use a photo of the surrounding area, not the exact spot.
- The transport board is a sample schedule.
- Bikol UI strings should be checked by a Virac native.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Motion, Leaflet + MapLibre (OpenFreeMap tiles), Zustand (local persistence + cross-tab live sync), Open-Meteo weather and marine APIs, Anthropic SDK. State is in the browser for the demo; the schema maps directly onto Supabase tables for the pilot.
