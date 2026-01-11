-- Safe migration: Convert selectedAnswerId (String?) to selectedAnswerIds (String[])
-- This migration preserves existing data

-- Step 1: Add new column with default empty array
ALTER TABLE "quiz_answer" ADD COLUMN IF NOT EXISTS "selectedAnswerIds" TEXT[] NOT NULL DEFAULT '{}';

-- Step 2: Migrate existing data from selectedAnswerId to selectedAnswerIds
-- If selectedAnswerId is not null, convert it to a single-element array
UPDATE "quiz_answer" 
SET "selectedAnswerIds" = ARRAY["selectedAnswerId"]::TEXT[]
WHERE "selectedAnswerId" IS NOT NULL;

-- Step 3: Drop the old column (only after data is safely migrated)
ALTER TABLE "quiz_answer" DROP COLUMN IF EXISTS "selectedAnswerId";
