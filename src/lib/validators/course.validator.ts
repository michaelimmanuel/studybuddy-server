import { z } from 'zod';
import { 
    titleSchema, 
    optionalTitleSchema, 
    descriptionSchema,
    uuidSchema,
    paginatedSearchSchema,
    idParamSchema
} from './common.validator';

// Course validation schemas
export const createCourseSchema = z.object({
    title: titleSchema,
    description: descriptionSchema,
});

export const updateCourseSchema = z.object({
    title: optionalTitleSchema,
    description: descriptionSchema,
}).refine(
    (data) => data.title !== undefined || data.description !== undefined,
    { message: 'At least one field (title or description) must be provided for update' }
);

// Parameter validation schemas
export const courseIdParamSchema = idParamSchema;

// Query validation schemas
export const coursesQuerySchema = paginatedSearchSchema;

// Course response schemas (for documentation/type checking)
export const courseResponseSchema = z.object({
    id: uuidSchema,
    title: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

// Validation helper functions
export const validateCourseCreate = (data: unknown) => {
    return createCourseSchema.parse(data);
};

export const validateCourseUpdate = (data: unknown) => {
    return updateCourseSchema.parse(data);
};

export const validateCoursesQuery = (query: unknown) => {
    return coursesQuerySchema.parse(query);
};

// Type exports for TypeScript
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CoursesQuery = z.infer<typeof coursesQuerySchema>;
export type CourseResponse = z.infer<typeof courseResponseSchema>;