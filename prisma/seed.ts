import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Development-only placeholders. Override via env vars for anything beyond a
// throwaway local database — see docs/authentication.md.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@handaicoffee.test";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
const BARISTA_EMAIL = process.env.SEED_BARISTA_EMAIL ?? "barista@handaicoffee.test";
const BARISTA_PASSWORD = process.env.SEED_BARISTA_PASSWORD ?? "ChangeMe123!";

async function upsertStaff(
  email: string,
  password: string,
  name: string,
  role: Role
) {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role, emailVerified: true },
  });
  console.log(`Seeded ${role}: ${email}`);
}

async function main() {
  await upsertStaff(ADMIN_EMAIL, ADMIN_PASSWORD, "Admin Handai", Role.ADMIN);
  await upsertStaff(
    BARISTA_EMAIL,
    BARISTA_PASSWORD,
    "Barista Handai",
    Role.BARISTA
  );

  console.log(
    "\nDev credentials (change these — see docs/authentication.md):"
  );
  console.log(`  Admin:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Barista: ${BARISTA_EMAIL} / ${BARISTA_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
