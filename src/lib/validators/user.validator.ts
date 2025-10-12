import { z } from 'zod';
import { 
    nameSchema,
    optionalNameSchema,
    emailSchema,
    passwordSchema,
    uuidSchema,
    paginationQuerySchema,
    idParamSchema,
    dateSchema
} from './common.validator';

// User role enum
export const UserRole = {
    ADMIN: 'admin',
    USER: 'user'
} as const;

// User validation schemas
export const createUserSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    role: z.enum(['admin', 'user']).optional().nullable(),
});

export const createAdminSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export const updateUserSchema = z.object({
    name: optionalNameSchema,
    role: z.enum(['admin', 'user']).optional().nullable(),
    banned: z.boolean().optional(),
    banReason: z.string().max(500, 'Ban reason must be less than 500 characters').optional().nullable(),
    banExpires: dateSchema,
}).refine(
    (data) => {
        // If banned is true, banReason should be provided
        if (data.banned === true && !data.banReason) {
            return false;
        }
        return true;
    },
    { 
        message: 'Ban reason is required when banning a user',
        path: ['banReason']
    }
);

export const updateUserProfileSchema = z.object({
    name: optionalNameSchema,
    image: z.string().url('Invalid image URL').optional().nullable(),
});

// Auth validation schemas
export const signUpSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export const signInSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
});

// Parameter validation schemas
export const userIdParamSchema = idParamSchema;

// Query validation schemas
export const usersQuerySchema = paginationQuerySchema.extend({
    role: z.enum(['admin', 'user']).optional(),
    banned: z.string().transform(val => val === 'true').optional(),
    search: z.string().max(100, 'Search query must be less than 100 characters').optional()
});

// User response schemas
export const userResponseSchema = z.object({
    id: uuidSchema,
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    role: z.string().nullable(),
    banned: z.boolean(),
    banReason: z.string().nullable(),
    banExpires: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const userProfileResponseSchema = z.object({
    id: uuidSchema,
    name: z.string(),
    email: z.string().email(),
    image: z.string().nullable(),
    role: z.string().nullable(),
    createdAt: z.string().datetime(),
});

// Validation helper functions
export const validateUserCreate = (data: unknown) => {
    return createUserSchema.parse(data);
};

export const validateUserUpdate = (data: unknown) => {
    return updateUserSchema.parse(data);
};

export const validateUserProfileUpdate = (data: unknown) => {
    return updateUserProfileSchema.parse(data);
};

export const validateUsersQuery = (query: unknown) => {
    return usersQuerySchema.parse(query);
};

export const validateSignUp = (data: unknown) => {
    return signUpSchema.parse(data);
};

export const validateSignIn = (data: unknown) => {
    return signInSchema.parse(data);
};

export const validateCreateAdmin = (data: unknown) => {
    return createAdminSchema.parse(data);
};

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UsersQuery = z.infer<typeof usersQuerySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;