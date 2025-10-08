"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.notFoundHandler = exports.errorHandler = exports.errorLogger = void 0;
// Error logging middleware
const errorLogger = (err, req, res, next) => {
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
exports.errorLogger = errorLogger;
// Global error handler
const errorHandler = (err, req, res, next) => {
    // Default error
    let status = 500;
    let message = 'Internal Server Error';
    let details = undefined;
    // Handle different error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
        details = err.message;
    }
    else if (err.name === 'CastError') {
        status = 400;
        message = 'Invalid ID format';
    }
    else if (err.message.includes('duplicate key')) {
        status = 409;
        message = 'Resource already exists';
    }
    else if (err.message.includes('not found')) {
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
exports.errorHandler = errorHandler;
// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
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
exports.notFoundHandler = notFoundHandler;
// Request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
    next();
};
exports.requestLogger = requestLogger;
