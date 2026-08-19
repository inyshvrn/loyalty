# Handai Coffee Loyalty

Web app for tracking Handai Coffee's customer loyalty program, replacing the previous manual paper punch-card system.

## What it does

- Customers self-register and get a persistent personal QR code.
- Baristas scan the QR code at checkout to record a visit ("stamp"), max 1 per customer per day.
- After reaching a configurable number of stamps, the customer becomes eligible for one free small product. A barista confirms the reward was actually given before the stamp count resets — every claim stays in the customer's history.
- Admins configure the stamp threshold, manage barista accounts, review customer data, and can manually correct stamp counts or cancel a mistaken claim.

See `docs/product-requirements.md` for the full spec, `docs/technical-architecture.md` for stack/data model, and `docs/roadmap.md` for the build plan.

## Status

In development — Milestones 1–7 complete (through manual testing of core flows). See `docs/roadmap.md` for the full milestone plan and `CLAUDE.md` for the current state.

## Stack

Next.js (App Router, TypeScript) · Prisma + PostgreSQL · NextAuth.js + Resend · Tailwind CSS + shadcn/ui

## Setup

```bash
npm install
npx prisma dev          # local Postgres (or set DATABASE_URL to a real one)
npx prisma migrate dev
npm run db:seed         # creates dev barista/admin accounts
npm run dev
```

Copy `.env.example` to `.env` first and fill in `AUTH_SECRET` at minimum
(`RESEND_API_KEY` can stay blank locally — see below). Auth setup and local
testing steps: `docs/authentication.md`.

**If you see `ECONNREFUSED` errors**, the local `npx prisma dev` server has
stopped (it can idle out on its own after a while) — just run
`npx prisma dev` again to restart it; it reuses the same connection string
and data. This is a local-only dev tool quirk, not an app issue.
