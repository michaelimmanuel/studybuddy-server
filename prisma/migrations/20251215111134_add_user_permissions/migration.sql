-- CreateEnum
CREATE TYPE "public"."Grant" AS ENUM ('ALLOW', 'DENY');

-- CreateTable
CREATE TABLE "public"."permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_permission" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "grant" "public"."Grant" NOT NULL DEFAULT 'ALLOW',
    "resourceType" TEXT,
    "resourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "user_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_name_key" ON "public"."permission"("name");

-- CreateIndex
CREATE INDEX "user_permission_userId_idx" ON "public"."user_permission"("userId");

-- CreateIndex
CREATE INDEX "user_permission_permissionId_idx" ON "public"."user_permission"("permissionId");

-- CreateIndex
CREATE INDEX "user_permission_resourceType_resourceId_idx" ON "public"."user_permission"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_userId_permissionId_resourceType_resourceId_key" ON "public"."user_permission"("userId", "permissionId", "resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "public"."user_permission" ADD CONSTRAINT "user_permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_permission" ADD CONSTRAINT "user_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
