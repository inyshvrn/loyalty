// Manual/scheduled backup: dumps every row from every table in the target
// database (production, via .env.backup — see scripts/README.md) into one
// timestamped JSON file. Data-only, not schema — restoring assumes you run
// `prisma migrate deploy` against a fresh database first, then load this
// file back in with restore-db.mjs.
import "dotenv/config";
import { config } from "dotenv";
import { Client } from "pg";
import { writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.backup holds the production DATABASE_URL — kept out of .env so this
// never accidentally points at whatever local DB `npm run dev` is using.
config({ path: path.join(__dirname, "..", ".env.backup"), override: true });

const TABLES = ["User", "Outlet", "Stamp", "RewardClaim", "LoyaltySetting"];
const BACKUP_DIR = path.join(__dirname, "..", "backups");
const KEEP_DAYS = 30;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_URL not found. Copy scripts/backup.env.example to .env.backup " +
        "(project root) and fill in the production connection string from console.prisma.io."
    );
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const dump = { createdAt: new Date().toISOString(), tables: {} };
  for (const table of TABLES) {
    const result = await client.query(`SELECT * FROM "${table}"`);
    dump.tables[table] = result.rows;
    console.log(`  ${table}: ${result.rows.length} rows`);
  }

  await client.end();

  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = dump.createdAt.replace(/[:.]/g, "-");
  const outFile = path.join(BACKUP_DIR, `backup-${stamp}.json`);
  writeFileSync(outFile, JSON.stringify(dump, null, 2));
  console.log(`Saved: ${outFile}`);

  // Prune backups older than KEEP_DAYS so this folder doesn't grow forever.
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  for (const file of readdirSync(BACKUP_DIR)) {
    if (!file.startsWith("backup-") || !file.endsWith(".json")) continue;
    const filePath = path.join(BACKUP_DIR, file);
    if (statSync(filePath).mtimeMs < cutoff) {
      unlinkSync(filePath);
      console.log(`Pruned old backup: ${file}`);
    }
  }
}

main().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
