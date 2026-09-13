# Deployment — Milestone 8 Notes

Live at **https://projectcobacoba.vercel.app**. This doc records how
production was set up and what's still outstanding — no secrets here, just
process (see `.env.example` for the variable names).

## What's configured

- **App**: Vercel project `project_coba_coba`, now Git-connected to
  `github.com/inyshvrn/loyalty` — pushes to `main` auto-deploy to production.
- **Database**: Prisma Postgres (`ap-southeast-1`, Singapore — closest region
  to the outlet), claimed into the owner's Prisma account so it's permanent
  (unclaimed `create-db` databases auto-delete after 24h). All migrations
  applied via `prisma migrate deploy`.
- **Env vars set on Vercel** (Production environment): `DATABASE_URL`,
  `AUTH_SECRET` (a fresh one, distinct from the local-dev value in `.env`),
  `AUTH_URL` (the production URL above).
- **First admin account**: seeded directly against production (not via the
  dev seed script/placeholders — those stay local-only). Admin can log in now
  at `/login` and reach `/admin/dashboard`.

## Function region matches the database region

`vercel.json` pins Vercel Functions to `sin1` (Singapore) via `"regions"`.
Without this, Vercel defaulted functions to `iad1` (US East) while the
database lives in `ap-southeast-1` (also Singapore) — every DB round trip
was crossing the Pacific twice, and pages doing several queries compounded
that into 2-5s navigations. Pinning both to Singapore (matching where the
outlet's actual users are too) brought that down to ~1s, measured directly
against production before/after. `preferredRegion` in Next.js route files is
deprecated for Vercel and no longer accepts arbitrary region codes — this
has to be set via `vercel.json`, not application code.

## Outstanding: Resend not configured yet

`RESEND_API_KEY` is **not set** in production. Per the fail-loud design from
`docs/authentication.md`, `sendVerificationEmail()` throws rather than
silently no-oping when this is missing in production — so **customer
self-registration will error out** until this is set. Nothing else is
affected (staff accounts are created pre-verified and don't need this).

To finish this:
1. Sign up at resend.com (free tier) and create an API key.
2. Either use the shared sandbox sender (`onboarding@resend.dev` — only
   delivers to the Resend account's own email, fine for a quick smoke test)
   or verify a real sending domain for a real "from" address.
3. Set on Vercel:
   ```bash
   vercel env add RESEND_API_KEY production
   vercel env add RESEND_FROM_EMAIL production
   ```
4. Redeploy (`vercel deploy --prod`, or just push to `main` now that Git
   auto-deploy is connected) so the new env vars take effect.

## Adding the first barista account

No barista account was seeded. Once logged in as admin, create one directly
in the UI: `/admin/baristas` → "Tambah Barista".

## If the database ever needs re-pointing

`DATABASE_URL` on Vercel is the only thing that matters for where production
data lives — update it via `vercel env` (rm + add, or the Vercel dashboard)
and redeploy. Migrations are applied with `prisma migrate deploy` against
whichever `DATABASE_URL` you export locally when running that command; it
does not read Vercel's env automatically.
