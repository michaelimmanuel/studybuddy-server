import express from "express";
import { userController } from "../controller/user";
import { requireAuth, requireAdmin, requireNotBanned } from "../middleware/auth.middleware";
import { validateUUID } from "../middleware/validation.middleware";

const router = express.Router();

// Public routes (no auth required)
router.get("/stats", userController.getUserStats);              // GET /api/users/stats (public stats)

// Protected routes (authentication required)
router.use(requireAuth); // All routes below require authentication
router.use(requireNotBanned); // All routes below require user to not be banned

// Current user session route
router.get("/me", userController.getUserFromSession);           // GET /api/users/me

// User profile operations
router.get("/:id/profile", validateUUID, userController.getUserProfile);  // GET /api/users/:id/profile
router.put("/:id/profile", validateUUID, userController.updateUserProfile); // PUT /api/users/:id/profile

// Admin-only routes
router.get("/", requireAdmin, userController.getAllUsers);      // GET /api/users (admin only)
router.get("/:id", requireAdmin, validateUUID, userController.getUserById); // GET /api/users/:id (admin only)
router.post("/", requireAdmin, userController.createUser);     // POST /api/users (admin only)
router.put("/:id", requireAdmin, validateUUID, userController.updateUser); // PUT /api/users/:id (admin only)
router.delete("/:id", requireAdmin, validateUUID, userController.deleteUser); // DELETE /api/users/:id (admin only)

export default router;