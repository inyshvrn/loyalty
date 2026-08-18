# Handai Coffee Loyalty

Web app for tracking Handai Coffee's customer loyalty program, replacing the previous manual paper punch-card system.

## What it does

- Customers self-register and get a persistent personal QR code.
- Baristas scan the QR code at checkout to record a visit ("stamp"), max 1 per customer per day.
- After reaching a configurable number of stamps, the customer becomes eligible for one free small product. A barista confirms the reward was actually given before the stamp count resets — every claim stays in the customer's history.
- Admins configure the stamp threshold, manage barista accounts, review customer data, and can manually correct stamp counts or cancel a mistaken claim.

See `docs/product-requirements.md` for the full spec, `docs/technical-architecture.md` for stack/data model, and `docs/roadmap.md` for the build plan.

## Status

Planning complete, not yet scaffolded. See `CLAUDE.md` for the current state and stack.

## Stack

Next.js (App Router, TypeScript) · Prisma + PostgreSQL · NextAuth.js + Resend · Tailwind CSS + shadcn/ui

## Setup

To be documented once the project is scaffolded (Milestone 1).
