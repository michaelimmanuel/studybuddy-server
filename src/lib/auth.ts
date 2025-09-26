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
    trustedOrigins: ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
});