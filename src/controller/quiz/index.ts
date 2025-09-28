import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { getValidatedBody, getValidatedQuery, getValidatedParams } from '../../lib/validators/validation.middleware';

// Get all quizzes for a course
export const getCourseQuizzes = async (req: Request, res: Response) => {
    try {
        const { courseId } = getValidatedParams(req);
        const userId = req.user?.id;
        const isAdmin = req.user?.role;

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user has access to this course
        if (!isAdmin) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: userId!,
                        courseId
                    }
                }
            });

            if (!enrollment || enrollment.status !== 'APPROVED') {
                return res.status(403).json({ message: 'Access denied. You must be enrolled in this course.' });
            }
        }

        const quizzes = await prisma.quiz.findMany({
            where: { courseId },
            include: {
                _count: {
                    select: {
                        questions: true,
                        submissions: true
                    }
                },
                submissions: userId ? {
                    where: { userId },
                    select: {
                        id: true,
                        score: true,
                        submittedAt: true
                    }
                } : false
            },
            orderBy: { createdAt: 'desc' }
        });

        const quizzesWithStats = quizzes.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            timeLimit: quiz.timeLimit,
            createdAt: quiz.createdAt,
            questionCount: quiz._count.questions,
            submissionCount: quiz._count.submissions,
            userSubmission: userId && quiz.submissions ? quiz.submissions[0] || null : null
        }));

        res.json({
            course: {
                id: course.id,
                title: course.title
            },
            quizzes: quizzesWithStats
        });
    } catch (error) {
        console.error('Error fetching course quizzes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get quiz by ID with questions and answers
export const getQuizById = async (req: Request, res: Response) => {
    try {
        const { id } = getValidatedParams(req);
        const userId = req.user?.id;
        const isAdmin = req.user?.role;

        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                questions: {
                    include: {
                        answers: {
                            select: {
                                id: true,
                                text: true,
                                // Only include isCorrect for admins or after submission
                                isCorrect: isAdmin === 'admin'
                            }
                        }
                    },
                    orderBy: { id: 'asc' }
                },
                submissions: userId ? {
                    where: { userId },
                    include: {
                        answers: {
                            include: {
                                answer: true,
                                question: true
                            }
                        }
                    }
                } : false
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check access permissions
        if (!isAdmin) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: userId!,
                        courseId: quiz.course.id
                    }
                }
            });

            if (!enrollment || enrollment.status !== 'APPROVED') {
                return res.status(403).json({ message: 'Access denied. You must be enrolled in this course.' });
            }
        }

        // Check if user has already submitted
        const userSubmission = userId && quiz.submissions && quiz.submissions.length > 0
            ? quiz.submissions[0] as (typeof quiz.submissions[0] & { answers?: any[] })
            : null;

        // If user has submitted, show correct answers
        const questionsWithAnswers = quiz.questions.map(question => ({
            id: question.id,
            text: question.text,
            answers: question.answers.map(answer => ({
                id: answer.id,
                text: answer.text,
                isCorrect: (isAdmin || userSubmission) ? answer.isCorrect : undefined
            }))
        }));

        res.json({
            quiz: {
                id: quiz.id,
                title: quiz.title,
                timeLimit: quiz.timeLimit,
                createdAt: quiz.createdAt,
                course: quiz.course,
                questions: questionsWithAnswers,
                userSubmission: userSubmission ? {
                    id: userSubmission.id,
                    score: userSubmission.score,
                    submittedAt: userSubmission.submittedAt,
                    answers: userSubmission.answers
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create new quiz (admin only)
export const createQuiz = async (req: Request, res: Response) => {
    try {
        const { courseId, title, timeLimit, questions } = getValidatedBody(req);

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Create quiz with questions and answers in a transaction
        const quiz = await prisma.$transaction(async (tx) => {
            // Create quiz
            const newQuiz = await tx.quiz.create({
                data: {
                    courseId,
                    title,
                    timeLimit
                }
            });

            // Create questions and answers
            if (questions && questions.length > 0) {
                for (const questionData of questions) {
                    const question = await tx.question.create({
                        data: {
                            quizId: newQuiz.id,
                            text: questionData.text
                        }
                    });

                    if (questionData.answers && questionData.answers.length > 0) {
                        await tx.answer.createMany({
                            data: questionData.answers.map((answer: any) => ({
                                questionId: question.id,
                                text: answer.text,
                                isCorrect: answer.isCorrect || false
                            }))
                        });
                    }
                }
            }

            return newQuiz;
        });

        // Fetch the complete quiz with questions and answers
        const completeQuiz = await prisma.quiz.findUnique({
            where: { id: quiz.id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                questions: {
                    include: {
                        answers: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: completeQuiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update quiz (admin only)
export const updateQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = getValidatedParams(req);
        const { title, timeLimit } = getValidatedBody(req);

        const existingQuiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });

        if (!existingQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Prevent editing if there are submissions
        if (existingQuiz._count.submissions > 0) {
            return res.status(400).json({ 
                message: 'Cannot edit quiz with existing submissions',
                submissionCount: existingQuiz._count.submissions
            });
        }

        const updatedQuiz = await prisma.quiz.update({
            where: { id },
            data: {
                title: title || existingQuiz.title,
                timeLimit: timeLimit || existingQuiz.timeLimit
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                questions: {
                    include: {
                        answers: true
                    }
                }
            }
        });

        res.json({
            message: 'Quiz updated successfully',
            quiz: updatedQuiz
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete quiz (admin only)
export const deleteQuiz = async (req: Request, res: Response) => {
    try {
        const { id } = getValidatedParams(req);

        const existingQuiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });

        if (!existingQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Prevent deletion if there are submissions
        if (existingQuiz._count.submissions > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete quiz with existing submissions',
                submissionCount: existingQuiz._count.submissions
            });
        }

        await prisma.quiz.delete({
            where: { id }
        });

        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Submit quiz answers
export const submitQuiz = async (req: Request, res: Response) => {
    try {
        const { id: quizId } = getValidatedParams(req);
        const { answers } = getValidatedBody(req);
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if quiz exists
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: {
                        answers: true
                    }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check if user is enrolled in the course
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: quiz.courseId
                }
            }
        });

        if (!enrollment || enrollment.status !== 'APPROVED') {
            return res.status(403).json({ message: 'You must be enrolled in this course to take the quiz' });
        }

        // Check if user has already submitted
        const existingSubmission = await prisma.submission.findUnique({
            where: {
                userId_quizId: {
                    userId,
                    quizId
                }
            }
        });

        if (existingSubmission) {
            return res.status(409).json({ message: 'Quiz already submitted' });
        }

        // Validate answers format
        if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
            return res.status(400).json({ message: 'Invalid answers format' });
        }

        // Calculate score
        let correctAnswers = 0;
        const submissionAnswers: { questionId: string; answerId: string }[] = [];

        for (const answer of answers) {
            const question = quiz.questions.find(q => q.id === answer.questionId);
            if (!question) {
                return res.status(400).json({ message: `Invalid question ID: ${answer.questionId}` });
            }

            const selectedAnswer = question.answers.find(a => a.id === answer.answerId);
            if (!selectedAnswer) {
                return res.status(400).json({ message: `Invalid answer ID: ${answer.answerId}` });
            }

            if (selectedAnswer.isCorrect) {
                correctAnswers++;
            }

            submissionAnswers.push({
                questionId: String(answer.questionId),
                answerId: String(answer.answerId)
            });
        }

        const score = Math.round((correctAnswers / quiz.questions.length) * 100);

        // Create submission with answers in a transaction
        const submission = await prisma.$transaction(async (tx) => {
            const newSubmission = await tx.submission.create({
                data: {
                    userId,
                    quizId,
                    score
                }
            });

            await tx.submissionAnswer.createMany({
                data: submissionAnswers.map(sa => ({
                    submissionId: newSubmission.id,
                    questionId: sa.questionId,
                    answerId: sa.answerId
                }))
            });

            return newSubmission;
        });

        res.status(201).json({
            message: 'Quiz submitted successfully',
            submission: {
                id: submission.id,
                score: submission.score,
                submittedAt: submission.submittedAt,
                correctAnswers,
                totalQuestions: quiz.questions.length
            }
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get quiz submissions (admin only)
export const getQuizSubmissions = async (req: Request, res: Response) => {
    try {
        const { id: quizId } = getValidatedParams(req);

        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            select: {
                id: true,
                title: true,
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const submissions = await prisma.submission.findMany({
            where: { quizId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        res.json({
            quiz,
            submissions: submissions.map(submission => ({
                id: submission.id,
                score: submission.score,
                submittedAt: submission.submittedAt,
                user: submission.user
            })),
            stats: {
                totalSubmissions: submissions.length,
                averageScore: submissions.length > 0 
                    ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length)
                    : 0,
                highestScore: submissions.length > 0 
                    ? Math.max(...submissions.map(s => s.score))
                    : 0,
                lowestScore: submissions.length > 0 
                    ? Math.min(...submissions.map(s => s.score))
                    : 0
            }
        });
    } catch (error) {
        console.error('Error fetching quiz submissions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update quiz questions and answers (admin only)
export const updateQuizQuestions = async (req: Request, res: Response) => {
    try {
        const { id: quizId } = getValidatedParams(req);
        const { questions } = getValidatedBody(req);

        // Check if quiz exists
        const existingQuiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: {
                    include: {
                        answers: true
                    }
                },
                _count: {
                    select: { submissions: true }
                }
            }
        });

        if (!existingQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Prevent editing if there are submissions
        if (existingQuiz._count.submissions > 0) {
            return res.status(400).json({ 
                message: 'Cannot edit quiz questions with existing submissions',
                submissionCount: existingQuiz._count.submissions
            });
        }

        // Update questions and answers in a transaction
        const updatedQuiz = await prisma.$transaction(async (tx) => {
            // Delete existing questions and answers (cascade will handle answers)
            await tx.question.deleteMany({
                where: { quizId }
            });

            // Create new questions and answers
            for (const questionData of questions) {
                const question = await tx.question.create({
                    data: {
                        quizId,
                        text: questionData.text
                    }
                });

                if (questionData.answers && questionData.answers.length > 0) {
                    await tx.answer.createMany({
                        data: questionData.answers.map((answer: any) => ({
                            questionId: question.id,
                            text: answer.text,
                            isCorrect: answer.isCorrect || false
                        }))
                    });
                }
            }

            // Return updated quiz with questions and answers
            return await tx.quiz.findUnique({
                where: { id: quizId },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true
                        }
                    },
                    questions: {
                        include: {
                            answers: true
                        },
                        orderBy: { id: 'asc' }
                    }
                }
            });
        });

        res.json({
            message: 'Quiz questions updated successfully',
            quiz: updatedQuiz
        });
    } catch (error) {
        console.error('Error updating quiz questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export all controller functions
export const quizController = {
    getCourseQuizzes,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuiz,
    getQuizSubmissions,
    updateQuizQuestions,
};