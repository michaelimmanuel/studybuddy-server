-- CreateTable
CREATE TABLE "public"."package_purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "package_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bundle_purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "pricePaid" DOUBLE PRECISION NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "bundle_purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "package_purchase_userId_idx" ON "public"."package_purchase"("userId");

-- CreateIndex
CREATE INDEX "package_purchase_packageId_idx" ON "public"."package_purchase"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "package_purchase_userId_packageId_key" ON "public"."package_purchase"("userId", "packageId");

-- CreateIndex
CREATE INDEX "bundle_purchase_userId_idx" ON "public"."bundle_purchase"("userId");

-- CreateIndex
CREATE INDEX "bundle_purchase_bundleId_idx" ON "public"."bundle_purchase"("bundleId");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_purchase_userId_bundleId_key" ON "public"."bundle_purchase"("userId", "bundleId");

-- AddForeignKey
ALTER TABLE "public"."package_purchase" ADD CONSTRAINT "package_purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."package_purchase" ADD CONSTRAINT "package_purchase_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_purchase" ADD CONSTRAINT "bundle_purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bundle_purchase" ADD CONSTRAINT "bundle_purchase_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "public"."bundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
