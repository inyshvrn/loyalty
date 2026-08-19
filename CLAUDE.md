# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

In development. Milestones 1–3 (Project Setup, UI Foundation, Authentication) are complete per `docs/roadmap.md`. Authentication setup and local testing steps: `docs/authentication.md`. Next up: Milestone 4 (Database & Core Data Model — `Stamp`, `RewardClaim`, `LoyaltySetting`).

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

No testing framework has been chosen yet (Milestone 7 is currently planned as manual testing of core flows).

## Architecture notes for future work

- Three roles share one login form; redirect after auth is role-based (customer / barista / admin), enforced via `middleware.ts`.
- Business rule: 1 scan = 1 stamp, max 1 stamp per customer per day.
- On reaching the configurable threshold N, the customer becomes "eligible"; a barista must explicitly confirm the reward was given before the stamp count resets to 0. Every claim is logged (history is never deleted), and admins can manually adjust a stamp count or cancel a claim to correct barista mistakes.
- Deferred to a later phase (do not build unless asked): importing historical purchase data from CSV/XLSX, per-item purchase tracking / deeper CRM, automated WhatsApp/email notifications, multi-outlet support.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
