// ADMIN: List all purchases (packages and bundles)
export const adminListAllPurchases = async (req: Request, res: Response) => {
  try {
    const [packagePurchases, bundlePurchases] = await Promise.all([
      prisma.packagePurchase.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          package: { select: { id: true, title: true, price: true } },
          referralCode: { select: { code: true, discountType: true, discountValue: true } },
        },
        orderBy: { purchasedAt: 'desc' },
      }),
      prisma.bundlePurchase.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          bundle: { select: { id: true, title: true, price: true } },
          referralCode: { select: { code: true, discountType: true, discountValue: true } },
        },
        orderBy: { purchasedAt: 'desc' },
      }),
    ]);
    res.json({ success: true, data: { packages: packagePurchases, bundles: bundlePurchases } });
  } catch (err) {
    console.error('Error fetching all purchases', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ADMIN: Approve a purchase (set approved=true)
export const adminApprovePurchase = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params; // type: 'package' or 'bundle'
    let updated;
    if (type === 'package') {
      updated = await prisma.packagePurchase.update({
        where: { id },
        data: { approved: true },
      });
    } else if (type === 'bundle') {
      updated = await prisma.bundlePurchase.update({
        where: { id },
        data: { approved: true },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid purchase type' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error approving purchase', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ADMIN: Revoke a purchase (set approved=false)
export const adminRevokePurchase = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    let updated;
    if (type === 'package') {
      updated = await prisma.packagePurchase.update({
        where: { id },
        data: { approved: false },
      });
    } else if (type === 'bundle') {
      updated = await prisma.bundlePurchase.update({
        where: { id },
        data: { approved: false },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid purchase type' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error revoking purchase', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ADMIN: Delete a purchase
export const adminDeletePurchase = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    let deleted;
    if (type === 'package') {
      deleted = await prisma.packagePurchase.delete({ where: { id } });
    } else if (type === 'bundle') {
      deleted = await prisma.bundlePurchase.delete({ where: { id } });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid purchase type' });
    }
    res.json({ success: true, data: deleted });
  } catch (err) {
    console.error('Error deleting purchase', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { userHasPackageAccess } from '../../lib/access-control';
import crypto from 'crypto';

// Helper function to calculate discount
const calculateDiscount = (price: number, discountType: string, discountValue: number): number => {
  if (discountType === 'PERCENTAGE') {
    return (price * discountValue) / 100;
  } else {
    return Math.min(discountValue, price); // Can't discount more than the price
  }
};

export const purchasePackage = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { packageId, proofImageUrl, referralCode } = req.body;

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ success: false, message: 'Package not found or inactive' });
    }

    // Already owns?
    if (await userHasPackageAccess(userId, packageId)) {
      return res.status(400).json({ success: false, message: 'User already has access to this package' });
    }

    let finalPrice = pkg.price;
    let discountApplied = 0;
    let referralCodeId: string | null = null;

    // Process referral code if provided
    if (referralCode) {
      const code = await prisma.referralCode.findUnique({
        where: { code: referralCode.toUpperCase() }
      });

      if (!code) {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }

      if (!code.isActive) {
        return res.status(400).json({ success: false, message: 'This referral code is no longer active' });
      }

      if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'This referral code has expired' });
      }

      if (code.usedCount >= code.quota) {
        return res.status(400).json({ success: false, message: 'This referral code has reached its usage limit' });
      }

      // Calculate discount
      discountApplied = calculateDiscount(pkg.price, code.discountType, code.discountValue);
      finalPrice = pkg.price - discountApplied;
      referralCodeId = code.id;
    }

    const purchase = await prisma.packagePurchase.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        packageId,
        originalPrice: pkg.price,
        pricePaid: finalPrice,
        discountApplied,
        referralCodeId,
        approved: false, // Requires admin approval
        proofImageUrl: proofImageUrl || null,
      },
    });

    // Increment referral code usage count
    if (referralCodeId) {
      await prisma.referralCode.update({
        where: { id: referralCodeId },
        data: { usedCount: { increment: 1 } }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Package purchase request submitted. Please wait for admin approval to access the content.', 
      data: {
        ...purchase,
        savings: discountApplied > 0 ? discountApplied : undefined
      }
    });
  } catch (err) {
    console.error('Error purchasing package', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const purchaseBundle = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { bundleId, proofImageUrl, referralCode } = req.body;

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

    let finalPrice = bundle.price;
    let discountApplied = 0;
    let referralCodeId: string | null = null;

    // Process referral code if provided
    if (referralCode) {
      const code = await prisma.referralCode.findUnique({
        where: { code: referralCode.toUpperCase() }
      });

      if (!code) {
        return res.status(400).json({ success: false, message: 'Invalid referral code' });
      }

      if (!code.isActive) {
        return res.status(400).json({ success: false, message: 'This referral code is no longer active' });
      }

      if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
        return res.status(400).json({ success: false, message: 'This referral code has expired' });
      }

      if (code.usedCount >= code.quota) {
        return res.status(400).json({ success: false, message: 'This referral code has reached its usage limit' });
      }

      // Calculate discount
      discountApplied = calculateDiscount(bundle.price, code.discountType, code.discountValue);
      finalPrice = bundle.price - discountApplied;
      referralCodeId = code.id;
    }

    const purchase = await prisma.bundlePurchase.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        bundleId,
        originalPrice: bundle.price,
        pricePaid: finalPrice,
        discountApplied,
        referralCodeId,
        approved: false, // Requires admin approval
        proofImageUrl: proofImageUrl || null,
      },
    });

    // Increment referral code usage count
    if (referralCodeId) {
      await prisma.referralCode.update({
        where: { id: referralCodeId },
        data: { usedCount: { increment: 1 } }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Bundle purchase request submitted. Please wait for admin approval to access the content.', 
      data: {
        ...purchase,
        savings: discountApplied > 0 ? discountApplied : undefined
      }
    });
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
