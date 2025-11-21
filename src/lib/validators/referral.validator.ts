import { z } from 'zod';
import { uuidSchema, paginationQuerySchema } from './common.validator';

// Referral code discount type enum
export const DiscountType = {
    PERCENTAGE: 'PERCENTAGE',
    FIXED: 'FIXED'
} as const;

// Create referral code schema
export const createReferralCodeSchema = z.object({
    code: z.string()
        .min(3, 'Code must be at least 3 characters')
        .max(50, 'Code must be less than 50 characters')
        .regex(/^[A-Z0-9_-]+$/, 'Code must only contain uppercase letters, numbers, underscores, and hyphens')
        .transform(val => val.toUpperCase()),
    discountType: z.enum(['PERCENTAGE', 'FIXED'], {
        message: 'Discount type must be PERCENTAGE or FIXED'
    }),
    discountValue: z.number()
        .positive('Discount value must be positive'),
    quota: z.number()
        .int('Quota must be an integer')
        .positive('Quota must be at least 1'),
    isActive: z.boolean().optional().default(true),
    expiresAt: z.string().datetime().optional().nullable(),
}).refine((data) => {
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount cannot exceed 100%',
    path: ['discountValue']
});

// Update referral code schema
export const updateReferralCodeSchema = z.object({
    code: z.string()
        .min(3, 'Code must be at least 3 characters')
        .max(50, 'Code must be less than 50 characters')
        .regex(/^[A-Z0-9_-]+$/, 'Code must only contain uppercase letters, numbers, underscores, and hyphens')
        .transform(val => val.toUpperCase())
        .optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    discountValue: z.number().positive('Discount value must be positive').optional(),
    quota: z.number().int('Quota must be an integer').positive('Quota must be at least 1').optional(),
    isActive: z.boolean().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

// Validate referral code (for applying to purchase)
export const applyReferralCodeSchema = z.object({
    code: z.string()
        .min(1, 'Referral code is required')
        .transform(val => val.toUpperCase()),
});

// Query schema for listing referral codes
export const referralCodesQuerySchema = paginationQuerySchema.extend({
    isActive: z.string().transform(val => val === 'true').optional(),
    search: z.string().max(100, 'Search query must be less than 100 characters').optional()
});

// Parameter validation schemas
export const referralCodeIdParamSchema = z.object({
    id: uuidSchema
});

export const referralCodeParamSchema = z.object({
    code: z.string().min(1, 'Code is required')
});

// Validation helper functions
export const validateReferralCodeCreate = (data: unknown) => {
    return createReferralCodeSchema.parse(data);
};

export const validateReferralCodeUpdate = (data: unknown) => {
    return updateReferralCodeSchema.parse(data);
};

export const validateApplyReferralCode = (data: unknown) => {
    return applyReferralCodeSchema.parse(data);
};

export const validateReferralCodesQuery = (query: unknown) => {
    return referralCodesQuerySchema.parse(query);
};

// Type exports
export type CreateReferralCodeInput = z.infer<typeof createReferralCodeSchema>;
export type UpdateReferralCodeInput = z.infer<typeof updateReferralCodeSchema>;
export type ApplyReferralCodeInput = z.infer<typeof applyReferralCodeSchema>;
export type ReferralCodesQuery = z.infer<typeof referralCodesQuerySchema>;
