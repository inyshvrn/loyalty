# Product Requirements — Handai Coffee Loyalty

## Problem

Handai Coffee currently tracks customer loyalty with physical punch cards. Cards get lost, tracking is manual and error-prone, and there's no record of visit history.

## Goal

Digitize the loyalty program: each customer gets an account with a persistent personal QR code; a barista scans it to record a visit; the system automatically tracks progress and lets a customer claim a free product after reaching a threshold number of visits.

## Target users & roles

- **Pelanggan (customer)** — self-registers, views their QR code and stamp progress, views their own history.
- **Barista** — scans customer QR codes at checkout, confirms reward hand-off. Accounts are created by an admin, not self-registered.
- **Admin** — separate role (not combined with barista), owns program configuration and oversight: sets the stamp threshold, manages barista accounts, views/searches customer data, and manually corrects mistakes.

## Core business rules (MVP)

- 1 QR scan = 1 stamp, regardless of what/how much the customer bought.
- Maximum 1 stamp per customer per calendar day.
- Reward = 1 free small-size product (cup/bottle), customer's choice of item.
- On reaching N stamps (N configurable by admin), the customer becomes **eligible**. A barista must explicitly confirm "reward given" before the stamp count resets to 0.
- Every reward claim is recorded permanently in the customer's history (count and date), even though the stamp counter itself resets.
- Admin can manually adjust a customer's stamp count or cancel a mistaken claim (e.g. accidental double-scan, or confirming a reward before it was actually given).

## Registration & auth

- Customers self-register with: name, email, phone number.
- **Email** is the login identity and requires verification before login is allowed.
- **Phone number** is collected as contact info only — no separate verification.
- Barista and admin accounts are created by an admin (no self-registration for staff).
- All three roles share a single login form; the user is redirected to the correct dashboard based on their role after login.

## QR code behavior

- Each customer gets one persistent QR code tied to their account, generated at registration.
- The QR is viewed by logging into the web app (not a static image saved separately) — if the customer loses/changes their phone, the QR is still retrievable by logging in again.
- Fallback when a QR can't be scanned (dead phone, forgotten phone, scan failure): a barista can search for the customer manually (by name/email/phone) on the scan page and add the stamp without a QR scan.

## Core features (MVP)

1. Customer self-registration
2. Email/password login shared across all roles, with role-based redirect
3. Email verification required before login
4. Persistent per-customer QR code
5. Barista: scan QR to add a stamp (max 1/day), with manual search fallback
6. Stamp progress visible to customer and barista
7. Automatic "eligible for reward" status at N stamps
8. Barista-confirmed reward redemption (resets stamps, logs claim history)
9. Customer-facing visit history and reward claim history
10. Admin: configure stamp threshold (N)
11. Admin: manage barista accounts (create/deactivate)
12. Admin: view/search customer data and their history
13. Admin: manually adjust a customer's stamp count or cancel a claim

## Deferred (explicitly out of scope for MVP)

- Importing historical purchase data from CSV/XLSX
- Tracking specific items purchased per visit / deeper CRM
- Automated notifications (WhatsApp/email) when a customer becomes eligible
- Multi-outlet support
