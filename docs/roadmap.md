# Development Roadmap — Handai Coffee Loyalty

Milestones are meant to be done in order; each depends on the ones listed.

## 1. Project Setup
- **Goal**: environment ready.
- **Tasks**: init Next.js + TypeScript, set up Tailwind + shadcn/ui, set up Prisma + database connection (Neon/Supabase), initial deploy to Vercel to confirm the pipeline works end to end.
- **Dependencies**: none.
- **Definition of done**: project deploys to Vercel (even an empty page), database connection verified.

## 2. UI Foundation
- **Goal**: base layout and shared components ready.
- **Tasks**: layout per role, install/configure the shadcn components needed, basic landing page.
- **Dependencies**: Milestone 1.
- **Definition of done**: basic navigation between (placeholder) pages works.

## 3. Authentication
- **Goal**: customers can register, verify email, and log in; role-based access works.
- **Tasks**: `User` schema with role, NextAuth Credentials provider, email verification flow via Resend, `middleware.ts` route protection per role.
- **Dependencies**: Milestones 1, 2.
- **Definition of done**: a customer can register -> verify email -> log in -> land on the right dashboard for their role; barista/admin accounts (seeded manually for now) can also log in.
- **Note**: Prisma and NextAuth are new to the developer — budget extra time here for learning, not just building.

## 4. Database & Core Data Model
- **Goal**: loyalty data schema in place.
- **Tasks**: schema/migrations for `Stamp`, `RewardClaim`, `LoyaltySetting`.
- **Dependencies**: Milestone 3.
- **Definition of done**: schema migrated, data can be inserted/queried via Prisma Studio.

## 5. Core Feature — Loyalty Flow
- **Goal**: the scan -> stamp -> reward flow works end to end.
- **Tasks**: generate QR per customer, customer dashboard (QR + progress), barista scan page (camera + manual search fallback), stamp logic (max 1/day), eligibility + reward confirmation + reset + history logging.
- **Dependencies**: Milestones 3, 4.
- **Definition of done**: registering a new customer, scanning them N times, reaching eligibility, and confirming the reward all work without major bugs.

## 6. Secondary Features — Admin Panel
- **Goal**: admin can manage the system.
- **Tasks**: summary dashboard (customer count, claim count), customer management (list, detail, history, manual correction), barista account management, threshold (N) setting.
- **Dependencies**: Milestone 5.
- **Definition of done**: an admin can perform all of the above without touching the database directly.

## 7. Testing
- **Goal**: core flows are stable.
- **Tasks**: manual testing across all roles and edge cases (failed scan, max-1-per-day, unverified email, etc). No automated testing framework has been chosen yet.
- **Dependencies**: Milestones 5, 6.
- **Definition of done**: no blocking bugs found in the core flows.

## 8. Deployment
- **Goal**: live and usable at the outlet.
- **Tasks**: production deploy, environment variables (Resend API key, etc.), create the first real admin and barista accounts.
- **Dependencies**: all previous milestones.
- **Definition of done**: app is reachable at a public URL, first admin/barista accounts can log in and the flow can be tested live at the outlet.
