import { Request, Response, NextFunction } from 'express';

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error occurred:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        error: err.message,
        stack: err.stack,
        body: req.body,
        query: req.query,
        params: req.params,
    });
    
    next(err);
};

// Global error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Default error
    let status = 500;
    let message = 'Internal Server Error';
    let details: any = undefined;

    // Handle different error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
        details = err.message;
    } else if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
    } else if (err.message.includes('duplicate key')) {
        status = 409;
        message = 'Resource already exists';
    } else if (err.message.includes('not found')) {
        status = 404;
        message = 'Resource not found';
    }

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(status).json({
        message,
        ...(details && { details }),
        ...(isDevelopment && { stack: err.stack }),
    });
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        message: 'Route not found',
        availableRoutes: {
            auth: '/api/auth/*',
            users: '/api/users',
            studies: '/api/studies',
            courses: '/api/courses',
            health: '/api/health',
        },
    });
};

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};