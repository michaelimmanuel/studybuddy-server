"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationResponseSchema = exports.errorResponseSchema = exports.successResponseSchema = exports.createEnumSchema = exports.dateSchema = exports.optionalTitleSchema = exports.titleSchema = exports.descriptionSchema = exports.optionalNameSchema = exports.nameSchema = exports.passwordSchema = exports.emailSchema = exports.idParamSchema = exports.paginatedSearchSchema = exports.searchQuerySchema = exports.paginationQuerySchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
// Common validation schemas that can be reused across different entities
// UUID validation
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
// Pagination schemas
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.string()
        .regex(/^\d+$/, 'Page must be a positive number')
        .transform(Number)
        .refine(num => num > 0, 'Page must be greater than 0')
        .optional(),
    limit: zod_1.z.string()
        .regex(/^\d+$/, 'Limit must be a positive number')
        .transform(Number)
        .refine(num => num > 0 && num <= 100, 'Limit must be between 1 and 100')
        .optional()
});
// Search query schema
exports.searchQuerySchema = zod_1.z.object({
    search: zod_1.z.string()
        .max(100, 'Search query must be less than 100 characters')
        .optional()
        .transform(val => val?.trim())
});
// Combined pagination with search
exports.paginatedSearchSchema = exports.paginationQuerySchema.merge(exports.searchQuerySchema);
// Common parameter schemas
exports.idParamSchema = zod_1.z.object({
    id: exports.uuidSchema
});
// Email validation
exports.emailSchema = zod_1.z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim();
// Password validation with strength requirements
exports.passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');
// Name validation
exports.nameSchema = zod_1.z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');
// Optional name (for updates)
exports.optionalNameSchema = exports.nameSchema.optional();
// Description validation
exports.descriptionSchema = zod_1.z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null);
// Title validation
exports.titleSchema = zod_1.z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim();
// Optional title (for updates)
exports.optionalTitleSchema = exports.titleSchema.optional();
// Date validation
exports.dateSchema = zod_1.z.string().datetime('Invalid date format').optional();
// Status validation helper
const createEnumSchema = (enumObject, errorMessage = 'Invalid value') => {
    const values = Object.values(enumObject);
    return zod_1.z.enum(values, { message: errorMessage });
};
exports.createEnumSchema = createEnumSchema;
// Common response schemas for documentation
exports.successResponseSchema = zod_1.z.object({
    message: zod_1.z.string()
});
exports.errorResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    details: zod_1.z.any().optional()
});
exports.paginationResponseSchema = zod_1.z.object({
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
    totalPages: zod_1.z.number(),
    totalItems: zod_1.z.number()
});
