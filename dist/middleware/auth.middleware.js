"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireNotBanned = exports.requireAdmin = exports.requireAuth = void 0;
const auth_1 = require("../lib/auth");
const node_1 = require("better-auth/node");
const better_auth_1 = require("better-auth");
// Middleware to require authentication
const requireAuth = async (req, res, next) => {
    try {
        console.log('Auth middleware - Request headers:', {
            origin: req.headers.origin,
            cookie: req.headers.cookie,
            authorization: req.headers.authorization,
        });
        const response = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
            asResponse: true,
            returnHeaders: false,
        });
        const session = await response.json();
        console.log('🔍 Auth middleware - Session:', session);
        if (!session || !session.user) {
            console.log('❌ Auth middleware - No session or user found');
            return res.status(401).json({ message: 'Authentication required' });
        }
        console.log('✅ Auth middleware - User authenticated:', session.user.email);
        // Attach user to request
        req.user = session.user;
        next();
    }
    catch (error) {
        console.error('❌ Auth middleware error:', error);
        if (error instanceof better_auth_1.APIError) {
            return res.status(error.statusCode).json({
                message: error.body?.message || 'Authentication error'
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireAuth = requireAuth;
// Middleware to require admin role
const requireAdmin = async (req, res, next) => {
    try {
        const response = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
            asResponse: true,
            returnHeaders: false,
        });
        const session = await response.json();
        if (!session || !session.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        req.user = session.user;
        if (!req.user?.role || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    }
    catch (error) {
        if (error instanceof better_auth_1.APIError) {
            return res.status(error.statusCode).json({
                message: error.body?.message || 'Authentication error'
            });
        }
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.requireAdmin = requireAdmin;
// Middleware to check if user is not banned
const requireNotBanned = (req, res, next) => {
    if (req.user?.banned) {
        return res.status(403).json({
            message: 'Account is banned',
            banReason: 'Account has been suspended'
        });
    }
    next();
};
exports.requireNotBanned = requireNotBanned;
// Optional auth middleware (doesn't fail if no auth)
const optionalAuth = async (req, res, next) => {
    try {
        const response = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
            asResponse: true,
            returnHeaders: false,
        });
        const session = await response.json();
        if (session && session.user) {
            req.user = session.user;
        }
    }
    catch (error) {
        // Silently continue if auth fails
        console.log('Optional auth failed, continuing without user');
    }
    next();
};
exports.optionalAuth = optionalAuth;
