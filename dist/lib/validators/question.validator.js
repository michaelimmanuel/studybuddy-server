"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionIdParamSchema = exports.questionCourseIdParamSchema = exports.questionQuerySchema = exports.updateQuestionSchema = exports.createQuestionSchema = exports.answerSchema = void 0;
const zod_1 = require("zod");
// Answer schema
exports.answerSchema = zod_1.z.object({
    text: zod_1.z.string()
        .min(1, 'Answer text is required')
        .max(500, 'Answer text must be less than 500 characters'),
    isCorrect: zod_1.z.boolean().optional().default(false)
});
// Create question schema
exports.createQuestionSchema = zod_1.z.object({
    text: zod_1.z.string()
        .min(1, 'Question text is required')
        .max(1000, 'Question text must be less than 1000 characters'),
    explanation: zod_1.z.string()
        .max(1000, 'Question explanation must be less than 1000 characters')
        .optional(),
    answers: zod_1.z.array(exports.answerSchema)
        .min(2, 'Question must have at least 2 answers')
        .max(6, 'Question can have at most 6 answers')
        .refine((answers) => answers.some(answer => answer.isCorrect), 'At least one answer must be marked as correct')
});
// Update question schema (same as create)
exports.updateQuestionSchema = exports.createQuestionSchema;
// Question query parameters
exports.questionQuerySchema = zod_1.z.object({
    page: zod_1.z.string()
        .regex(/^\d+$/, 'Page must be a positive number')
        .transform(Number)
        .refine((val) => val > 0, 'Page must be greater than 0')
        .optional(),
    limit: zod_1.z.string()
        .regex(/^\d+$/, 'Limit must be a positive number')
        .transform(Number)
        .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .optional(),
    search: zod_1.z.string().max(100, 'Search term too long').optional()
});
// Course ID parameter for questions
exports.questionCourseIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid course ID format')
});
// Question ID parameter
exports.questionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid question ID format')
});
