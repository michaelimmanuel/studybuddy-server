import { z } from 'zod';

// Quiz schemas
export const createQuizSchema = z.object({
    courseId: z.string().uuid('Invalid course ID format'),
    title: z.string().min(1, 'Quiz title is required').max(200, 'Quiz title too long'),
    timeLimit: z.number().int().min(1, 'Time limit must be at least 1 minute').max(300, 'Time limit cannot exceed 300 minutes'),
    questions: z.array(z.object({
        text: z.string().min(1, 'Question text is required').max(1000, 'Question text too long'),
        answers: z.array(z.object({
            text: z.string().min(1, 'Answer text is required').max(500, 'Answer text too long'),
            isCorrect: z.boolean().optional().default(false)
        })).min(2, 'Each question must have at least 2 answers').max(6, 'Each question cannot have more than 6 answers')
    })).min(1, 'Quiz must have at least 1 question').max(50, 'Quiz cannot have more than 50 questions').optional()
});

export const updateQuizSchema = z.object({
    title: z.string().min(1, 'Quiz title is required').max(200, 'Quiz title too long').optional(),
    timeLimit: z.number().int().min(1, 'Time limit must be at least 1 minute').max(300, 'Time limit cannot exceed 300 minutes').optional()
});

export const updateQuizQuestionsSchema = z.object({
    questions: z.array(z.object({
        text: z.string().min(1, 'Question text is required').max(1000, 'Question text too long'),
        answers: z.array(z.object({
            text: z.string().min(1, 'Answer text is required').max(500, 'Answer text too long'),
            isCorrect: z.boolean().optional().default(false)
        })).min(2, 'Each question must have at least 2 answers').max(6, 'Each question cannot have more than 6 answers')
    })).min(1, 'Quiz must have at least 1 question').max(50, 'Quiz cannot have more than 50 questions')
});

// Question schemas
export const createQuestionSchema = z.object({
    text: z.string().min(1, 'Question text is required').max(1000, 'Question text too long'),
    answers: z.array(z.object({
        text: z.string().min(1, 'Answer text is required').max(500, 'Answer text too long'),
        isCorrect: z.boolean().optional().default(false)
    })).min(2, 'Each question must have at least 2 answers').max(6, 'Each question cannot have more than 6 answers')
});

export const updateQuestionSchema = z.object({
    text: z.string().min(1, 'Question text is required').max(1000, 'Question text too long').optional(),
    answers: z.array(z.object({
        id: z.string().uuid().optional(), // For updating existing answers
        text: z.string().min(1, 'Answer text is required').max(500, 'Answer text too long'),
        isCorrect: z.boolean().optional().default(false)
    })).min(2, 'Each question must have at least 2 answers').max(6, 'Each question cannot have more than 6 answers').optional()
});

// Answer schemas
export const createAnswerSchema = z.object({
    text: z.string().min(1, 'Answer text is required').max(500, 'Answer text too long'),
    isCorrect: z.boolean().optional().default(false)
});

export const updateAnswerSchema = z.object({
    text: z.string().min(1, 'Answer text is required').max(500, 'Answer text too long').optional(),
    isCorrect: z.boolean().optional()
});

// Submission schemas
export const submitQuizSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string().uuid('Invalid question ID format'),
        answerId: z.string().uuid('Invalid answer ID format')
    })).min(1, 'At least one answer is required')
});

// Parameter schemas
export const quizIdParamSchema = z.object({
    id: z.string().uuid('Invalid quiz ID format')
});

export const quizCourseIdParamSchema = z.object({
    courseId: z.string().uuid('Invalid course ID format')
});

export const questionIdParamSchema = z.object({
    id: z.string().uuid('Invalid question ID format'),
    questionId: z.string().uuid('Invalid question ID format')
});

export const answerIdParamSchema = z.object({
    id: z.string().uuid('Invalid quiz ID format'),
    questionId: z.string().uuid('Invalid question ID format'),
    answerId: z.string().uuid('Invalid answer ID format')
});

export const submissionIdParamSchema = z.object({
    id: z.string().uuid('Invalid quiz ID format'),
    submissionId: z.string().uuid('Invalid submission ID format')
});

// Query schemas
export const quizQuerySchema = z.object({
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

// Business rule validations
export const validateQuizTiming = z.object({
    startTime: z.date().optional(),
    endTime: z.date().optional()
}).refine(
    data => !data.startTime || !data.endTime || data.startTime < data.endTime,
    {
        message: 'Start time must be before end time',
        path: ['endTime']
    }
);

export const validateAnswerDistribution = z.object({
    answers: z.array(z.object({
        isCorrect: z.boolean()
    }))
}).refine(
    data => data.answers.some(answer => answer.isCorrect),
    {
        message: 'At least one answer must be marked as correct',
        path: ['answers']
    }
).refine(
    data => data.answers.filter(answer => answer.isCorrect).length <= Math.ceil(data.answers.length / 2),
    {
        message: 'Too many correct answers for a single question',
        path: ['answers']
    }
);

// Export validation middleware helpers
export const validateCreateQuiz = z.object({
    body: createQuizSchema
});

export const validateUpdateQuiz = z.object({
    params: quizIdParamSchema,
    body: updateQuizSchema
});

export const validateUpdateQuizQuestions = z.object({
    params: quizIdParamSchema,
    body: updateQuizQuestionsSchema
});

export const validateSubmitQuiz = z.object({
    params: quizIdParamSchema,
    body: submitQuizSchema
});

export const validateGetCourseQuizzes = z.object({
    params: quizCourseIdParamSchema,
    query: quizQuerySchema
});

export const validateGetQuizSubmissions = z.object({
    params: quizIdParamSchema,
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional()
    }).optional()
});