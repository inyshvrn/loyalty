import "dotenv/config";
import type { Page } from "@playwright/test";
import bcrypt from "bcryptjs";
import { Client, types } from "pg";

// Postgres's "timestamp without time zone" columns (OID 1114, used for every
// DateTime field in this schema) get parsed by `pg` as local-server-time by
// default. Prisma itself always treats them as UTC, so without this override
// a raw `pg` read here would be off by the difference between UTC and this
// machine's timezone. Appending "Z" forces the same UTC interpretation.
types.setTypeParser(1114, (value) => new Date(value + "Z"));

// Playwright's test transform can't load the generated Prisma client (it's
// pure ESM and uses import.meta, which breaks under Playwright's default
// CJS-ish transform for spec files) — so test fixtures talk to the same
// local dev database directly via `pg` instead of going through @/lib/prisma.
export async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Unique per test run so parallel/repeat runs never collide on the unique
 * email/phone constraints. */
export function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export type TestUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
};

export async function createUser(opts: {
  role: "CUSTOMER" | "BARISTA" | "ADMIN";
  password: string;
  emailVerified?: boolean;
  name?: string;
  email?: string;
  phone?: string;
}): Promise<TestUser> {
  const suffix = uniqueSuffix();
  const passwordHash = await bcrypt.hash(opts.password, 12);
  const name = opts.name ?? `E2E ${opts.role} ${suffix}`;
  const email = opts.email ?? `e2e.${opts.role.toLowerCase()}.${suffix}@example.com`;
  const phone = opts.phone ?? `081${suffix}`.slice(0, 13);
  const emailVerified = opts.emailVerified ?? true;

  return withClient(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO "User" (id, name, email, phone, "passwordHash", role, "emailVerified")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, "passwordHash"`,
      [name, email, phone, passwordHash, opts.role, emailVerified]
    );
    return rows[0];
  });
}

export async function findUserByEmail(email: string) {
  return withClient(async (client) => {
    const { rows } = await client.query('SELECT * FROM "User" WHERE email = $1', [email]);
    return rows[0] ?? null;
  });
}

export async function countUsersByEmail(email: string): Promise<number> {
  return withClient(async (client) => {
    const { rows } = await client.query(
      'SELECT count(*)::int AS n FROM "User" WHERE email = $1',
      [email]
    );
    return rows[0].n;
  });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10_000,
  });
}

/** Best-effort cleanup — tests create their own users with unique
 * emails/phones, so leftovers from a failed run don't break future runs,
 * but deleting them keeps the dev database from accumulating cruft. */
export async function cleanupUser(userId: string) {
  await withClient(async (client) => {
    try {
      await client.query('DELETE FROM "Stamp" WHERE "customerId" = $1 OR "scannedByBaristaId" = $1', [
        userId,
      ]);
      await client.query('DELETE FROM "RewardClaim" WHERE "customerId" = $1', [userId]);
      await client.query('DELETE FROM "User" WHERE id = $1', [userId]);
    } catch {
      // Leftover test data is harmless; don't fail the test over cleanup.
    }
  });
}
