"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../lib/validators/validation.middleware");
const purchase_1 = require("../controller/purchase");
const purchase_validator_1 = require("../lib/validators/purchase.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// User endpoints
router.post('/package', (0, validation_middleware_1.validateBody)(purchase_validator_1.purchasePackageSchema.shape.body), purchase_1.purchasePackage);
router.post('/bundle', (0, validation_middleware_1.validateBody)(purchase_validator_1.purchaseBundleSchema.shape.body), purchase_1.purchaseBundle);
router.get('/mine', purchase_1.getMyPurchases);
router.get('/package/:packageId/access', (0, validation_middleware_1.validateParams)(purchase_validator_1.checkPackageAccessSchema.shape.params), purchase_1.checkPackageAccess);
// Admin endpoints
router.get('/admin/all', auth_middleware_1.requireAdmin, purchase_1.adminListAllPurchases); // List all purchases
router.post('/admin/:type/:id/approve', auth_middleware_1.requireAdmin, purchase_1.adminApprovePurchase); // Approve a purchase
router.post('/admin/:type/:id/revoke', auth_middleware_1.requireAdmin, purchase_1.adminRevokePurchase); // Revoke a purchase
router.delete('/admin/:type/:id', auth_middleware_1.requireAdmin, purchase_1.adminDeletePurchase); // Delete a purchase
exports.default = router;
