import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    // Ensure library has a base URL to build absolute links/callbacks
    baseURL: process.env.BETTER_AUTH_URL || process.env.BASE_URL || `http://localhost:8000`,
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    plugins: [
        admin()
    ],
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:4173", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:5173",
        "https://studybuddymeds.com", // Your production domain
        "https://www.studybuddymeds.com", // Your frontend domain with www
        "https://api.studybuddymeds.com", // API subdomain
    ],
    advanced: {
        session: {
            cookieCache: {
                enabled: true,
                maxAge: 60 * 5, // 5 minutes
            },
        },
        
        cookies: {
            sessionToken: {
                name: "better-auth.session_token",
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: "/",
                domain: process.env.NODE_ENV === "production" ? ".studybuddymeds.com" : undefined,
            },
            csrfToken: {
                name: "better-auth.csrf_token", 
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 60 * 60 * 24, // 24 hours
                path: "/",
                domain: process.env.NODE_ENV === "production" ? ".studybuddymeds.com" : undefined,
            }
        },
    },
});

// Middleware to attach resolved global permissions to the request session/user
export async function attachPermissionsToRequest(req: any, _res: any, next: any) {
    try {
        let userId = req.user?.id || req.session?.userId || req.userId

        // Fallback: if Better Auth hasn't attached session/user, try to resolve from cookie
        if (!userId && req.cookies) {
            const raw = req.cookies['better-auth.session_token'] || req.cookies['better-auth.session']
            if (raw) {
                const token = decodeURIComponent(String(raw))
                const session = await prisma.session.findUnique({ where: { token } })
                if (session) {
                    userId = session.userId
                    // attach minimal session/user info for downstream middleware
                    if (!req.session) req.session = {}
                    req.session.userId = session.userId
                    const user = await prisma.user.findUnique({ where: { id: session.userId } })
                    if (user) req.user = user
                }
            }
        }

        if (!userId) return next()

        // fetch global (non-scoped) allow grants and include permission name
        const grants = await prisma.userPermission.findMany({
            where: {
                userId,
                resourceType: null,
                resourceId: null,
                grant: 'ALLOW',
            },
            include: { permission: true },
        })

        const permissionNames = grants.map((g) => g.permission.name)

        // attach to session or user object
        if (req.session) req.session.permissions = permissionNames
        if (req.user) req.user.permissions = permissionNames
        // also set on top-level for convenience
        req.permissions = permissionNames

        // Attempt to persist to session store if API available (some session handlers expose save())
        try {
            if (req.session && typeof req.session.save === 'function') {
                await new Promise((res, rej) => req.session.save((err: any) => (err ? rej(err) : res(undefined))))
            }
        } catch (err) {
            // ignore persistence errors — request still proceeds with attached permissions
            console.warn('Failed to persist permissions to session store', err)
        }

        return next()
    } catch (err) {
        return next(err)
    }
}
