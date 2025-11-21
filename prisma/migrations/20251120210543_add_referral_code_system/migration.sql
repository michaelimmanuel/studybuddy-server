/*
  Warnings:

  - Added the required column `originalPrice` to the `bundle_purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `package_purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Add columns with defaults first for existing rows
ALTER TABLE "public"."bundle_purchase" 
ADD COLUMN "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "originalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "referralCodeId" TEXT;

-- Update existing rows to set originalPrice to pricePaid
UPDATE "public"."bundle_purchase" SET "originalPrice" = "pricePaid" WHERE "originalPrice" = 0;

-- AlterTable - Add columns with defaults first for existing rows
ALTER TABLE "public"."package_purchase" 
ADD COLUMN "discountApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "originalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "referralCodeId" TEXT;

-- Update existing rows to set originalPrice to pricePaid
UPDATE "public"."package_purchase" SET "originalPrice" = "pricePaid" WHERE "originalPrice" = 0;

-- CreateTable
CREATE TABLE "public"."referral_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "quota" INTEGER NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "referral_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referral_code_code_key" ON "public"."referral_code"("code");

-- CreateIndex
CREATE INDEX "referral_code_code_idx" ON "public"."referral_code"("code");

-- CreateIndex
CREATE INDEX "referral_code_isActive_idx" ON "public"."referral_code"("isActive");

-- CreateIndex
CREATE INDEX "bundle_purchase_referralCodeId_idx" ON "public"."bundle_purchase"("referralCodeId");

-- CreateIndex
CREATE INDEX "package_purchase_referralCodeId_idx" ON "public"."package_purchase"("referralCodeId");

-- AddForeignKey
ALTER TABLE "public"."package_purchase" ADD CONSTRAINT "package_purchase_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "public"."referral_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_purchase" ADD CONSTRAINT "bundle_purchase_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "public"."referral_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;
