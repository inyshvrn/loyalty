-- AlterTable
ALTER TABLE "Stamp" ADD COLUMN "grantRequestId" TEXT;

-- CreateIndex
CREATE INDEX "Stamp_grantRequestId_idx" ON "Stamp"("grantRequestId");

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_grantRequestId_fkey" FOREIGN KEY ("grantRequestId") REFERENCES "StampGrantRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
