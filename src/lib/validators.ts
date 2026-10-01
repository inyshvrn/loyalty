import { z } from "zod";

/** Indonesian mobile number: starts with 08, 10-15 digits total. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^08[0-9]{8,13}$/, "Nomor HP harus diawali 08 dan berisi 10-15 digit angka");

/** Parses a "YYYY-MM-DD" string (from `<input type="date">`) into a UTC-
 * midnight Date for a `@db.Date` column. Unlike `z.coerce.date()`, this
 * rejects calendar-invalid dates (e.g. "2000-02-30") instead of silently
 * rolling them over to the next valid date. */
export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
  .transform((s, ctx) => {
    const [y, m, d] = s.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
      ctx.addIssue({ code: "custom", message: "Tanggal tidak valid" });
      return z.NEVER;
    }
    return date;
  });
