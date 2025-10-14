-- AlterTable
ALTER TABLE "public"."package" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "availableUntil" TIMESTAMP(3),
ADD COLUMN     "timeLimit" INTEGER;
