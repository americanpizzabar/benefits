# Database & environment

MyPerks runs on **Neon Postgres** with **Auth.js** (password auth) and **Vercel Blob**
for PDF storage.

## One-time setup

1. **Provision Neon** — in the Vercel project: *Storage → Create Database → Neon*.
   This injects `DATABASE_URL` automatically.
2. **Provision Vercel Blob** — *Storage → Create → Blob*. Injects `BLOB_READ_WRITE_TOKEN`.
3. **Set `AUTH_SECRET`** — a random string (e.g. `openssl rand -base64 32`) as a Vercel env var.
4. **Create the schema + seed** — open the Neon SQL editor (Vercel → Storage → Neon → Query)
   and run, in order:
   - [`db/schema.sql`](./schema.sql)
   - [`db/seed.sql`](./seed.sql)

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Neon integration | Postgres connection string |
| `AUTH_SECRET` | you set it | Auth.js JWT signing secret |
| `BLOB_READ_WRITE_TOKEN` | Blob integration | PDF upload storage |
| `ANTHROPIC_API_KEY` | you set it | AI PDF parse + translation (optional) |

## Demo account

`demo@myperks.app` / `perksdemo123` (seeded by `seed.sql`, admin enabled).
