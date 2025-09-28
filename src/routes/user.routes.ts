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

// User profile operations
router.get("/:id/profile", validateParams(userIdParamSchema), userController.getUserProfile);  
router.put("/:id/profile", validateParams(userIdParamSchema), validateBody(updateUserProfileSchema), userController.updateUserProfile); 
router.get("/is-admin", userController.isCurrentUserAdmin);
// Admin-only routes
router.get("/", requireAdmin, validateQuery(usersQuerySchema), userController.getAllUsers);      
router.get("/:id", requireAdmin, validateParams(userIdParamSchema), userController.getUserById); 
router.post("/", requireAdmin, validateBody(createUserSchema), userController.createUser);     
router.put("/:id", requireAdmin, validateParams(userIdParamSchema), validateBody(updateUserSchema), userController.updateUser); 
router.delete("/:id", requireAdmin, validateParams(userIdParamSchema), userController.deleteUser); 


export default router;