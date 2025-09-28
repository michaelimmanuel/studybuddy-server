import { z } from 'zod';
import { 
    titleSchema, 
    optionalTitleSchema, 
    descriptionSchema,
    uuidSchema,
    paginatedSearchSchema,
    idParamSchema,
    createEnumSchema
} from './common.validator';

// Enrollment status enum for better type safety
export const EnrollmentStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED', 
    REJECTED: 'REJECTED'
} as const;

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

// Enrollment validation schemas
export const updateEnrollmentSchema = z.object({
    status: createEnumSchema(
        EnrollmentStatus, 
        'Status must be PENDING, APPROVED, or REJECTED'
    )
});

// Parameter validation schemas
export const courseIdParamSchema = idParamSchema;
export const enrollmentIdParamSchema = z.object({
    enrollmentId: uuidSchema
});
export const courseUserIdParamSchema = z.object({
    userId: uuidSchema
});

// Query validation schemas
export const coursesQuerySchema = paginatedSearchSchema;

// Course response schemas (for documentation/type checking)
export const courseResponseSchema = z.object({
    id: uuidSchema,
    title: z.string(),
    description: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    enrollmentCount: z.number().min(0),
});

export const enrollmentResponseSchema = z.object({
    id: uuidSchema,
    status: createEnumSchema(EnrollmentStatus),
    enrolledAt: z.string().datetime(),
    user: z.object({
        id: uuidSchema,
        name: z.string(),
        email: z.string().email(),
        image: z.string().nullable()
    }),
    course: z.object({
        id: uuidSchema,
        title: z.string(),
        description: z.string().nullable()
    }).optional()
});

// Validation helper functions
export const validateCourseCreate = (data: unknown) => {
    return createCourseSchema.parse(data);
};

export const validateCourseUpdate = (data: unknown) => {
    return updateCourseSchema.parse(data);
};

export const validateEnrollmentUpdate = (data: unknown) => {
    return updateEnrollmentSchema.parse(data);
};

export const validateCoursesQuery = (query: unknown) => {
    return coursesQuerySchema.parse(query);
};

// Type exports for TypeScript
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type CoursesQuery = z.infer<typeof coursesQuerySchema>;
export type CourseResponse = z.infer<typeof courseResponseSchema>;
export type EnrollmentResponse = z.infer<typeof enrollmentResponseSchema>;