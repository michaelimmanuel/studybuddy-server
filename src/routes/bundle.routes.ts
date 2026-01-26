import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { validateBody, validateParams } from "../lib/validators/validation.middleware";
import {
  createBundle,
  getBundles,
  getBundleById,
  updateBundle,
  deleteBundle,
  addPackagesToBundle,
  removePackagesFromBundle,
} from "../controller/bundle";
import {
  createBundleSchema,
  updateBundleSchema,
  bundleIdSchema,
  addPackagesToBundleSchema,
  removePackagesFromBundleSchema,
} from "../lib/validators/bundle.validator";

const router = Router();

// Public routes (no auth required - shows active bundles to public, all to admin if authenticated)
router.get("/", getBundles); // Get all bundles (active only for non-admin, all for admin)
router.get("/:id", validateParams(bundleIdSchema.shape.params), getBundleById); // Get specific bundle

// Admin-only routes (require authentication and admin role)
router.post("/", requireAuth, requireAdmin, validateBody(createBundleSchema.shape.body), createBundle); // Create bundle
router.put("/:id", requireAuth, requireAdmin, validateParams(updateBundleSchema.shape.params), validateBody(updateBundleSchema.shape.body), updateBundle); // Update bundle
router.delete("/:id", requireAuth, requireAdmin, validateParams(bundleIdSchema.shape.params), deleteBundle); // Delete bundle

// Bundle package management (Admin only)
router.post("/:bundleId/packages", requireAuth, requireAdmin, validateParams(addPackagesToBundleSchema.shape.params), validateBody(addPackagesToBundleSchema.shape.body), addPackagesToBundle); // Add packages to bundle
router.delete("/:bundleId/packages", requireAuth, requireAdmin, validateParams(removePackagesFromBundleSchema.shape.params), validateBody(removePackagesFromBundleSchema.shape.body), removePackagesFromBundle); // Remove packages from bundle

export default router;