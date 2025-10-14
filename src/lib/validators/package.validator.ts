import { z } from "zod";

export const createPackageSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be less than 200 characters"),
    description: z.preprocess(
      (v) => (v === "" || v === null ? undefined : typeof v === "string" ? v.trim() : v),
      z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional()
    ),
    price: z
      .union([z.string(), z.number()])
      .refine((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
      }, "Price must be a valid positive number (in IDR)"),
    timeLimit: z
      .union([z.string(), z.number()])
      .refine((val) => {
        if (val === null || val === undefined || val === "") return true;
        const num = typeof val === "string" ? parseInt(val, 10) : val;
        return Number.isInteger(num) && num > 0 && num <= 10080; // Max 1 week (10080 minutes)
      }, "Time limit must be a positive integer (in minutes, max 10080)")
      .optional()
      .nullable(),
    availableFrom: z
      .union([
        z
          .string()
          .refine((v) => v === "" || !isNaN(new Date(v).getTime()), "Available from must be a valid datetime"),
        z.date(),
        z.literal(""),
        z.null(),
      ])
      .optional(),
    availableUntil: z
      .union([
        z
          .string()
          .refine((v) => v === "" || !isNaN(new Date(v).getTime()), "Available until must be a valid datetime"),
        z.date(),
        z.literal(""),
        z.null(),
      ])
      .optional(),
  }).refine((data) => {
    // If both dates are provided, availableFrom should be before availableUntil
    const hasFrom = data.availableFrom !== undefined && data.availableFrom !== null && data.availableFrom !== "";
    const hasUntil = data.availableUntil !== undefined && data.availableUntil !== null && data.availableUntil !== "";
    if (hasFrom && hasUntil) {
      const from = data.availableFrom instanceof Date ? data.availableFrom : new Date(data.availableFrom as string);
      const until = data.availableUntil instanceof Date ? data.availableUntil : new Date(data.availableUntil as string);
      return from < until;
    }
    return true;
  }, {
    message: "Available from date must be before available until date",
    path: ["availableUntil"]
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
    description: z.preprocess(
      (v) => (v === "" || v === null ? undefined : typeof v === "string" ? v.trim() : v),
      z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional()
    ),
    price: z
      .union([z.string(), z.number()])
      .refine((val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
      }, "Price must be a valid positive number (in IDR)")
      .optional(),
    isActive: z.boolean().optional(),
    timeLimit: z
      .union([z.string(), z.number()])
      .refine((val) => {
        if (val === null || val === undefined || val === "") return true;
        const num = typeof val === "string" ? parseInt(val, 10) : val;
        return Number.isInteger(num) && num > 0 && num <= 10080; // Max 1 week (10080 minutes)
      }, "Time limit must be a positive integer (in minutes, max 10080)")
      .optional()
      .nullable(),
    availableFrom: z
      .union([
        z
          .string()
          .refine((v) => v === "" || !isNaN(new Date(v).getTime()), "Available from must be a valid datetime"),
        z.date(),
        z.literal(""),
        z.null(),
      ])
      .optional(),
    availableUntil: z
      .union([
        z
          .string()
          .refine((v) => v === "" || !isNaN(new Date(v).getTime()), "Available until must be a valid datetime"),
        z.date(),
        z.literal(""),
        z.null(),
      ])
      .optional(),
  }).refine((data) => {
    // If both dates are provided, availableFrom should be before availableUntil
    const hasFrom = data.availableFrom !== undefined && data.availableFrom !== null && data.availableFrom !== "";
    const hasUntil = data.availableUntil !== undefined && data.availableUntil !== null && data.availableUntil !== "";
    if (hasFrom && hasUntil) {
      const from = data.availableFrom instanceof Date ? data.availableFrom : new Date(data.availableFrom as string);
      const until = data.availableUntil instanceof Date ? data.availableUntil : new Date(data.availableUntil as string);
      return from < until;
    }
    return true;
  }, {
    message: "Available from date must be before available until date",
    path: ["availableUntil"]
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

// Add random questions from a specific course to a package
export const addRandomQuestionsFromCourseSchema = z.object({
  params: z.object({
    packageId: z.string().uuid("Package ID must be a valid UUID"),
  }),
  body: z.object({
    courseId: z.string().uuid("Course ID must be a valid UUID"),
    count: z
      .union([z.string(), z.number()])
      .refine((val) => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        return Number.isInteger(num) && num >= 1 && num <= 200;
      }, "count must be an integer between 1 and 200"),
  }),
});