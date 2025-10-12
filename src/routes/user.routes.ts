import express from "express";
import { userController } from "../controller/user";
import { requireAuth, requireAdmin, requireNotBanned } from "../middleware/auth.middleware";
import { 
    validateBody, 
    validateQuery, 
    validateParams 
} from "../lib/validators/validation.middleware";
import {
    createUserSchema,
    createAdminSchema,
    updateUserSchema,
    updateUserProfileSchema,
    usersQuerySchema,
    userIdParamSchema
} from "../lib/validators/user.validator";

const router = express.Router();

// Public routes (no auth required)
router.get("/stats", userController.getUserStats);              

// Protected routes (authentication required)
router.use(requireAuth); 
router.use(requireNotBanned); 

// Current user session route
router.get("/me", userController.getUserFromSession);          
router.get("/is-admin", userController.isCurrentUserAdmin);

// Admin-only routes - specific routes first before generic :id route
router.get("/", requireAdmin, validateQuery(usersQuerySchema), userController.getAllUsers);      

// Specific named routes that should NOT match :id pattern
router.get("/admin-list", requireAdmin, validateQuery(usersQuerySchema), userController.getAllAdminUsers);
router.post("/create-admin", requireAdmin, validateBody(createAdminSchema), userController.createAdminUserWithPlugin);

// User profile operations - these have specific paths so they're safe
router.get("/:id/profile", validateParams(userIdParamSchema), userController.getUserProfile);  
router.put("/:id/profile", validateParams(userIdParamSchema), validateBody(updateUserProfileSchema), userController.updateUserProfile);

// Generic ID routes - these should come last
router.get("/:id", requireAdmin, validateParams(userIdParamSchema), userController.getUserById); 
router.post("/", requireAdmin, validateBody(createUserSchema), userController.createUser);     
router.put("/:id", requireAdmin, validateParams(userIdParamSchema), validateBody(updateUserSchema), userController.updateUser); 
router.delete("/:id", requireAdmin, validateParams(userIdParamSchema), userController.deleteUser); 
router.patch("/:id/revoke-admin", requireAdmin, validateParams(userIdParamSchema), userController.revokeAdminPrivileges);


export default router;