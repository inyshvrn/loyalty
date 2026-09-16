import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** The database's collation is "C" (strict byte order — every uppercase
 * letter sorts before every lowercase one, so "Zebra" comes before "adam"),
 * not a human-alphabetical one. Prisma's `orderBy: { name: "asc" }` alone
 * inherits that, so any list meant to read as A-Z needs a real re-sort
 * after fetching — fine at this app's scale, where these lists are always
 * small and already capped. */
export function sortByNameInsensitive<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "id", { sensitivity: "base" })
  );
}
