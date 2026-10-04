-- AlterTable: add the column without a default first, so existing rows
-- can be backfilled in a chosen order before NOT NULL is enforced.
ALTER TABLE "User" ADD COLUMN "customerNumber" INTEGER;

-- Backfill existing rows in registration order, so earlier accounts get
-- lower numbers (oldest = 1) instead of whatever arbitrary order a plain
-- SERIAL backfill would assign.
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "User"
)
UPDATE "User" SET "customerNumber" = numbered.rn
FROM numbered
WHERE "User".id = numbered.id;

-- Back the column with a sequence so new inserts continue numbering
-- automatically, matching Prisma's `@default(autoincrement())`.
CREATE SEQUENCE "User_customerNumber_seq" OWNED BY "User"."customerNumber";
SELECT setval('"User_customerNumber_seq"', COALESCE((SELECT MAX("customerNumber") FROM "User"), 0) + 1, false);
ALTER TABLE "User" ALTER COLUMN "customerNumber" SET DEFAULT nextval('"User_customerNumber_seq"');
ALTER TABLE "User" ALTER COLUMN "customerNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_customerNumber_key" ON "User"("customerNumber");
