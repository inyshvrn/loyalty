-- AlterTable
ALTER TABLE "LoyaltySetting" ADD COLUMN     "birthdayRewardDiscountType" "DiscountType" NOT NULL DEFAULT 'PERCENT',
ADD COLUMN     "birthdayRewardDiscountValue" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "birthdayRewardEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "birthdayRewardMinStamps" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" DATE;

-- CreateTable
CREATE TABLE "BirthdayRewardCredit" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "status" "ReferralCreditStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),
    "redeemedByBaristaId" TEXT,
    "outletId" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledByAdminId" TEXT,

    CONSTRAINT "BirthdayRewardCredit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BirthdayRewardCredit_customerId_year_key" ON "BirthdayRewardCredit"("customerId", "year");

-- AddForeignKey
ALTER TABLE "BirthdayRewardCredit" ADD CONSTRAINT "BirthdayRewardCredit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayRewardCredit" ADD CONSTRAINT "BirthdayRewardCredit_redeemedByBaristaId_fkey" FOREIGN KEY ("redeemedByBaristaId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayRewardCredit" ADD CONSTRAINT "BirthdayRewardCredit_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthdayRewardCredit" ADD CONSTRAINT "BirthdayRewardCredit_cancelledByAdminId_fkey" FOREIGN KEY ("cancelledByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
