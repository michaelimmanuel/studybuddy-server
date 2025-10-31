"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePackagesFromBundleSchema = exports.addPackagesToBundleSchema = exports.bundleIdSchema = exports.updateBundleSchema = exports.createBundleSchema = void 0;
const zod_1 = require("zod");
// Create bundle schema
exports.createBundleSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
        description: zod_1.z.string().optional(),
        price: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).refine((val) => {
            const num = typeof val === 'string' ? parseFloat(val) : val;
            return !isNaN(num) && num >= 0;
        }, { message: "Price must be a valid positive number" }),
        discount: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().refine((val) => {
            if (val === undefined || val === null || val === '')
                return true;
            const num = typeof val === 'string' ? parseFloat(val) : val;
            return !isNaN(num) && num >= 0 && num <= 100;
        }, { message: "Discount must be a valid number between 0 and 100" }),
        availableFrom: zod_1.z.string().optional().refine((val) => {
            if (!val)
                return true;
            return !isNaN(Date.parse(val));
        }, { message: "Available from must be a valid date" }),
        availableUntil: zod_1.z.string().optional().refine((val) => {
            if (!val)
                return true;
            return !isNaN(Date.parse(val));
        }, { message: "Available until must be a valid date" }),
    }),
});
// Update bundle schema
exports.updateBundleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid bundle ID"),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().refine((val) => {
            if (val === undefined || val === null || val === '')
                return true;
            const num = typeof val === 'string' ? parseFloat(val) : val;
            return !isNaN(num) && num >= 0;
        }, { message: "Price must be a valid positive number" }),
        discount: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().refine((val) => {
            if (val === undefined || val === null || val === '')
                return true;
            const num = typeof val === 'string' ? parseFloat(val) : val;
            return !isNaN(num) && num >= 0 && num <= 100;
        }, { message: "Discount must be a valid number between 0 and 100" }),
        isActive: zod_1.z.boolean().optional(),
        availableFrom: zod_1.z.string().optional().refine((val) => {
            if (!val)
                return true;
            return !isNaN(Date.parse(val));
        }, { message: "Available from must be a valid date" }),
        availableUntil: zod_1.z.string().optional().refine((val) => {
            if (!val)
                return true;
            return !isNaN(Date.parse(val));
        }, { message: "Available until must be a valid date" }),
    }),
});
// Bundle ID schema
exports.bundleIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid("Invalid bundle ID"),
    }),
});
// Add packages to bundle schema
exports.addPackagesToBundleSchema = zod_1.z.object({
    params: zod_1.z.object({
        bundleId: zod_1.z.string().uuid("Invalid bundle ID"),
    }),
    body: zod_1.z.object({
        packageIds: zod_1.z.array(zod_1.z.string().uuid("Invalid package ID")).min(1, "At least one package ID is required"),
    }),
});
// Remove packages from bundle schema
exports.removePackagesFromBundleSchema = zod_1.z.object({
    params: zod_1.z.object({
        bundleId: zod_1.z.string().uuid("Invalid bundle ID"),
    }),
    body: zod_1.z.object({
        packageIds: zod_1.z.array(zod_1.z.string().uuid("Invalid package ID")).min(1, "At least one package ID is required"),
    }),
});
