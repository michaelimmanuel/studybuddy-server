"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRandomQuestionsFromCourseSchema = exports.removeQuestionsFromPackageSchema = exports.packageIdSchema = exports.updatePackageSchema = exports.addQuestionsToPackageSchema = exports.createPackageSchema = void 0;
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
        timeLimit: zod_1.z
            .union([zod_1.z.string(), zod_1.z.number()])
            .refine((val) => {
            if (val === null || val === undefined || val === "")
                return true;
            const num = typeof val === "string" ? parseInt(val, 10) : val;
            return Number.isInteger(num) && num > 0 && num <= 10080; // Max 1 week (10080 minutes)
        }, "Time limit must be a positive integer (in minutes, max 10080)")
            .optional()
            .nullable(),
        availableFrom: zod_1.z
            .string()
            .datetime("Available from must be a valid datetime")
            .optional()
            .nullable(),
        availableUntil: zod_1.z
            .string()
            .datetime("Available until must be a valid datetime")
            .optional()
            .nullable(),
    }).refine((data) => {
        // If both dates are provided, availableFrom should be before availableUntil
        if (data.availableFrom && data.availableUntil) {
            return new Date(data.availableFrom) < new Date(data.availableUntil);
        }
        return true;
    }, {
        message: "Available from date must be before available until date",
        path: ["availableUntil"]
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
        timeLimit: zod_1.z
            .union([zod_1.z.string(), zod_1.z.number()])
            .refine((val) => {
            if (val === null || val === undefined || val === "")
                return true;
            const num = typeof val === "string" ? parseInt(val, 10) : val;
            return Number.isInteger(num) && num > 0 && num <= 10080; // Max 1 week (10080 minutes)
        }, "Time limit must be a positive integer (in minutes, max 10080)")
            .optional()
            .nullable(),
        availableFrom: zod_1.z
            .string()
            .datetime("Available from must be a valid datetime")
            .optional()
            .nullable(),
        availableUntil: zod_1.z
            .string()
            .datetime("Available until must be a valid datetime")
            .optional()
            .nullable(),
    }).refine((data) => {
        // If both dates are provided, availableFrom should be before availableUntil
        if (data.availableFrom && data.availableUntil) {
            return new Date(data.availableFrom) < new Date(data.availableUntil);
        }
        return true;
    }, {
        message: "Available from date must be before available until date",
        path: ["availableUntil"]
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
// Add random questions from a specific course to a package
exports.addRandomQuestionsFromCourseSchema = zod_1.z.object({
    params: zod_1.z.object({
        packageId: zod_1.z.string().uuid("Package ID must be a valid UUID"),
    }),
    body: zod_1.z.object({
        courseId: zod_1.z.string().uuid("Course ID must be a valid UUID"),
        count: zod_1.z
            .union([zod_1.z.string(), zod_1.z.number()])
            .refine((val) => {
            const num = typeof val === 'string' ? parseInt(val, 10) : val;
            return Number.isInteger(num) && num >= 1 && num <= 200;
        }, "count must be an integer between 1 and 200"),
    }),
});
