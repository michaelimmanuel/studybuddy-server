import { z } from 'zod';

// Answer schema
export const answerSchema = z.object({
    text: z.string()
        .min(1, 'Answer text is required')
        .max(500, 'Answer text must be less than 500 characters'),
    isCorrect: z.boolean().optional().default(false)
});

// Create question schema
export const createQuestionSchema = z.object({
    text: z.string()
        .min(1, 'Question text is required')
        .max(1000, 'Question text must be less than 1000 characters'),
    explanation: z.string()
        .max(1000, 'Question explanation must be less than 1000 characters')
        .optional(),
    imageUrl: z.string()
        .url('Image must be a valid URL starting with http or https')
        .optional(),
    answers: z.array(answerSchema)
        .min(2, 'Question must have at least 2 answers')
        .max(6, 'Question can have at most 6 answers')
        .refine(
            (answers) => answers.some(answer => answer.isCorrect),
            'At least one answer must be marked as correct'
        )
});

// Update question schema (same as create)
export const updateQuestionSchema = createQuestionSchema;

// Question query parameters
export const questionQuerySchema = z.object({
    page: z.string()
        .regex(/^\d+$/, 'Page must be a positive number')
        .transform(Number)
        .refine((val: number) => val > 0, 'Page must be greater than 0')
        .optional(),
    limit: z.string()
        .regex(/^\d+$/, 'Limit must be a positive number')
        .transform(Number)
        .refine((val: number) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .optional(),
    search: z.string().max(100, 'Search term too long').optional()
});

// Course ID parameter for questions
export const questionCourseIdParamSchema = z.object({
    id: z.string().uuid('Invalid course ID format')
});

// Question ID parameter
export const questionIdParamSchema = z.object({
    id: z.string().uuid('Invalid question ID format')
});

// Type exports
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type QuestionQuery = z.infer<typeof questionQuerySchema>;
export type CourseIdParam = z.infer<typeof questionCourseIdParamSchema>;
export type QuestionIdParam = z.infer<typeof questionIdParamSchema>;