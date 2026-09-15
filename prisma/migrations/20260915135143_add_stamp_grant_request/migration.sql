-- CreateEnum
CREATE TYPE "StampGrantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "StampGrantRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "note" TEXT,
    "requestedByUserId" TEXT NOT NULL,
    "outletId" TEXT,
    "status" "StampGrantStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedByAdminId" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "StampGrantRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StampGrantRequest_customerId_idx" ON "StampGrantRequest"("customerId");

-- CreateIndex
CREATE INDEX "StampGrantRequest_status_idx" ON "StampGrantRequest"("status");

-- AddForeignKey
ALTER TABLE "StampGrantRequest" ADD CONSTRAINT "StampGrantRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampGrantRequest" ADD CONSTRAINT "StampGrantRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampGrantRequest" ADD CONSTRAINT "StampGrantRequest_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampGrantRequest" ADD CONSTRAINT "StampGrantRequest_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
