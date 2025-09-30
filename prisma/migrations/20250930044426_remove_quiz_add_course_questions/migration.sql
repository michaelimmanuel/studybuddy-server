/*
  Warnings:

  - You are about to drop the column `quizId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the `quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `submission_answer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courseId` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."question" DROP CONSTRAINT "question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."quiz" DROP CONSTRAINT "quiz_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."submission" DROP CONSTRAINT "submission_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."submission" DROP CONSTRAINT "submission_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."submission_answer" DROP CONSTRAINT "submission_answer_answerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."submission_answer" DROP CONSTRAINT "submission_answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."submission_answer" DROP CONSTRAINT "submission_answer_submissionId_fkey";

-- AlterTable
ALTER TABLE "public"."answer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."question" DROP COLUMN "quizId",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."quiz";

-- DropTable
DROP TABLE "public"."submission";

-- DropTable
DROP TABLE "public"."submission_answer";

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
