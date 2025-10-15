import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../lib/validators/validation.middleware';
import { purchasePackage, purchaseBundle, getMyPurchases, checkPackageAccess } from '../controller/purchase';
import { purchasePackageSchema, purchaseBundleSchema, checkPackageAccessSchema } from '../lib/validators/purchase.validator';

const router = Router();

router.use(requireAuth);

router.post('/package', validateBody(purchasePackageSchema.shape.body), purchasePackage);
router.post('/bundle', validateBody(purchaseBundleSchema.shape.body), purchaseBundle);
router.get('/mine', getMyPurchases);
router.get('/package/:packageId/access', validateParams(checkPackageAccessSchema.shape.params), checkPackageAccess);

export default router;
