-- CreateEnum
CREATE TYPE "RewardClaimStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Stamp" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "scannedByBaristaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardClaim" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "confirmedByBaristaId" TEXT NOT NULL,
    "status" "RewardClaimStatus" NOT NULL DEFAULT 'CONFIRMED',
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),
    "cancelledByAdminId" TEXT,

    CONSTRAINT "RewardClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltySetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "stampThreshold" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltySetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Stamp_customerId_idx" ON "Stamp"("customerId");

-- CreateIndex
CREATE INDEX "RewardClaim_customerId_idx" ON "RewardClaim"("customerId");

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_scannedByBaristaId_fkey" FOREIGN KEY ("scannedByBaristaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_confirmedByBaristaId_fkey" FOREIGN KEY ("confirmedByBaristaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardClaim" ADD CONSTRAINT "RewardClaim_cancelledByAdminId_fkey" FOREIGN KEY ("cancelledByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
