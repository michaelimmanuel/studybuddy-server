import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { validateBody, validateParams } from "../lib/validators/validation.middleware";
import {
  createPackage,
  getPackages,
  getPackageById,
  addQuestionsToPackage,
  addRandomQuestionsFromCourse,
  removeQuestionsFromPackage,
  updatePackage,
  deletePackage,
} from "../controller/package";
import {
  createPackageSchema,
  addQuestionsToPackageSchema,
  updatePackageSchema,
  packageIdSchema,
  removeQuestionsFromPackageSchema,
  addRandomQuestionsFromCourseSchema,
} from "../lib/validators/package.validator";

const router = Router();

// All package routes require authentication
router.use(requireAuth);

// Public routes (authenticated users can view packages)
router.get("/", getPackages); // Get all packages (active only for users, all for admin)
router.get("/:id", validateParams(packageIdSchema.shape.params), getPackageById); // Get specific package

// Admin-only routes
router.post("/", requireAdmin, validateBody(createPackageSchema.shape.body), createPackage); // Create package
router.put("/:id", requireAdmin, validateParams(updatePackageSchema.shape.params), validateBody(updatePackageSchema.shape.body), updatePackage); // Update package
router.delete("/:id", requireAdmin, validateParams(packageIdSchema.shape.params), deletePackage); // Delete package

// Package question management (Admin only)
router.post("/:packageId/questions", requireAdmin, validateParams(addQuestionsToPackageSchema.shape.params), validateBody(addQuestionsToPackageSchema.shape.body), addQuestionsToPackage); // Add questions to package
router.delete("/:packageId/questions", requireAdmin, validateParams(removeQuestionsFromPackageSchema.shape.params), validateBody(removeQuestionsFromPackageSchema.shape.body), removeQuestionsFromPackage); // Remove questions from package
router.post(
  "/:packageId/questions/random",
  requireAdmin,
  validateParams(addRandomQuestionsFromCourseSchema.shape.params),
  validateBody(addRandomQuestionsFromCourseSchema.shape.body),
  addRandomQuestionsFromCourse
); // Add random X questions from a course to a package

export default router;