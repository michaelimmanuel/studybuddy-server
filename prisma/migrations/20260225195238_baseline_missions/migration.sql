-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('QUIZ_COMPLETION', 'CBT_COMPLETION', 'OSCE_COMPLETION', 'DAILY_CBT', 'HIGH_SCORE', 'PERFECT_SCORE', 'STUDY_STREAK');

-- CreateTable
CREATE TABLE "mission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "MissionType" NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" JSONB NOT NULL,
    "reward" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_mission_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "user_mission_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "actions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mission_code_key" ON "mission"("code");

-- CreateIndex
CREATE INDEX "mission_type_tier_idx" ON "mission"("type", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "user_mission_progress_userId_missionId_key" ON "user_mission_progress"("userId", "missionId");

-- CreateIndex
CREATE INDEX "user_mission_progress_userId_isCompleted_idx" ON "user_mission_progress"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "user_mission_progress_missionId_idx" ON "user_mission_progress"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_activity_userId_date_key" ON "user_activity"("userId", "date");

-- CreateIndex
CREATE INDEX "user_activity_userId_date_idx" ON "user_activity"("userId", "date");

-- AddForeignKey
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mission_progress" ADD CONSTRAINT "user_mission_progress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
