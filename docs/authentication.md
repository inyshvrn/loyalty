# Authentication — Setup & Local Testing

Milestone 3 implementation notes. For the product rules this satisfies, see
`docs/product-requirements.md` (Registration & auth) and
`docs/technical-architecture.md` (Auth flow).

## How it works

- **Stack**: Auth.js v5 (`next-auth@beta`), Credentials provider, JWT sessions
  (no database session/adapter tables — Credentials + JWT doesn't need them).
- **Passwords**: hashed with `bcryptjs` (cost factor 12).
- **Email verification**: a signed, expiring JWT (`jose`, 24h expiry) embedded
  in the verification link — there's no `VerificationToken` table. The token
  carries the user id + email and is verified stateless via `AUTH_SECRET`.
- **Roles**: `CUSTOMER`, `BARISTA`, `ADMIN` on the `User` model.
  `src/proxy.ts` (Next.js 16 renamed Middleware to Proxy — same mechanism,
  new filename, must live next to `src/app`) reads the role out of the
  session and redirects/blocks access per route group (`/dashboard`+`/history`
  = customer, `/scan` = barista, `/admin/*` = admin). Each role layout
  (`src/app/(customer)/layout.tsx` etc.) also checks the role itself as
  defense-in-depth, independent of proxy.
- **Enumeration safety**: login always returns the same generic "email atau
  kata sandi salah" for both an unknown email and a wrong password (constant
  work is done either way by comparing against a dummy bcrypt hash when no
  user is found). Registration and the resend-verification form also always
  return the same generic response regardless of whether the email is
  already registered.

## Environment variables

See `.env.example` for the full list. To generate a local `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Email delivery in local development

`RESEND_API_KEY` is meant to be **left blank locally**. When it's unset,
`sendVerificationEmail()` (`src/lib/email.ts`) logs the verification link to
the server console instead of calling Resend, so the full register → verify →
login flow works without a Resend account:

```
[dev] Verification link for sarah@example.com: http://localhost:3000/api/verify-email?token=...
```

Copy that URL into a browser to complete verification. Once you do have a
Resend account, set `RESEND_API_KEY`. Resend's shared sandbox sender
(`onboarding@resend.dev`, the default in `.env.example`) only delivers to the
email address on your own Resend account — verify a sending domain in Resend
before testing with arbitrary recipient addresses.

**This fallback cannot fire in production.** It's gated on
`process.env.NODE_ENV === "production"` explicitly, not just on whether
`RESEND_API_KEY` happens to be set — Next.js sets `NODE_ENV=production`
automatically for `next build`/`next start` and on Vercel, so the check
doesn't depend on remembering to set anything. If `RESEND_API_KEY` is missing
in production, `sendVerificationEmail()` throws instead of logging the
token or silently no-oping — a missing key in prod is a deploy
misconfiguration that should fail loudly, not leak a live verification token
into production logs.

## Barista & admin accounts (seeded, not self-registered)

Per the product spec, only customers self-register. Barista and admin
accounts are created out-of-band via a seed script:

```bash
npm run db:seed
```

This upserts (safe to re-run) two accounts with obvious dev-only placeholder
credentials, printed to the console after seeding:

| Role    | Default email                | Default password |
| ------- | ----------------------------- | ----------------- |
| Admin   | `admin@handaicoffee.test`     | `ChangeMe123!`     |
| Barista | `barista@handaicoffee.test`   | `ChangeMe123!`     |

**These are placeholders, not real credentials** — nothing sensitive is
committed to the repo. To use your own values instead, set these in `.env`
before seeding (see `.env.example`):

```
SEED_ADMIN_EMAIL="you@example.com"
SEED_ADMIN_PASSWORD="something-only-you-know"
SEED_BARISTA_EMAIL="barista@example.com"
SEED_BARISTA_PASSWORD="something-only-you-know"
```

To change an account's password later (there's no admin UI for this yet —
that's Milestone 6), either re-seed with new env values (upsert only touches
accounts that don't exist yet, so you'd need to delete the row first via
Prisma Studio) or update it directly:

```bash
npx prisma studio
```

## Local testing checklist

1. `npx prisma dev` running (or a real `DATABASE_URL`), migrations applied.
2. `npm run db:seed` to get barista/admin accounts.
3. `npm run dev`.
4. Register a customer at `/register` → check the server console for the
   verification link (or your inbox, if Resend is configured) → open it →
   land on `/verify-email?status=success` → log in at `/login` → redirected
   to `/dashboard`.
5. Log in with the seeded barista/admin accounts → redirected to `/scan` /
   `/admin/dashboard` respectively.
6. Try visiting `/admin/dashboard` as a logged-in customer (or `/dashboard`
   as an admin) — proxy (`src/proxy.ts`) redirects you back to your own
   role's home.
7. Try visiting `/dashboard` while logged out — redirected to `/login`.
