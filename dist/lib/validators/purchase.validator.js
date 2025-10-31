"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPackageAccessSchema = exports.purchaseBundleSchema = exports.purchasePackageSchema = void 0;
const zod_1 = require("zod");
exports.purchasePackageSchema = zod_1.z.object({
    body: zod_1.z.object({
        packageId: zod_1.z.string().uuid('Invalid package ID'),
    }),
});
exports.purchaseBundleSchema = zod_1.z.object({
    body: zod_1.z.object({
        bundleId: zod_1.z.string().uuid('Invalid bundle ID'),
    }),
});
exports.checkPackageAccessSchema = zod_1.z.object({
    params: zod_1.z.object({
        packageId: zod_1.z.string().uuid('Invalid package ID'),
    }),
});
