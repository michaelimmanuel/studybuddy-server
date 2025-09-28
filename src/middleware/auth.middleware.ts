import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { APIError } from 'better-auth';

// Extend Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                role?: string;
                banned?: boolean;
            };
        }
    }
}

// Middleware to require authentication
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
            asResponse: true,
            returnHeaders: false,
        });

        const session = await response.json();

        if (!session || !session.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Attach user to request
        req.user = session.user;
        next();
    } catch (error) {
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({ 
                message: error.body?.message || 'Authentication error' 
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to require admin role
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
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
    } catch (error) {
        if (error instanceof APIError) {
            return res.status(error.statusCode).json({ 
                message: error.body?.message || 'Authentication error' 
            });
        }
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to check if user is not banned
export const requireNotBanned = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.banned) {
        return res.status(403).json({ 
            message: 'Account is banned',
            banReason: 'Account has been suspended'
        });
    }
    next();
};

// Optional auth middleware (doesn't fail if no auth)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
            asResponse: true,
            returnHeaders: false,
        });

        const session = await response.json();

        if (session && session.user) {
            req.user = session.user;
        }
    } catch (error) {
        // Silently continue if auth fails
        console.log('Optional auth failed, continuing without user');
    }
    
    next();
};