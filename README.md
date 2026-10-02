# Powerlifting Notebook

A powerlifter's notebook: OpenPowerlifting record on the home page, meet countdown and attempt planner, six-phase warm-ups with tick-off exercises and timers, technique cues, rehab work, a bodyweight tracker, and a daily-calories tracker. Password-gated, mobile-first. Forked from Marc's personal powerlifting hub.

## Stack

- Next.js (App Router) + TypeScript + Tailwind, deployed on Vercel
- Neon Postgres via Drizzle ORM (`npm run db:push` syncs the schema)
- One-password auth: signed session cookie, enforced for every route by `src/proxy.ts`
- OpenPowerlifting data fetched server-side from `openpowerlifting.org/api/liftercsv/<username>`, cached for a day

## Local development

```bash
npm install
npm run dev
```

Local config lives in `.env.local` (gitignored — see `.env.example`). Without `DATABASE_URL` the app still runs; data pages show a setup notice. Once Vercel + Neon are connected, replace it with real values via `vercel env pull .env.local`, then `npm run db:push` to create the tables.

## One-time setup (Vercel + Neon + GitHub)

1. Push this repo to GitHub as a **private** repo.
2. On [vercel.com](https://vercel.com), import the repo as a new project.
3. In the Vercel project: **Storage → Create Database → Neon** — this injects `DATABASE_URL` automatically.
4. In **Settings → Environment Variables**, add `APP_PASSWORD` (your login password) and `SESSION_SECRET` (any long random string, e.g. `openssl rand -base64 32`).
5. Redeploy, then locally: `vercel env pull .env.local` and `npm run db:push` to create the tables.
6. Open the app, log in, go to **Settings** and paste your OpenPowerlifting profile URL.

## Privacy

Everything except `/login` requires a valid session cookie (180-day expiry, httpOnly, signed with `SESSION_SECRET`). The privacy test after any deploy: open the production URL in an incognito window — every route should land on the login page.
