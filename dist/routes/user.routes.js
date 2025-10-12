"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controller/user");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../lib/validators/validation.middleware");
const user_validator_1 = require("../lib/validators/user.validator");
const router = express_1.default.Router();
// Public routes (no auth required)
router.get("/stats", user_1.userController.getUserStats);
// Protected routes (authentication required)
router.use(auth_middleware_1.requireAuth);
router.use(auth_middleware_1.requireNotBanned);
// Current user session route
router.get("/me", user_1.userController.getUserFromSession);
router.get("/is-admin", user_1.userController.isCurrentUserAdmin);
// Admin-only routes - specific routes first before generic :id route
router.get("/", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateQuery)(user_validator_1.usersQuerySchema), user_1.userController.getAllUsers);
router.get("/admins", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateQuery)(user_validator_1.usersQuerySchema), user_1.userController.getAllAdminUsers);
router.post("/create-admin", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateBody)(user_validator_1.createAdminSchema), user_1.userController.createAdminUserWithPlugin);
// User profile operations - these have specific paths so they're safe
router.get("/:id/profile", (0, validation_middleware_1.validateParams)(user_validator_1.userIdParamSchema), user_1.userController.getUserProfile);
router.put("/:id/profile", (0, validation_middleware_1.validateParams)(user_validator_1.userIdParamSchema), (0, validation_middleware_1.validateBody)(user_validator_1.updateUserProfileSchema), user_1.userController.updateUserProfile);
// Generic ID routes - these should come last
router.get("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(user_validator_1.userIdParamSchema), user_1.userController.getUserById);
router.post("/", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateBody)(user_validator_1.createUserSchema), user_1.userController.createUser);
router.put("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(user_validator_1.userIdParamSchema), (0, validation_middleware_1.validateBody)(user_validator_1.updateUserSchema), user_1.userController.updateUser);
router.delete("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(user_validator_1.userIdParamSchema), user_1.userController.deleteUser);
router.patch("/:id/revoke-admin", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(user_validator_1.userIdParamSchema), user_1.userController.revokeAdminPrivileges);
exports.default = router;
