# Technical Architecture — Handai Coffee Loyalty

## Stack

| Aspect | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | |
| Backend | Next.js Server Actions | No separate REST API needed for MVP |
| Database | PostgreSQL | Hosted free tier: Neon or Supabase |
| ORM | Prisma | |
| Auth | NextAuth.js (Auth.js), Credentials provider | Email verification is not built-in to NextAuth and is hand-rolled |
| Email delivery | Resend | Used for the email verification flow |
| UI | Tailwind CSS + shadcn/ui | |
| QR generate | `qrcode` | One QR per customer, generated at registration |
| QR scan | `html5-qrcode` | Reads the device camera in the browser, used on the barista scan page |
| State management | React built-in state only | No Redux/Zustand — app doesn't need complex client state |
| Deployment | Vercel (app) + Neon/Supabase (database) | |

Chosen over an equivalent Laravel stack because the user wants Next.js/React experience for their portfolio; the tradeoff accepted is that auth + email verification takes more manual setup than Laravel Breeze would give for free.

## Roles & routing

All three roles (pelanggan, barista, admin) share a single login form. After authentication, `middleware.ts` redirects and gates access based on the user's role.

```
/app
  /(public)        -> landing, login, register, verify-email
  /(customer)       -> dashboard (QR + stamp progress), history
  /(barista)         -> scan (camera + manual search fallback)
  /(admin)            -> dashboard, customers, baristas, settings
/lib
  auth.ts            -> NextAuth config
  prisma.ts           -> Prisma client singleton
  /actions           -> server actions grouped by feature (customer.ts, barista.ts, admin.ts)
/components/ui       -> shadcn components
/prisma/schema.prisma
middleware.ts         -> role-based route protection
```

## Data model (conceptual)

- **User** — id, name, email (unique, verified flag), phone, password hash, role (customer / barista / admin), createdAt.
- **Stamp** (a.k.a. Visit) — id, customerId, createdAt, scannedByBaristaId. One row per scan. Used to enforce "max 1 per customer per day" and to compute current progress toward N.
- **RewardClaim** — id, customerId, confirmedByBaristaId, claimedAt. Written when a barista confirms a reward hand-off; this is what resets the customer's stamp progress and is never deleted (permanent history), only cancellable by an admin via a status/void flag rather than hard delete.
- **LoyaltySetting** — key/value (or a single-row config table) holding the current stamp threshold N, editable by admin.

Current stamp progress is derived, not stored directly: count of `Stamp` rows for a customer since their last `RewardClaim` (or since registration if none yet).

## Auth flow

1. Customer submits registration form (name, email, phone, password) -> `User` created with `emailVerified = false`.
2. Verification email sent via Resend with a signed token/link.
3. Clicking the link marks `emailVerified = true`; unverified users are blocked from logging in.
4. Login (NextAuth Credentials) checks email + password + verified flag.
5. On success, `middleware.ts` reads the role from the session and redirects to `/dashboard` (customer), `/scan` (barista), or `/admin` accordingly, and blocks cross-role access to those route groups.

Barista and admin accounts are created directly by an admin (no self-registration path for staff), so they skip the email-verification step.

## QR & scan flow

1. At registration, a QR payload (customer's unique id/token) is generated and stored/derived; the customer's dashboard renders it via `qrcode` on every visit — nothing is stored only on-device, so it survives a lost or replaced phone.
2. On the barista's `/scan` page, `html5-qrcode` reads the device camera and decodes the token client-side, then calls a server action to record a `Stamp` (validated server-side: max 1 per customer per day).
3. If scanning fails, the barista uses a manual search (name/email/phone) on the same page as a fallback to add the stamp.
4. Once a customer's stamp count reaches N, the scan page shows an "eligible" state with a "confirm reward given" action, which a barista triggers after handing over the free item; this writes a `RewardClaim` and resets progress.

## Deployment

- App deployed to Vercel, connected to the git repository.
- Database on Neon or Supabase (free tier), connected via `DATABASE_URL`.
- Secrets (NextAuth secret, Resend API key, database URL) set as environment variables in Vercel, not committed to the repo.
