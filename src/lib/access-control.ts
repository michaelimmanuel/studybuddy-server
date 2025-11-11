import prisma from './prisma';

/**
 * Check if a user has approved access to a specific package
 * Checks both direct package purchases and bundle purchases
 * Also validates expiration dates
 */
export const userHasPackageAccess = async (userId: string, packageId: string): Promise<boolean> => {
  // Check for direct package purchase (must be approved)
  const purchase = await prisma.packagePurchase.findUnique({
    where: { userId_packageId: { userId, packageId } },
    select: { id: true, approved: true, expiresAt: true },
  });
  
  // Verify purchase is approved and not expired
  if (purchase) {
    if (!purchase.approved) return false;
    if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) return false;
    return true;
  }

  // Check for bundle purchase that includes this package (must be approved)
  const bundlePurchase = await prisma.bundlePurchase.findFirst({
    where: {
      userId,
      approved: true, // Bundle must be approved
      bundle: {
        bundlePackages: {
          some: { packageId },
        },
      },
    },
    select: { id: true, expiresAt: true },
  });
  
  // Verify bundle is not expired
  if (bundlePurchase) {
    if (bundlePurchase.expiresAt && new Date(bundlePurchase.expiresAt) < new Date()) return false;
    return true;
  }
  
  return false;
};

/**
 * Check if a user has approved access to a specific bundle
 * Also validates expiration dates
 */
export const userHasBundleAccess = async (userId: string, bundleId: string): Promise<boolean> => {
  const purchase = await prisma.bundlePurchase.findUnique({
    where: { userId_bundleId: { userId, bundleId } },
    select: { id: true, approved: true, expiresAt: true },
  });
  
  if (!purchase) return false;
  if (!purchase.approved) return false;
  if (purchase.expiresAt && new Date(purchase.expiresAt) < new Date()) return false;
  
  return true;
};
