-- CreateTable
CREATE TABLE "public"."package" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."package_question" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "package_question_packageId_questionId_key" ON "public"."package_question"("packageId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."package_question" ADD CONSTRAINT "package_question_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."package_question" ADD CONSTRAINT "package_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
