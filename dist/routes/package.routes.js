"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../lib/validators/validation.middleware");
const package_1 = require("../controller/package");
const package_validator_1 = require("../lib/validators/package.validator");
const router = (0, express_1.Router)();
// All package routes require authentication
router.use(auth_middleware_1.requireAuth);
// Public routes (authenticated users can view packages)
router.get("/", package_1.getPackages); // Get all packages (active only for users, all for admin)
router.get("/:id", (0, validation_middleware_1.validateParams)(package_validator_1.packageIdSchema.shape.params), package_1.getPackageById); // Get specific package
// Admin-only routes
router.post("/", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateBody)(package_validator_1.createPackageSchema.shape.body), package_1.createPackage); // Create package
router.put("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(package_validator_1.updatePackageSchema.shape.params), (0, validation_middleware_1.validateBody)(package_validator_1.updatePackageSchema.shape.body), package_1.updatePackage); // Update package
router.delete("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(package_validator_1.packageIdSchema.shape.params), package_1.deletePackage); // Delete package
// Package question management (Admin only)
router.post("/:packageId/questions", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(package_validator_1.addQuestionsToPackageSchema.shape.params), (0, validation_middleware_1.validateBody)(package_validator_1.addQuestionsToPackageSchema.shape.body), package_1.addQuestionsToPackage); // Add questions to package
router.delete("/:packageId/questions", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(package_validator_1.removeQuestionsFromPackageSchema.shape.params), (0, validation_middleware_1.validateBody)(package_validator_1.removeQuestionsFromPackageSchema.shape.body), package_1.removeQuestionsFromPackage); // Remove questions from package
router.post("/:packageId/questions/random", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(package_validator_1.addRandomQuestionsFromCourseSchema.shape.params), (0, validation_middleware_1.validateBody)(package_validator_1.addRandomQuestionsFromCourseSchema.shape.body), package_1.addRandomQuestionsFromCourse); // Add random X questions from a course to a package
exports.default = router;
