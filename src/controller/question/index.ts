import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { getValidatedBody, getValidatedParams, getValidatedQuery } from '../../lib/validators/validation.middleware';

// Get all questions for a course
export const getCourseQuestions = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = getValidatedParams(req);
        const { page = 1, limit = 10, search } = getValidatedQuery(req);
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';

        // Check if course exists
        const course = await prisma.course.findUnique({
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
                    mode: 'insensitive' as const
                }
            })
        };

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
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
            prisma.question.count({ where })
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
    } catch (error) {
        console.error('Error fetching course questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a specific question by ID
export const getQuestionById = async (req: Request, res: Response) => {
    try {
        const { id } = getValidatedParams(req);
        const userId = req.user?.id;
        const isAdmin = req.user?.role === 'admin';

        const question = await prisma.question.findUnique({
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
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new question for a course (Admin only)
export const createQuestion = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = getValidatedParams(req);
    const { text, explanation, imageUrl, explanationImageUrl, answers } = getValidatedBody(req);

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Validate at least one correct answer
        const hasCorrectAnswer = answers.some((answer: any) => answer.isCorrect);
        if (!hasCorrectAnswer) {
            return res.status(400).json({ 
                message: 'At least one answer must be marked as correct' 
            });
        }

        // Create question with answers in a transaction
        const question = await prisma.$transaction(async (tx) => {
            const newQuestion = await tx.question.create({
                data: {
                    courseId,
                    text,
                    explanation: explanation || null,
                    imageUrl: imageUrl || null,
                    explanationImageUrl: explanationImageUrl || null
                }
            });

            await tx.answer.createMany({
                data: answers.map((answer: any) => ({
                    questionId: newQuestion.id,
                    text: answer.text,
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
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a question (Admin only)
export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = getValidatedParams(req);
    const { text, explanation, imageUrl, explanationImageUrl, answers } = getValidatedBody(req);

        // Check if question exists
        const existingQuestion = await prisma.question.findUnique({
            where: { id },
            include: { answers: true }
        });

        if (!existingQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Validate at least one correct answer
        const hasCorrectAnswer = answers.some((answer: any) => answer.isCorrect);
        if (!hasCorrectAnswer) {
            return res.status(400).json({ 
                message: 'At least one answer must be marked as correct' 
            });
        }

        // Update question with answers in a transaction
        const question = await prisma.$transaction(async (tx) => {
            // Update question text and explanation
            await tx.question.update({
                where: { id },
                data: { 
                    text,
                    explanation: explanation || null,
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
                data: answers.map((answer: any) => ({
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
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a question (Admin only)
export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = getValidatedParams(req);

        // Check if question exists
        const question = await prisma.question.findUnique({
            where: { id }
        });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Delete question (answers will be deleted automatically due to cascade)
        await prisma.question.delete({
            where: { id }
        });

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get question statistics for a course (Admin only)
export const getCourseQuestionStats = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = getValidatedParams(req);

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const totalQuestions = await prisma.question.count({
            where: { courseId }
        });

        const totalAnswers = await prisma.answer.count({
            where: {
                question: { courseId }
            }
        });

        const questionsWithAnswerCounts = await prisma.question.findMany({
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
    } catch (error) {
        console.error('Error fetching question stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export all controller functions
export const questionController = {
    getCourseQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getCourseQuestionStats,
};