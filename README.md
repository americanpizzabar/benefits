# MyPerks — a benefits *lifestyle* app

Discover and use your company's benefits through the moments of your day, instead
of digging through an HR PDF. Built with **Next.js 16 (App Router)**, **Supabase**
(Postgres / Auth / Storage), **Anthropic Claude** for AI, and deployed on **Vercel**.

## Core ideas

- **Lifestyle-scene navigation** — perks are organised by daily life: **Eat**,
  **Move & Learn**, **Relax & Play**, **Life Events** — not by policy name.
- **AI PDF breakdown** — HR uploads a benefits PDF; Claude (`claude-opus-4-8`)
  structures it into concrete, actionable perks (action + amount/discount + scene).
- **Today's pick** — time-of-day / weekday / season / lifestyle-aware suggestion.
- **Benefit Tracker + gamification** — running "saved" counter, monthly chart, badges.
- **Nearby Rewards map** — partner spots on a Google Map (Maps JavaScript API).
- **Digital wallet** — one-tap QR + barcode member card to show at the register.
- **i18n (English base + Japanese)** with AI **cultural context tips** (e.g. 慶弔見舞金).
- **Community** — auto-translated Tips & Reviews and a "Find a Buddy" board.

## Architecture

```
app/[locale]/…        Localised pages (home, scene, benefit, tracker, map,
                      wallet, community, profile, onboarding, sign-in, admin)
app/api/…             Route handlers (PDF parse, benefit translate)
app/auth/callback     Magic-link / OAuth code exchange
proxy.ts              Next 16 proxy = next-intl routing + Supabase session refresh
i18n/                 next-intl routing / navigation / request config
lib/                  supabase clients, data layer, AI (Claude), suggest, savings…
components/           UI (cards, tiles, map, wallet, reviews, admin upload…)
supabase (via MCP)    schema + RLS + seed (see lib/database.types.ts)
```

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase publishable/anon key |
| `ANTHROPIC_API_KEY` | for AI | Enables PDF parsing & translation. Without it the app runs; AI features return a "key needed" notice. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | for map | Browser key for the Google Maps JavaScript API. Without it the Nearby Rewards map shows a "not configured" notice; the rest of the app is unaffected. |

Copy `.env.local` (already created locally) or set these in Vercel project settings.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /en
```

### Demo account

A confirmed **admin** demo user is seeded:

- **Email:** `demo@myperks.app`
- **Password:** `perksdemo123`

On the sign-in screen, use the password fields or tap **"Try the demo account"**.
Real users sign in via magic link (requires SMTP configured in Supabase).

## Build & lint

```bash
npm run build
npm run lint
```

## Notes

- Database schema, RLS policies, storage bucket and seed data are provisioned in
  Supabase (types in `lib/database.types.ts`).
- The AI pipeline uses Claude structured outputs (`output_config.format`) and PDF
  document blocks; all AI calls live in `lib/ai/anthropic.ts` and run server-side.
