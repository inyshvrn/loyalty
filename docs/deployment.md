# Deployment — Milestone 8 Notes

Live at **https://handai-coffee-loyalty.vercel.app**. This doc records how
production was set up and what's still outstanding — no secrets here, just
process (see `.env.example` for the variable names).

## What's configured

- **App**: Vercel project `handai-coffee-loyalty` (renamed from
  `project_coba_coba` — the old `projectcobacoba.vercel.app` domain still
  resolves to the same deployment, kept as a secondary alias), Git-connected
  to `github.com/inyshvrn/loyalty` — pushes to `main` auto-deploy to
  production.
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

## Resend (customer self-registration email)

`RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set in production (marked
Sensitive on Vercel — their values can't be read back via `vercel env ls`/
`pull`, only overwritten). The `handaicoffee.my.id` domain is verified in
Resend, and `RESEND_FROM_EMAIL` is `verifikasi@handaicoffee.my.id`. Confirmed
working end to end against production (2026-09-15): a real registration
received the verification email.

If self-registration ever starts erroring again in production, the most
likely cause is `RESEND_FROM_EMAIL` reverting to the shared sandbox sender
(`onboarding@resend.dev`) — Resend restricts that sender to only deliver to
the Resend account's own email, so real customers' addresses get rejected
with a "testing email" validation error (visible in `vercel logs`). Fix:
```bash
vercel env rm RESEND_FROM_EMAIL production --yes
vercel env add RESEND_FROM_EMAIL production   # verifikasi@handaicoffee.my.id
vercel deploy --prod   # env var changes only apply to a NEW deployment
```

## Adding the first barista account

No barista account was seeded. Once logged in as admin, create one directly
in the UI: `/admin/baristas` → "Tambah Barista".

## Database backups

Prisma Postgres's free tier has no automatic backups. Until the project is on
a paid tier (Starter+ gets daily managed backups), `scripts/backup-db.mjs`
is a manual stand-in: it dumps every row from every table into one timestamped
JSON file under `backups/` (gitignored — it's real customer data).

Setup (once):
1. Copy `scripts/backup.env.example` to `.env.backup` in the project root.
2. Fill in `DATABASE_URL` with the **direct** `postgres://` connection string
   from console.prisma.io → the project → Database → Connect (not the
   `prisma+postgres://` one Vercel uses — the backup script talks to Postgres
   directly via the `pg` driver).

Run manually: `node scripts/backup-db.mjs`. To automate it, register a daily
Windows Task Scheduler task that runs that command — see the scheduling
setup for the exact task name/time if it's already configured on this
machine.

To restore: point `DATABASE_URL` in `.env.backup` at a **fresh, empty**
database (run `prisma migrate deploy` against it first so the schema exists),
then `node scripts/restore-db.mjs backups/backup-<timestamp>.json`. It
refuses to run if any target table already has rows, so it can't silently
clobber live data.

This only covers data that changes: `prisma/schema.prisma` and the
`prisma/migrations/` history already live in git, so restoring the schema
itself doesn't depend on these dumps at all.

## If the database ever needs re-pointing

`DATABASE_URL` on Vercel is the only thing that matters for where production
data lives — update it via `vercel env` (rm + add, or the Vercel dashboard)
and redeploy. Migrations are applied with `prisma migrate deploy` against
whichever `DATABASE_URL` you export locally when running that command; it
does not read Vercel's env automatically.
