/*
  Warnings:

  - You are about to drop the column `explanation` on the `answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."answer" DROP COLUMN "explanation";

-- AlterTable
ALTER TABLE "public"."question" ADD COLUMN     "explanation" TEXT;
