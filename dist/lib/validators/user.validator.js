"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignIn = exports.validateSignUp = exports.validateUsersQuery = exports.validateUserProfileUpdate = exports.validateUserUpdate = exports.validateUserCreate = exports.userProfileResponseSchema = exports.userResponseSchema = exports.usersQuerySchema = exports.userIdParamSchema = exports.signInSchema = exports.signUpSchema = exports.updateUserProfileSchema = exports.updateUserSchema = exports.createUserSchema = exports.UserRole = void 0;
const zod_1 = require("zod");
const common_validator_1 = require("./common.validator");
// User role enum
exports.UserRole = {
    ADMIN: 'admin',
    USER: 'user'
};
// User validation schemas
exports.createUserSchema = zod_1.z.object({
    name: common_validator_1.nameSchema,
    email: common_validator_1.emailSchema,
    role: zod_1.z.enum(['admin', 'user']).optional().nullable(),
});
exports.updateUserSchema = zod_1.z.object({
    name: common_validator_1.optionalNameSchema,
    role: zod_1.z.enum(['admin', 'user']).optional().nullable(),
    banned: zod_1.z.boolean().optional(),
    banReason: zod_1.z.string().max(500, 'Ban reason must be less than 500 characters').optional().nullable(),
    banExpires: common_validator_1.dateSchema,
}).refine((data) => {
    // If banned is true, banReason should be provided
    if (data.banned === true && !data.banReason) {
        return false;
    }
    return true;
}, {
    message: 'Ban reason is required when banning a user',
    path: ['banReason']
});
exports.updateUserProfileSchema = zod_1.z.object({
    name: common_validator_1.optionalNameSchema,
    image: zod_1.z.string().url('Invalid image URL').optional().nullable(),
});
// Auth validation schemas
exports.signUpSchema = zod_1.z.object({
    name: common_validator_1.nameSchema,
    email: common_validator_1.emailSchema,
    password: common_validator_1.passwordSchema,
});
exports.signInSchema = zod_1.z.object({
    email: common_validator_1.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
// Parameter validation schemas
exports.userIdParamSchema = common_validator_1.idParamSchema;
// Query validation schemas
exports.usersQuerySchema = common_validator_1.paginationQuerySchema.extend({
    role: zod_1.z.enum(['admin', 'user']).optional(),
    banned: zod_1.z.string().transform(val => val === 'true').optional(),
    search: zod_1.z.string().max(100, 'Search query must be less than 100 characters').optional()
});
// User response schemas
exports.userResponseSchema = zod_1.z.object({
    id: common_validator_1.uuidSchema,
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    emailVerified: zod_1.z.boolean(),
    image: zod_1.z.string().nullable(),
    role: zod_1.z.string().nullable(),
    banned: zod_1.z.boolean(),
    banReason: zod_1.z.string().nullable(),
    banExpires: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.userProfileResponseSchema = zod_1.z.object({
    id: common_validator_1.uuidSchema,
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    image: zod_1.z.string().nullable(),
    role: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string().datetime(),
});
// Validation helper functions
const validateUserCreate = (data) => {
    return exports.createUserSchema.parse(data);
};
exports.validateUserCreate = validateUserCreate;
const validateUserUpdate = (data) => {
    return exports.updateUserSchema.parse(data);
};
exports.validateUserUpdate = validateUserUpdate;
const validateUserProfileUpdate = (data) => {
    return exports.updateUserProfileSchema.parse(data);
};
exports.validateUserProfileUpdate = validateUserProfileUpdate;
const validateUsersQuery = (query) => {
    return exports.usersQuerySchema.parse(query);
};
exports.validateUsersQuery = validateUsersQuery;
const validateSignUp = (data) => {
    return exports.signUpSchema.parse(data);
};
exports.validateSignUp = validateSignUp;
const validateSignIn = (data) => {
    return exports.signInSchema.parse(data);
};
exports.validateSignIn = validateSignIn;
