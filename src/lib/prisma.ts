import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Vercel spins up many separate serverless instances under load, each
  // getting its own connection pool — cap it low so a burst of concurrent
  // instances (several × max) doesn't exceed the database's connection
  // limit, the way it did briefly after a deploy (saw "too many database
  // connections... for role" errors in production logs).
  max: 3,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
