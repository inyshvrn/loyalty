-- AlterTable
ALTER TABLE "RewardClaim" ADD COLUMN "progressCutoffAt" TIMESTAMP(3);

-- Backfill existing rows: treat the cutoff as identical to the claim time
-- itself, matching the pre-carry-over behavior for claims made before this
-- migration (they never had a grace stamp mechanism to account for).
UPDATE "RewardClaim" SET "progressCutoffAt" = "claimedAt" WHERE "progressCutoffAt" IS NULL;

-- AlterTable
ALTER TABLE "RewardClaim" ALTER COLUMN "progressCutoffAt" SET NOT NULL;
