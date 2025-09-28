import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Generic validation middleware factory
export const validate = (schema: z.ZodSchema) => {
    return (target: 'body' | 'query' | 'params') => {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const dataToValidate = req[target];
                const validatedData = schema.parse(dataToValidate);
                
                // Store validated data in a separate property to avoid read-only issues
                if (!req.validated) {
                    req.validated = {};
                }
                req.validated[target] = validatedData;
                
                // For body and params, we can safely replace the original data
                if (target !== 'query') {
                    req[target] = validatedData;
                }
                
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    return res.status(400).json({
                        message: 'Validation error',
                        details: error.issues.map((err: any) => ({
                            field: err.path.join('.'),
                            message: err.message,
                            received: err.code === 'invalid_type' ? typeof err.received : err.received,
                        })),
                    });
                }
                
                // Handle unexpected errors
                console.error('Validation middleware error:', error);
                return res.status(500).json({
                    message: 'Internal server error during validation',
                });
            }
        };
    };
};

// Convenience functions for common validations
export const validateBody = (schema: z.ZodSchema) => validate(schema)('body');
export const validateQuery = (schema: z.ZodSchema) => validate(schema)('query');
export const validateParams = (schema: z.ZodSchema) => validate(schema)('params');

// UUID validation middleware (commonly used)
export const validateUUID = validateParams(z.object({
    id: z.string().uuid('Invalid UUID format')
}));

// Pagination validation middleware
export const validatePagination = validateQuery(z.object({
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
}));

// Multiple UUID validation (for batch operations)
export const validateMultipleUUIDs = validateBody(z.object({
    ids: z.array(z.string().uuid('Each ID must be a valid UUID'))
        .min(1, 'At least one ID is required')
        .max(50, 'Maximum 50 IDs allowed')
}));

// File upload validation (requires multer middleware)
export const validateFileUpload = (
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif'],
    maxSize: number = 5 * 1024 * 1024 // 5MB
) => {
    return (req: any, res: Response, next: NextFunction) => {
        const file = req.file; // This requires multer middleware
        
        if (!file) {
            return res.status(400).json({
                message: 'File is required'
            });
        }
        
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                message: 'Invalid file type',
                details: `Allowed types: ${allowedTypes.join(', ')}`
            });
        }
        
        if (file.size > maxSize) {
            return res.status(400).json({
                message: 'File too large',
                details: `Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
            });
        }
        
        next();
    };
};

// Conditional validation (validate only if field exists)
export const validateOptional = (schema: z.ZodSchema, target: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = req[target];
        
        // If no data or empty object, skip validation
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return next();
        }
        
        return validate(schema)(target)(req, res, next);
    };
};

// Custom validation for business rules
export const validateBusinessRule = (
    rule: (data: any) => boolean | Promise<boolean>,
    errorMessage: string = 'Business rule validation failed'
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isValid = await rule(req);
            
            if (!isValid) {
                return res.status(400).json({
                    message: errorMessage
                });
            }
            
            next();
        } catch (error) {
            console.error('Business rule validation error:', error);
            return res.status(500).json({
                message: 'Internal server error during business rule validation'
            });
        }
    };
};

// Sanitization middleware
export const sanitize = (fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fields.forEach(field => {
            if (req.body[field] && typeof req.body[field] === 'string') {
                // Basic sanitization - trim whitespace and remove potential XSS
                req.body[field] = req.body[field]
                    .trim()
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<[^>]*>/g, ''); // Remove HTML tags
            }
        });
        next();
    };
};

// Helper functions to access validated data
export const getValidatedBody = (req: Request) => req.validated?.body || req.body;
export const getValidatedQuery = (req: Request) => req.validated?.query || req.query;
export const getValidatedParams = (req: Request) => req.validated?.params || req.params;