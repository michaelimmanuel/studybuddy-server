import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../lib/validators/validation.middleware';
import {
	purchasePackage,
	purchaseBundle,
	getMyPurchases,
	checkPackageAccess,
	adminListAllPurchases,
	adminApprovePurchase,
	adminRevokePurchase,
	adminDeletePurchase
} from '../controller/purchase';
import { purchasePackageSchema, purchaseBundleSchema, checkPackageAccessSchema } from '../lib/validators/purchase.validator';

const router = Router();


router.use(requireAuth);


// User endpoints
router.post('/package', validateBody(purchasePackageSchema.shape.body), purchasePackage);
router.post('/bundle', validateBody(purchaseBundleSchema.shape.body), purchaseBundle);
router.get('/mine', getMyPurchases);
router.get('/package/:packageId/access', validateParams(checkPackageAccessSchema.shape.params), checkPackageAccess);

// Admin endpoints
router.get('/admin/all', requireAdmin, adminListAllPurchases); // List all purchases
router.post('/admin/:type/:id/approve', requireAdmin, adminApprovePurchase); // Approve a purchase
router.post('/admin/:type/:id/revoke', requireAdmin, adminRevokePurchase); // Revoke a purchase
router.delete('/admin/:type/:id', requireAdmin, adminDeletePurchase); // Delete a purchase

export default router;
