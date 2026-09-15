import { test, expect } from "@playwright/test";
import { createPasswordResetToken } from "@/lib/password-reset-token";
import {
  createUser,
  login,
  cleanupUser,
  findUserByEmail,
  countUsersByEmail,
  uniqueSuffix,
} from "./helpers";

test.describe("registration", () => {
  test("registering lands on the verify-email screen", async ({ page }) => {
    const suffix = uniqueSuffix();
    const email = `e2e.register.${suffix}@example.com`;

    await page.goto("/register", { waitUntil: "networkidle" });
    await page.fill('input[name="name"]', "E2E New Customer");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', `0821${suffix}`.slice(0, 13));
    await page.fill('input[name="password"]', "TestPass123!");
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => url.pathname === "/verify-email");
    await expect(page.getByText("Periksa email Anda")).toBeVisible();

    const user = await findUserByEmail(email);
    expect(user).not.toBeNull();
    expect(user?.emailVerified).toBe(false);
    if (user) await cleanupUser(user.id);
  });

  test("registering with an already-verified email doesn't create a duplicate", async ({
    page,
  }) => {
    const existing = await createUser({ role: "CUSTOMER", password: "TestPass123!" });

    await page.goto("/register", { waitUntil: "networkidle" });
    await page.fill('input[name="name"]', "Someone Else");
    await page.fill('input[name="email"]', existing.email);
    await page.fill('input[name="phone"]', `0822${uniqueSuffix()}`.slice(0, 13));
    await page.fill('input[name="password"]', "AnotherPass456!");
    await page.click('button[type="submit"]');

    // Same generic redirect either way — enumeration-safe, doesn't reveal
    // the account already existed.
    await page.waitForURL((url) => url.pathname === "/verify-email");

    expect(await countUsersByEmail(existing.email)).toBe(1);

    await cleanupUser(existing.id);
  });
});

test.describe("login lockout", () => {
  test("5 failed attempts locks the account, even a correct password is then rejected", async ({
    page,
  }) => {
    const password = "CorrectPass123!";
    const user = await createUser({ role: "CUSTOMER", password });

    for (let i = 0; i < 5; i++) {
      await page.goto("/login", { waitUntil: "networkidle" });
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', "WrongPassword" + i);
      await page.click('button[type="submit"]');
      await expect(page.getByText("Email atau kata sandi salah.")).toBeVisible();
    }

    // 6th attempt, correct password this time — should still be rejected.
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page.getByText("Email atau kata sandi salah.")).toBeVisible();
    expect(page.url()).toContain("/login");

    const locked = await findUserByEmail(user.email);
    expect(locked?.lockedUntil).not.toBeNull();
    expect(new Date(locked.lockedUntil).getTime()).toBeGreaterThan(Date.now());

    await cleanupUser(user.id);
  });
});

test.describe("password reset", () => {
  test("a reset link sets a new password and can't be reused", async ({ page }) => {
    const oldPassword = "OldPass123!";
    const newPassword = "BrandNewPass456!";
    const user = await createUser({ role: "CUSTOMER", password: oldPassword });

    const token = await createPasswordResetToken(user.id, user.email, user.passwordHash);
    const resetUrl = `/reset-password?token=${token}`;

    await page.goto(resetUrl, { waitUntil: "networkidle" });
    await page.fill('input[name="password"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => url.pathname === "/login");
    await expect(
      page.getByText("Kata sandi berhasil diatur ulang.")
    ).toBeVisible();

    // New password works.
    await login(page, user.email, newPassword);
    expect(page.url()).not.toContain("/login");

    // The same link, used again, must now be rejected — its embedded
    // password fingerprint no longer matches the (now-changed) hash.
    await page.context().clearCookies();
    await page.goto(resetUrl, { waitUntil: "networkidle" });
    await page.fill('input[name="password"]', "YetAnotherPass789!");
    await page.fill('input[name="confirmPassword"]', "YetAnotherPass789!");
    await page.click('button[type="submit"]');
    await expect(
      page.getByText("Tautan atur ulang kata sandi tidak valid atau sudah dipakai.")
    ).toBeVisible();

    await cleanupUser(user.id);
  });
});
