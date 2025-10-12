import { z } from "zod";

export const createPackageSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    price: z
      .union([z.string(), z.number()])
      .refine((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
      }, "Price must be a valid positive number (in IDR)"),
  }),
});

export const addQuestionsToPackageSchema = z.object({
  body: z.object({
    questionIds: z
      .array(z.string().uuid("Each question ID must be a valid UUID"))
      .min(1, "At least one question ID is required")
      .max(100, "Maximum 100 questions can be added at once"),
  }),
  params: z.object({
    packageId: z.string().uuid("Package ID must be a valid UUID"),
  }),
});

export const updatePackageSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title cannot be empty")
      .max(200, "Title must be less than 200 characters")
      .optional(),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    price: z
      .union([z.string(), z.number()])
      .refine((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
      }, "Price must be a valid positive number (in IDR)")
      .optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid("Package ID must be a valid UUID"),
  }),
});

export const packageIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Package ID must be a valid UUID"),
  }),
});

export const removeQuestionsFromPackageSchema = z.object({
  body: z.object({
    questionIds: z
      .array(z.string().uuid("Each question ID must be a valid UUID"))
      .min(1, "At least one question ID is required"),
  }),
  params: z.object({
    packageId: z.string().uuid("Package ID must be a valid UUID"),
  }),
});