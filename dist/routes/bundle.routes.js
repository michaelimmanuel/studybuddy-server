"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../lib/validators/validation.middleware");
const bundle_1 = require("../controller/bundle");
const bundle_validator_1 = require("../lib/validators/bundle.validator");
const router = (0, express_1.Router)();
// All bundle routes require authentication
router.use(auth_middleware_1.requireAuth);
// Public routes (authenticated users can view bundles)
router.get("/", bundle_1.getBundles); // Get all bundles (active only for users, all for admin)
router.get("/:id", (0, validation_middleware_1.validateParams)(bundle_validator_1.bundleIdSchema.shape.params), bundle_1.getBundleById); // Get specific bundle
// Admin-only routes
router.post("/", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateBody)(bundle_validator_1.createBundleSchema.shape.body), bundle_1.createBundle); // Create bundle
router.put("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(bundle_validator_1.updateBundleSchema.shape.params), (0, validation_middleware_1.validateBody)(bundle_validator_1.updateBundleSchema.shape.body), bundle_1.updateBundle); // Update bundle
router.delete("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(bundle_validator_1.bundleIdSchema.shape.params), bundle_1.deleteBundle); // Delete bundle
// Bundle package management (Admin only)
router.post("/:bundleId/packages", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(bundle_validator_1.addPackagesToBundleSchema.shape.params), (0, validation_middleware_1.validateBody)(bundle_validator_1.addPackagesToBundleSchema.shape.body), bundle_1.addPackagesToBundle); // Add packages to bundle
router.delete("/:bundleId/packages", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(bundle_validator_1.removePackagesFromBundleSchema.shape.params), (0, validation_middleware_1.validateBody)(bundle_validator_1.removePackagesFromBundleSchema.shape.body), bundle_1.removePackagesFromBundle); // Remove packages from bundle
exports.default = router;
