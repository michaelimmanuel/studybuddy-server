"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPackageAccess = exports.getMyPurchases = exports.purchaseBundle = exports.purchasePackage = exports.adminDeletePurchase = exports.adminRevokePurchase = exports.adminApprovePurchase = exports.adminListAllPurchases = void 0;
// ADMIN: List all purchases (packages and bundles)
const adminListAllPurchases = async (req, res) => {
    try {
        const [packagePurchases, bundlePurchases] = await Promise.all([
            prisma_1.default.packagePurchase.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    package: { select: { id: true, title: true, price: true } },
                },
                orderBy: { purchasedAt: 'desc' },
            }),
            prisma_1.default.bundlePurchase.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    bundle: { select: { id: true, title: true, price: true } },
                },
                orderBy: { purchasedAt: 'desc' },
            }),
        ]);
        res.json({ success: true, data: { packages: packagePurchases, bundles: bundlePurchases } });
    }
    catch (err) {
        console.error('Error fetching all purchases', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.adminListAllPurchases = adminListAllPurchases;
// ADMIN: Approve a purchase (set approved=true)
const adminApprovePurchase = async (req, res) => {
    try {
        const { type, id } = req.params; // type: 'package' or 'bundle'
        let updated;
        if (type === 'package') {
            updated = await prisma_1.default.packagePurchase.update({
                where: { id },
                data: { approved: true },
            });
        }
        else if (type === 'bundle') {
            updated = await prisma_1.default.bundlePurchase.update({
                where: { id },
                data: { approved: true },
            });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid purchase type' });
        }
        res.json({ success: true, data: updated });
    }
    catch (err) {
        console.error('Error approving purchase', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.adminApprovePurchase = adminApprovePurchase;
// ADMIN: Revoke a purchase (set approved=false)
const adminRevokePurchase = async (req, res) => {
    try {
        const { type, id } = req.params;
        let updated;
        if (type === 'package') {
            updated = await prisma_1.default.packagePurchase.update({
                where: { id },
                data: { approved: false },
            });
        }
        else if (type === 'bundle') {
            updated = await prisma_1.default.bundlePurchase.update({
                where: { id },
                data: { approved: false },
            });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid purchase type' });
        }
        res.json({ success: true, data: updated });
    }
    catch (err) {
        console.error('Error revoking purchase', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.adminRevokePurchase = adminRevokePurchase;
// ADMIN: Delete a purchase
const adminDeletePurchase = async (req, res) => {
    try {
        const { type, id } = req.params;
        let deleted;
        if (type === 'package') {
            deleted = await prisma_1.default.packagePurchase.delete({ where: { id } });
        }
        else if (type === 'bundle') {
            deleted = await prisma_1.default.bundlePurchase.delete({ where: { id } });
        }
        else {
            return res.status(400).json({ success: false, message: 'Invalid purchase type' });
        }
        res.json({ success: true, data: deleted });
    }
    catch (err) {
        console.error('Error deleting purchase', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.adminDeletePurchase = adminDeletePurchase;
const prisma_1 = __importDefault(require("../../lib/prisma"));
// Helper: determine if user already has access to a package (direct or via bundle)
const userHasPackageAccess = async (userId, packageId) => {
    const purchase = await prisma_1.default.packagePurchase.findUnique({
        where: { userId_packageId: { userId, packageId } },
        select: { id: true },
    });
    if (purchase)
        return true;
    const bundlePurchase = await prisma_1.default.bundlePurchase.findFirst({
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
const purchasePackage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId } = req.body;
        const pkg = await prisma_1.default.package.findUnique({ where: { id: packageId } });
        if (!pkg || !pkg.isActive) {
            return res.status(404).json({ success: false, message: 'Package not found or inactive' });
        }
        // Already owns?
        if (await userHasPackageAccess(userId, packageId)) {
            return res.status(400).json({ success: false, message: 'User already has access to this package' });
        }
        const purchase = await prisma_1.default.packagePurchase.create({
            data: {
                userId,
                packageId,
                pricePaid: pkg.price,
            },
        });
        res.status(201).json({ success: true, message: 'Package purchased successfully', data: purchase });
    }
    catch (err) {
        console.error('Error purchasing package', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.purchasePackage = purchasePackage;
const purchaseBundle = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bundleId } = req.body;
        const bundle = await prisma_1.default.bundle.findUnique({
            where: { id: bundleId },
            include: { bundlePackages: { select: { packageId: true } } },
        });
        if (!bundle || !bundle.isActive) {
            return res.status(404).json({ success: false, message: 'Bundle not found or inactive' });
        }
        const existing = await prisma_1.default.bundlePurchase.findUnique({ where: { userId_bundleId: { userId, bundleId } } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already owns this bundle' });
        }
        const purchase = await prisma_1.default.bundlePurchase.create({
            data: {
                userId,
                bundleId,
                pricePaid: bundle.price,
            },
        });
        res.status(201).json({ success: true, message: 'Bundle purchased successfully', data: purchase });
    }
    catch (err) {
        console.error('Error purchasing bundle', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.purchaseBundle = purchaseBundle;
const getMyPurchases = async (req, res) => {
    try {
        const userId = req.user.id;
        const [packagePurchases, bundlePurchases] = await Promise.all([
            prisma_1.default.packagePurchase.findMany({
                where: { userId },
                include: { package: { select: { id: true, title: true, price: true } } },
                orderBy: { purchasedAt: 'desc' },
            }),
            prisma_1.default.bundlePurchase.findMany({
                where: { userId },
                include: { bundle: { select: { id: true, title: true, price: true } } },
                orderBy: { purchasedAt: 'desc' },
            }),
        ]);
        res.json({ success: true, data: { packages: packagePurchases, bundles: bundlePurchases } });
    }
    catch (err) {
        console.error('Error fetching purchases', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getMyPurchases = getMyPurchases;
const checkPackageAccess = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId } = req.params;
        const hasAccess = await userHasPackageAccess(userId, packageId);
        res.json({ success: true, data: { packageId, hasAccess } });
    }
    catch (err) {
        console.error('Error checking access', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.checkPackageAccess = checkPackageAccess;
