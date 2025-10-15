import { z } from "zod";

// Create bundle schema
export const createBundleSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().optional(),
    price: z.union([z.number(), z.string()]).refine(
      (val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
      },
      { message: "Price must be a valid positive number" }
    ),
    discount: z.union([z.number(), z.string()]).optional().refine(
      (val) => {
        if (val === undefined || val === null || val === '') return true;
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      { message: "Discount must be a valid number between 0 and 100" }
    ),
    availableFrom: z.string().optional().refine(
      (val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      },
      { message: "Available from must be a valid date" }
    ),
    availableUntil: z.string().optional().refine(
      (val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      },
      { message: "Available until must be a valid date" }
    ),
  }),
});

// Update bundle schema
export const updateBundleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid bundle ID"),
  }),
  body: z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
    description: z.string().optional(),
    price: z.union([z.number(), z.string()]).optional().refine(
      (val) => {
        if (val === undefined || val === null || val === '') return true;
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
      },
      { message: "Price must be a valid positive number" }
    ),
    discount: z.union([z.number(), z.string()]).optional().refine(
      (val) => {
        if (val === undefined || val === null || val === '') return true;
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      { message: "Discount must be a valid number between 0 and 100" }
    ),
    isActive: z.boolean().optional(),
    availableFrom: z.string().optional().refine(
      (val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      },
      { message: "Available from must be a valid date" }
    ),
    availableUntil: z.string().optional().refine(
      (val) => {
        if (!val) return true;
        return !isNaN(Date.parse(val));
      },
      { message: "Available until must be a valid date" }
    ),
  }),
});

// Bundle ID schema
export const bundleIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid bundle ID"),
  }),
});

// Add packages to bundle schema
export const addPackagesToBundleSchema = z.object({
  params: z.object({
    bundleId: z.string().uuid("Invalid bundle ID"),
  }),
  body: z.object({
    packageIds: z.array(z.string().uuid("Invalid package ID")).min(1, "At least one package ID is required"),
  }),
});

// Remove packages from bundle schema
export const removePackagesFromBundleSchema = z.object({
  params: z.object({
    bundleId: z.string().uuid("Invalid bundle ID"),
  }),
  body: z.object({
    packageIds: z.array(z.string().uuid("Invalid package ID")).min(1, "At least one package ID is required"),
  }),
});