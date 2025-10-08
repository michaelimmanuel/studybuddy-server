/*
  Warnings:

  - You are about to drop the `enrollment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."enrollment" DROP CONSTRAINT "enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."enrollment" DROP CONSTRAINT "enrollment_userId_fkey";

-- DropTable
DROP TABLE "public"."enrollment";

-- DropEnum
DROP TYPE "public"."EnrollmentStatus";
