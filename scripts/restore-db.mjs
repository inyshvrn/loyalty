// Disaster recovery: loads a backup-db.mjs JSON dump back into a database.
// Usage: node scripts/restore-db.mjs <path-to-backup.json>
//
// Targets DATABASE_URL from .env.backup (same file backup-db.mjs uses) —
// double-check that's pointed at where you actually want to restore before
// running this. Refuses to run against a database that already has rows in
// it, so it can't accidentally clobber live data; point DATABASE_URL at a
// freshly `prisma migrate deploy`-ed, empty database first.
import "dotenv/config";
import { config } from "dotenv";
import { Client } from "pg";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.backup"), override: true });

// Insert order matters: a table must come after every table it has a
// foreign key into. Outlet has none; User points at Outlet; Stamp and
// RewardClaim point at User (and Stamp at Outlet); LoyaltySetting is
// standalone.
const INSERT_ORDER = ["Outlet", "User", "LoyaltySetting", "Stamp", "RewardClaim"];

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/restore-db.mjs <path-to-backup.json>");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found in .env.backup.");
    process.exit(1);
  }

  const dump = JSON.parse(readFileSync(file, "utf8"));
  console.log(`Restoring backup from ${dump.createdAt}`);

  const client = new Client({ connectionString });
  await client.connect();

  for (const table of INSERT_ORDER) {
    const { rows } = await client.query(`SELECT count(*)::int AS n FROM "${table}"`);
    if (rows[0].n > 0) {
      console.error(
        `Refusing to restore: "${table}" already has ${rows[0].n} row(s). ` +
          "Point DATABASE_URL at a fresh, empty database first."
      );
      await client.end();
      process.exit(1);
    }
  }

  for (const table of INSERT_ORDER) {
    const rows = dump.tables[table] ?? [];
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = columns.map((c) => row[c]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const quotedColumns = columns.map((c) => `"${c}"`).join(", ");
      await client.query(
        `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders})`,
        values
      );
    }
    console.log(`  ${table}: restored ${rows.length} rows`);
  }

  await client.end();
  console.log("Restore complete.");
}

main().catch((err) => {
  console.error("Restore failed:", err);
  process.exit(1);
});
