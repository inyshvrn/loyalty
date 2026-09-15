# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Live at https://handai-coffee-loyalty.vercel.app. Milestones 1–8 substantially complete per `docs/roadmap.md` — see `docs/deployment.md` for what's configured in production and what's still outstanding (Resend isn't set up yet, so customer self-registration currently errors in production; staff accounts are unaffected). Authentication setup and local testing steps: `docs/authentication.md`.

## Project summary

A loyalty-tracking web app for **Handai Coffee**, replacing a manual paper punch-card system. Customers self-register, get a persistent personal QR code, and baristas scan it at checkout to record a visit ("stamp"). After N stamps, the customer is eligible for one free small product, which a barista confirms explicitly.

Full requirements: `docs/product-requirements.md`. Architecture and data model: `docs/technical-architecture.md`. Milestones: `docs/roadmap.md`.

## Planned stack

- Next.js (App Router) + TypeScript
- Prisma ORM + PostgreSQL (Neon/Supabase)
- NextAuth.js (Auth.js), Credentials provider + email verification via Resend
- Tailwind CSS + shadcn/ui
- `qrcode` (generate) + `html5-qrcode` (scan via browser camera)
- Deployment: Vercel + Neon/Supabase

## Commands

- `npm run dev` / `build` / `lint` — standard Next.js commands.
- `npx prisma migrate dev` — apply schema changes locally.
- `npx prisma studio` — browse/edit the database.
- `npm run db:seed` — seed dev barista/admin accounts (see `docs/authentication.md`).
- `npx prisma dev` — start a local Postgres instance if not using a hosted `DATABASE_URL`.
- `npm run test:e2e` — Playwright end-to-end suite (`e2e/`) against `npm run dev`; needs the local dev DB running. `test:e2e:ui` opens Playwright's UI mode.

Milestone 7 was a manual/live-browser testing pass across roles and edge cases (see commit history) — that's still how most new features get verified. The `e2e/` suite is a newer, smaller safety net covering the highest-stakes flows (auth, login lockout, password reset, the core scan→eligible→claim path); it's not full coverage of the app, so don't treat a green run as a substitute for actually checking a change in the browser. Test fixtures talk to the dev database directly via `pg` (see `e2e/helpers.ts`) rather than through `@/lib/prisma` — the generated Prisma client is pure ESM (`import.meta`) and doesn't load under Playwright's test transform.

## Architecture notes for future work

- Three roles share one login form; redirect after auth is role-based (customer / barista / admin), enforced via `src/proxy.ts` (Next.js 16 renamed Middleware to Proxy).
- Business rule: 1 scan = 1 stamp, max 1 stamp per customer per day.
- On reaching the configurable threshold N, the customer becomes "eligible"; a barista must explicitly confirm the reward was given before the stamp count resets to 0. Every claim is logged (history is never deleted), and admins can manually adjust a stamp count or cancel a claim to correct barista mistakes.
- Deferred to a later phase (do not build unless asked) — see `docs/product-requirements.md` for detail on each: historical data import, deeper CRM (per-item tracking, visit-frequency stats), barista-level stamp/claim correction, purchase-prediction/churn modeling, admin data export, automated WhatsApp/email notifications, multi-outlet support.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
