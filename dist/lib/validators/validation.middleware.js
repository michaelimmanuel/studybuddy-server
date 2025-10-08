"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidatedParams = exports.getValidatedQuery = exports.getValidatedBody = exports.sanitize = exports.validateBusinessRule = exports.validateOptional = exports.validateFileUpload = exports.validateMultipleUUIDs = exports.validatePagination = exports.validateUUID = exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
// Generic validation middleware factory
const validate = (schema) => {
    return (target) => {
        return (req, res, next) => {
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
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    return res.status(400).json({
                        message: 'Validation error',
                        details: error.issues.map((err) => ({
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
exports.validate = validate;
// Convenience functions for common validations
const validateBody = (schema) => (0, exports.validate)(schema)('body');
exports.validateBody = validateBody;
const validateQuery = (schema) => (0, exports.validate)(schema)('query');
exports.validateQuery = validateQuery;
const validateParams = (schema) => (0, exports.validate)(schema)('params');
exports.validateParams = validateParams;
// UUID validation middleware (commonly used)
exports.validateUUID = (0, exports.validateParams)(zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid UUID format')
}));
// Pagination validation middleware
exports.validatePagination = (0, exports.validateQuery)(zod_1.z.object({
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
}));
// Multiple UUID validation (for batch operations)
exports.validateMultipleUUIDs = (0, exports.validateBody)(zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().uuid('Each ID must be a valid UUID'))
        .min(1, 'At least one ID is required')
        .max(50, 'Maximum 50 IDs allowed')
}));
// File upload validation (requires multer middleware)
const validateFileUpload = (allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 5 * 1024 * 1024 // 5MB
) => {
    return (req, res, next) => {
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
exports.validateFileUpload = validateFileUpload;
// Conditional validation (validate only if field exists)
const validateOptional = (schema, target = 'body') => {
    return (req, res, next) => {
        const data = req[target];
        // If no data or empty object, skip validation
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return next();
        }
        return (0, exports.validate)(schema)(target)(req, res, next);
    };
};
exports.validateOptional = validateOptional;
// Custom validation for business rules
const validateBusinessRule = (rule, errorMessage = 'Business rule validation failed') => {
    return async (req, res, next) => {
        try {
            const isValid = await rule(req);
            if (!isValid) {
                return res.status(400).json({
                    message: errorMessage
                });
            }
            next();
        }
        catch (error) {
            console.error('Business rule validation error:', error);
            return res.status(500).json({
                message: 'Internal server error during business rule validation'
            });
        }
    };
};
exports.validateBusinessRule = validateBusinessRule;
// Sanitization middleware
const sanitize = (fields) => {
    return (req, res, next) => {
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
exports.sanitize = sanitize;
// Helper functions to access validated data
const getValidatedBody = (req) => req.validated?.body || req.body;
exports.getValidatedBody = getValidatedBody;
const getValidatedQuery = (req) => req.validated?.query || req.query;
exports.getValidatedQuery = getValidatedQuery;
const getValidatedParams = (req) => req.validated?.params || req.params;
exports.getValidatedParams = getValidatedParams;
