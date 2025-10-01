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
        "https://studybuddy-web.vercel.app", // Add your frontend production URL
    ],
    // Add explicit cookie configuration for cross-origin
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
            secure: false,
            sameSite: "none",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        },
        csrfToken: {
            name: "better-auth.csrf_token", 
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        }
    },
});