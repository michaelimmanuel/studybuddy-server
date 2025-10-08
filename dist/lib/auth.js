"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const prisma_2 = __importDefault(require("./prisma"));
const plugins_1 = require("better-auth/plugins");
exports.auth = (0, better_auth_1.betterAuth)({
    // Ensure library has a base URL to build absolute links/callbacks
    baseURL: process.env.BETTER_AUTH_URL || process.env.BASE_URL || `http://localhost:8000`,
    database: (0, prisma_1.prismaAdapter)(prisma_2.default, {
        provider: "postgresql",
    }),
    plugins: [
        (0, plugins_1.admin)()
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
