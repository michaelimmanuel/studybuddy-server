"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionController = exports.getCourseQuestionStats = exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.getQuestionById = exports.getCourseQuestions = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const validation_middleware_1 = require("../../lib/validators/validation.middleware");
const sanitize_1 = require("../../lib/sanitize");
// Get all questions for a course
const getCourseQuestions = async (req, res) => {
    try {
        const { id: courseId } = (0, validation_middleware_1.getValidatedParams)(req);
        const { page = 1, limit = 10, search } = (0, validation_middleware_1.getValidatedQuery)(req);
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        // Check if course exists
        const course = await prisma_1.default.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Questions are now accessible to all authenticated users
        // No enrollment check needed since enrollment system was removed
        const skip = (page - 1) * limit;
        const where = {
            courseId,
            ...(search && {
                text: {
                    contains: search,
                    mode: 'insensitive'
                }
            })
        };
        const [questions, total] = await Promise.all([
            prisma_1.default.question.findMany({
                where,
                include: {
                    answers: {
                        select: {
                            id: true,
                            text: true,
                            // Only include isCorrect for admins
                            isCorrect: isAdmin
                        }
                    },
                    course: {
                        select: { id: true, title: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.default.question.count({ where })
        ]);
        // Filter explanation field based on user role
        const filteredQuestions = questions.map(question => {
            const { explanation, ...questionData } = question;
            return {
                ...questionData,
                ...(isAdmin && { explanation })
            };
        });
        const totalPages = Math.ceil(total / limit);
        res.json({
            course: {
                id: course.id,
                title: course.title
            },
            questions: filteredQuestions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    }
    catch (error) {
        console.error('Error fetching course questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCourseQuestions = getCourseQuestions;
// Get a specific question by ID
const getQuestionById = async (req, res) => {
    try {
        const { id } = (0, validation_middleware_1.getValidatedParams)(req);
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';
        const question = await prisma_1.default.question.findUnique({
            where: { id },
            include: {
                answers: {
                    select: {
                        id: true,
                        text: true,
                        // Only include isCorrect for admins
                        isCorrect: isAdmin
                    }
                },
                course: {
                    select: { id: true, title: true }
                }
            }
        });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // Questions are now accessible to all authenticated users
        // No enrollment check needed since enrollment system was removed
        // Filter explanation field based on user role
        const { explanation, ...questionData } = question;
        const filteredQuestion = {
            ...questionData,
            ...(isAdmin && { explanation })
        };
        res.json({ question: filteredQuestion });
    }
    catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getQuestionById = getQuestionById;
// Create a new question for a course (Admin only)
const createQuestion = async (req, res) => {
    try {
        const { id: courseId } = (0, validation_middleware_1.getValidatedParams)(req);
        const { text, explanation, imageUrl, explanationImageUrl, answers } = (0, validation_middleware_1.getValidatedBody)(req);
        // Check if course exists
        const course = await prisma_1.default.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Validate at least one correct answer
        const hasCorrectAnswer = answers.some((answer) => answer.isCorrect);
        if (!hasCorrectAnswer) {
            return res.status(400).json({
                message: 'At least one answer must be marked as correct'
            });
        }
        // Create question with answers in a transaction
        const question = await prisma_1.default.$transaction(async (tx) => {
            const newQuestion = await tx.question.create({
                data: {
                    courseId,
                    text: (0, sanitize_1.sanitizeRichText)(text) ?? '',
                    explanation: (0, sanitize_1.sanitizeRichText)(explanation),
                    imageUrl: imageUrl || null,
                    explanationImageUrl: explanationImageUrl || null
                }
            });
            await tx.answer.createMany({
                data: answers.map((answer) => ({
                    questionId: newQuestion.id,
                    text: (0, sanitize_1.sanitizeRichText)(answer.text) ?? '',
                    isCorrect: answer.isCorrect || false
                }))
            });
            return tx.question.findUnique({
                where: { id: newQuestion.id },
                include: {
                    answers: true,
                    course: {
                        select: { id: true, title: true }
                    }
                }
            });
        });
        res.status(201).json({
            message: 'Question created successfully',
            question
        });
    }
    catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createQuestion = createQuestion;
// Update a question (Admin only)
const updateQuestion = async (req, res) => {
    try {
        const { id } = (0, validation_middleware_1.getValidatedParams)(req);
        const { text, explanation, imageUrl, explanationImageUrl, answers } = (0, validation_middleware_1.getValidatedBody)(req);
        // Check if question exists
        const existingQuestion = await prisma_1.default.question.findUnique({
            where: { id },
            include: { answers: true }
        });
        if (!existingQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // Validate at least one correct answer
        const hasCorrectAnswer = answers.some((answer) => answer.isCorrect);
        if (!hasCorrectAnswer) {
            return res.status(400).json({
                message: 'At least one answer must be marked as correct'
            });
        }
        // Update question with answers in a transaction
        const question = await prisma_1.default.$transaction(async (tx) => {
            // Update question text and explanation
            await tx.question.update({
                where: { id },
                data: {
                    text: (0, sanitize_1.sanitizeRichText)(text) ?? '',
                    explanation: (0, sanitize_1.sanitizeRichText)(explanation),
                    imageUrl: imageUrl || null,
                    explanationImageUrl: explanationImageUrl || null
                }
            });
            // Delete existing answers
            await tx.answer.deleteMany({
                where: { questionId: id }
            });
            // Create new answers
            await tx.answer.createMany({
                data: answers.map((answer) => ({
                    questionId: id,
                    text: answer.text,
                    isCorrect: answer.isCorrect || false
                }))
            });
            return tx.question.findUnique({
                where: { id },
                include: {
                    answers: true,
                    course: {
                        select: { id: true, title: true }
                    }
                }
            });
        });
        res.json({
            message: 'Question updated successfully',
            question
        });
    }
    catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateQuestion = updateQuestion;
// Delete a question (Admin only)
const deleteQuestion = async (req, res) => {
    try {
        const { id } = (0, validation_middleware_1.getValidatedParams)(req);
        // Check if question exists
        const question = await prisma_1.default.question.findUnique({
            where: { id }
        });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // Delete question (answers will be deleted automatically due to cascade)
        await prisma_1.default.question.delete({
            where: { id }
        });
        res.json({ message: 'Question deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteQuestion = deleteQuestion;
// Get question statistics for a course (Admin only)
const getCourseQuestionStats = async (req, res) => {
    try {
        const { id: courseId } = (0, validation_middleware_1.getValidatedParams)(req);
        // Check if course exists
        const course = await prisma_1.default.course.findUnique({
            where: { id: courseId }
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const totalQuestions = await prisma_1.default.question.count({
            where: { courseId }
        });
        const totalAnswers = await prisma_1.default.answer.count({
            where: {
                question: { courseId }
            }
        });
        const questionsWithAnswerCounts = await prisma_1.default.question.findMany({
            where: { courseId },
            include: {
                _count: {
                    select: { answers: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Show last 10 questions
        });
        const averageAnswersPerQuestion = totalQuestions > 0
            ? totalAnswers / totalQuestions
            : 0;
        res.json({
            courseId,
            courseTitle: course.title,
            stats: {
                totalQuestions,
                totalAnswers,
                averageAnswersPerQuestion: Math.round(averageAnswersPerQuestion * 100) / 100
            },
            recentQuestions: questionsWithAnswerCounts.map(q => ({
                questionId: q.id,
                text: q.text.substring(0, 100) + (q.text.length > 100 ? '...' : ''),
                answerCount: q._count.answers,
                createdAt: q.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Error fetching question stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCourseQuestionStats = getCourseQuestionStats;
// Export all controller functions
exports.questionController = {
    getCourseQuestions: exports.getCourseQuestions,
    getQuestionById: exports.getQuestionById,
    createQuestion: exports.createQuestion,
    updateQuestion: exports.updateQuestion,
    deleteQuestion: exports.deleteQuestion,
    getCourseQuestionStats: exports.getCourseQuestionStats,
};
