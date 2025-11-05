"use strict";
/**
 * Database URL configuration that switches between development and production
 * based on NODE_ENV environment variable
 *
 * In production (Vercel), set DATABASE_URL directly in environment variables
 * In development, DATABASE_URL is read from .env file
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseUrl = getDatabaseUrl;
function getDatabaseUrl() {
    // In production, Vercel should have DATABASE_URL set directly
    // Or we fall back to DATABASE_URL_PROD if available
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        // Try DATABASE_URL first (Vercel standard), then DATABASE_URL_PROD
        const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_PROD;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is required in production environment');
        }
        return databaseUrl;
    }
    // Development mode - use DATABASE_URL from .env
    const devUrl = process.env.DATABASE_URL;
    if (!devUrl) {
        throw new Error('DATABASE_URL is required in development environment');
    }
    return devUrl;
}
