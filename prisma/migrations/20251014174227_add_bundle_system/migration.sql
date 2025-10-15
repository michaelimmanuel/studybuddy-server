-- CreateTable
CREATE TABLE "public"."bundle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "bundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bundle_package" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bundle_package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bundle_package_bundleId_packageId_key" ON "public"."bundle_package"("bundleId", "packageId");

-- AddForeignKey
ALTER TABLE "public"."bundle_package" ADD CONSTRAINT "bundle_package_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "public"."bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_package" ADD CONSTRAINT "bundle_package_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
