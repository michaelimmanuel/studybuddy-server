import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

// Helper: determine if user already has access to a package (direct or via bundle)
const userHasPackageAccess = async (userId: string, packageId: string) => {
  const purchase = await prisma.packagePurchase.findUnique({
    where: { userId_packageId: { userId, packageId } },
    select: { id: true },
  });
  if (purchase) return true;

  const bundlePurchase = await prisma.bundlePurchase.findFirst({
    where: {
      userId,
      bundle: {
        bundlePackages: {
          some: { packageId },
        },
      },
    },
    select: { id: true },
  });
  return !!bundlePurchase;
};

export const purchasePackage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { packageId } = req.body;

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ success: false, message: 'Package not found or inactive' });
    }

    // Already owns?
    if (await userHasPackageAccess(userId, packageId)) {
      return res.status(400).json({ success: false, message: 'User already has access to this package' });
    }

    const purchase = await prisma.packagePurchase.create({
      data: {
        userId,
        packageId,
        pricePaid: pkg.price,
      },
    });

    res.status(201).json({ success: true, message: 'Package purchased successfully', data: purchase });
  } catch (err) {
    console.error('Error purchasing package', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const purchaseBundle = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { bundleId } = req.body;

    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: { bundlePackages: { select: { packageId: true } } },
    });
    if (!bundle || !bundle.isActive) {
      return res.status(404).json({ success: false, message: 'Bundle not found or inactive' });
    }

    const existing = await prisma.bundlePurchase.findUnique({ where: { userId_bundleId: { userId, bundleId } } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already owns this bundle' });
    }

    const purchase = await prisma.bundlePurchase.create({
      data: {
        userId,
        bundleId,
        pricePaid: bundle.price,
      },
    });

    res.status(201).json({ success: true, message: 'Bundle purchased successfully', data: purchase });
  } catch (err) {
    console.error('Error purchasing bundle', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMyPurchases = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const [packagePurchases, bundlePurchases] = await Promise.all([
      prisma.packagePurchase.findMany({
        where: { userId },
        include: { package: { select: { id: true, title: true, price: true } } },
        orderBy: { purchasedAt: 'desc' },
      }),
      prisma.bundlePurchase.findMany({
        where: { userId },
        include: { bundle: { select: { id: true, title: true, price: true } } },
        orderBy: { purchasedAt: 'desc' },
      }),
    ]);

    res.json({ success: true, data: { packages: packagePurchases, bundles: bundlePurchases } });
  } catch (err) {
    console.error('Error fetching purchases', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const checkPackageAccess = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { packageId } = req.params;

    const hasAccess = await userHasPackageAccess(userId, packageId);
    res.json({ success: true, data: { packageId, hasAccess } });
  } catch (err) {
    console.error('Error checking access', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
