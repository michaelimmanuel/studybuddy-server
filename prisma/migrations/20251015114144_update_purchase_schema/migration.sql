-- AlterTable
ALTER TABLE "public"."bundle_purchase" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."package_purchase" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT true;
