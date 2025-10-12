"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeQuestionsFromPackageSchema = exports.packageIdSchema = exports.updatePackageSchema = exports.addQuestionsToPackageSchema = exports.createPackageSchema = void 0;
const zod_1 = require("zod");
exports.createPackageSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .min(1, "Title is required")
            .max(200, "Title must be less than 200 characters"),
        description: zod_1.z
            .string()
            .max(1000, "Description must be less than 1000 characters")
            .optional(),
        price: zod_1.z
            .union([zod_1.z.string(), zod_1.z.number()])
            .refine((val) => {
            const num = typeof val === "string" ? parseFloat(val) : val;
            return !isNaN(num) && num >= 0;
        }, "Price must be a valid positive number (in IDR)"),
    }),
});
exports.addQuestionsToPackageSchema = zod_1.z.object({
    body: zod_1.z.object({
        questionIds: zod_1.z
            .array(zod_1.z.string().uuid("Each question ID must be a valid UUID"))
            .min(1, "At least one question ID is required")
            .max(100, "Maximum 100 questions can be added at once"),
    }),
    params: zod_1.z.object({
        packageId: zod_1.z.string().uuid("Package ID must be a valid UUID"),
    }),
});
exports.updatePackageSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .min(1, "Title cannot be empty")
            .max(200, "Title must be less than 200 characters")
            .optional(),
        description: zod_1.z
            .string()
            .max(1000, "Description must be less than 1000 characters")
            .optional(),
        price: zod_1.z
            .union([zod_1.z.string(), zod_1.z.number()])
            .refine((val) => {
            const num = typeof val === "string" ? parseFloat(val) : val;
            return !isNaN(num) && num >= 0;
        }, "Price must be a valid positive number (in IDR)")
            .optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Package ID must be a valid UUID"),
    }),
});
exports.packageIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Package ID must be a valid UUID"),
    }),
});
exports.removeQuestionsFromPackageSchema = zod_1.z.object({
    body: zod_1.z.object({
        questionIds: zod_1.z
            .array(zod_1.z.string().uuid("Each question ID must be a valid UUID"))
            .min(1, "At least one question ID is required"),
    }),
    params: zod_1.z.object({
        packageId: zod_1.z.string().uuid("Package ID must be a valid UUID"),
    }),
});
