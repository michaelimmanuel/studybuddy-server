import { z } from 'zod';

// Common validation schemas that can be reused across different entities

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Pagination schemas
export const paginationQuerySchema = z.object({
    page: z.string()
        .regex(/^\d+$/, 'Page must be a positive number')
        .transform(Number)
        .refine(num => num > 0, 'Page must be greater than 0')
        .optional(),
    limit: z.string()
        .regex(/^\d+$/, 'Limit must be a positive number') 
        .transform(Number)
        .refine(num => num > 0 && num <= 100, 'Limit must be between 1 and 100')
        .optional()
});

// Search query schema
export const searchQuerySchema = z.object({
    search: z.string()
        .max(100, 'Search query must be less than 100 characters')
        .optional()
        .transform(val => val?.trim())
});

// Combined pagination with search
export const paginatedSearchSchema = paginationQuerySchema.merge(searchQuerySchema);

// Common parameter schemas
export const idParamSchema = z.object({
    id: uuidSchema
});

// Email validation
export const emailSchema = z.string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim();

// Password validation with strength requirements
export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
        'Password must contain at least one lowercase letter, one uppercase letter, and one number');

// Name validation
export const nameSchema = z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Optional name (for updates)
export const optionalNameSchema = nameSchema.optional();

// Description validation
export const descriptionSchema = z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null);

// Title validation
export const titleSchema = z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim();

// Optional title (for updates)
export const optionalTitleSchema = titleSchema.optional();

// Date validation
export const dateSchema = z.string().datetime('Invalid date format').optional();

// Status validation helper
export const createEnumSchema = <T extends Record<string, string | number>>(
    enumObject: T,
    errorMessage: string = 'Invalid value'
) => {
    const values = Object.values(enumObject) as [string, ...string[]];
    return z.enum(values, { message: errorMessage });
};

// Common response schemas for documentation
export const successResponseSchema = z.object({
    message: z.string()
});

export const errorResponseSchema = z.object({
    message: z.string(),
    details: z.any().optional()
});

export const paginationResponseSchema = z.object({
    page: z.number(),
    limit: z.number(), 
    totalPages: z.number(),
    totalItems: z.number()
});