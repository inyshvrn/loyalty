import { z } from "zod";

/** Indonesian mobile number: starts with 08, 10-15 digits total. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^08[0-9]{8,13}$/, "Nomor HP harus diawali 08 dan berisi 10-15 digit angka");
