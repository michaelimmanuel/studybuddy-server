import { Request, Response, NextFunction } from 'express';

// Validation middleware factory
export const validateBody = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                message: 'Validation error',
                details: error.details.map((detail: any) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
        }
        
        next();
    };
};

// Validate query parameters
export const validateQuery = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.query);
        
        if (error) {
            return res.status(400).json({
                message: 'Query validation error',
                details: error.details.map((detail: any) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
        }
        
        next();
    };
};

// Validate route parameters
export const validateParams = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.params);
        
        if (error) {
            return res.status(400).json({
                message: 'Parameter validation error',
                details: error.details.map((detail: any) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
        }
        
        next();
    };
};

// Simple validation functions for common cases
export const validateUUID = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
        return res.status(400).json({
            message: 'Invalid ID format',
            details: 'ID must be a valid UUID',
        });
    }
    
    next();
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        valid: errors.length === 0,
        errors,
    };
};