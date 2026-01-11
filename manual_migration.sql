-- AlterTable quiz_answer: change selectedAnswerId to selectedAnswerIds array
ALTER TABLE "quiz_answer" DROP COLUMN IF EXISTS "selectedAnswerId";
ALTER TABLE "quiz_answer" ADD COLUMN "selectedAnswerIds" TEXT[] NOT NULL DEFAULT '{}';
