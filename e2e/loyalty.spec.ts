import { test, expect } from "@playwright/test";
import { createUser, loginBarista, cleanupUser, withClient } from "./helpers";

async function getStampThreshold(): Promise<number> {
  return withClient(async (client) => {
    const { rows } = await client.query(
      'SELECT "stampThreshold" FROM "LoyaltySetting" WHERE id = 1'
    );
    return rows[0]?.stampThreshold ?? 7;
  });
}

/** Backdated so it's outside today's store-day window and doesn't collide
 * with the max-1-stamp-per-day rule when the test does one real scan. */
async function seedBackdatedStamps(customerId: string, baristaId: string, count: number) {
  await withClient(async (client) => {
    for (let i = 0; i < count; i++) {
      await client.query(
        `INSERT INTO "Stamp" (id, "customerId", "scannedByBaristaId", "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, now() - interval '2 days')`,
        [customerId, baristaId]
      );
    }
  });
}

test.describe("core loyalty flow", () => {
  test("scanning a verified customer up to the threshold makes them eligible, and the barista can confirm the reward", async ({
    page,
  }) => {
    const barista = await createUser({ role: "BARISTA", password: "BaristaPass123!" });
    const customer = await createUser({ role: "CUSTOMER", password: "CustomerPass123!" });
    const threshold = await getStampThreshold();

    // Seed threshold-1 stamps so the one real scan below pushes them over.
    await seedBackdatedStamps(customer.id, barista.id, threshold - 1);

    await loginBarista(page, barista.email, "BaristaPass123!");
    await page.click('button:has-text("Cari Manual")');
    await page.fill('input[placeholder*="Cari nama"]', customer.email);
    await page.keyboard.press("Enter");

    const addStampButton = page.getByRole("button", { name: "Tambah Stempel" }).first();
    await expect(addStampButton).toBeEnabled();
    await addStampButton.click();
    await expect(page.getByText("Stempel ditambahkan")).toBeVisible();
    await expect(page.getByText("Siap Diklaim")).toBeVisible();

    await page.getByRole("button", { name: "Konfirmasi Reward" }).click();
    await expect(page.getByText("Reward dikonfirmasi")).toBeVisible();

    const claim = await withClient(async (client) => {
      const { rows } = await client.query(
        'SELECT status FROM "RewardClaim" WHERE "customerId" = $1',
        [customer.id]
      );
      return rows[0];
    });
    expect(claim?.status).toBe("CONFIRMED");

    await cleanupUser(customer.id);
    await cleanupUser(barista.id);
  });

  test("a barista cannot add a stamp for a customer who hasn't verified their email", async ({
    page,
  }) => {
    const barista = await createUser({ role: "BARISTA", password: "BaristaPass123!" });
    const customer = await createUser({
      role: "CUSTOMER",
      password: "CustomerPass123!",
      emailVerified: false,
    });

    await loginBarista(page, barista.email, "BaristaPass123!");
    await page.click('button:has-text("Cari Manual")');
    await page.fill('input[placeholder*="Cari nama"]', customer.email);
    await page.keyboard.press("Enter");

    await expect(page.getByText("Belum Verifikasi")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Stempel" }).first()).toBeDisabled();

    const stampCount = await withClient(async (client) => {
      const { rows } = await client.query(
        'SELECT count(*)::int AS n FROM "Stamp" WHERE "customerId" = $1',
        [customer.id]
      );
      return rows[0].n;
    });
    expect(stampCount).toBe(0);

    await cleanupUser(customer.id);
    await cleanupUser(barista.id);
  });
});
