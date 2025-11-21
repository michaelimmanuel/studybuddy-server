import express from 'express';
import { referralCodeController } from '../controller/referral';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { validateBody, validateQuery, validateParams } from '../lib/validators/validation.middleware';
import {
    createReferralCodeSchema,
    updateReferralCodeSchema,
    applyReferralCodeSchema,
    referralCodesQuerySchema,
    referralCodeIdParamSchema
} from '../lib/validators/referral.validator';

const router = express.Router();

// Public route - validate referral code
router.post('/validate',
    validateBody(applyReferralCodeSchema),
    referralCodeController.validateReferralCode
);

// Admin routes - require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Get all referral codes with pagination
router.get('/',
    validateQuery(referralCodesQuerySchema),
    referralCodeController.getAllReferralCodes
);

// Create new referral code
router.post('/',
    validateBody(createReferralCodeSchema),
    referralCodeController.createReferralCode
);

// Get referral code by ID
router.get('/:id',
    validateParams(referralCodeIdParamSchema),
    referralCodeController.getReferralCodeById
);

// Update referral code
router.put('/:id',
    validateParams(referralCodeIdParamSchema),
    validateBody(updateReferralCodeSchema),
    referralCodeController.updateReferralCode
);

// Delete referral code
router.delete('/:id',
    validateParams(referralCodeIdParamSchema),
    referralCodeController.deleteReferralCode
);

export default router;
