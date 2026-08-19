// Store's local calendar day, used for the "max 1 stamp per customer per
// day" rule. Computed explicitly against a fixed offset rather than the
// server's local timezone, since the server (Vercel) runs in UTC regardless
// of where the store actually is.
const STORE_UTC_OFFSET_MINUTES = 7 * 60; // Asia/Jakarta (WIB)

/** [start, end) bounds, in real UTC instants, of "today" in the store's timezone. */
export function getStoreDayBounds(reference: Date = new Date()) {
  const shifted = new Date(reference.getTime() + STORE_UTC_OFFSET_MINUTES * 60_000);
  const startOfShiftedDayUtcMs = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate()
  );
  const start = new Date(startOfShiftedDayUtcMs - STORE_UTC_OFFSET_MINUTES * 60_000);
  const end = new Date(start.getTime() + 24 * 60 * 60_000);
  return { start, end };
}

export function formatStoreTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}
