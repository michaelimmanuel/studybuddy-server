"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetQuizStats = exports.adminGetAllAttempts = exports.getAttemptById = exports.getMyAttempts = exports.submitQuizAttempt = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
// Submit a quiz attempt
const submitQuizAttempt = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId, answers, timeSpent, startedAt } = req.body;
        // Validate required fields
        if (!packageId || !answers || !Array.isArray(answers) || timeSpent === undefined || !startedAt) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: packageId, answers, timeSpent, startedAt'
            });
        }
        // Get package with questions
        const pkg = await prisma_1.default.package.findUnique({
            where: { id: packageId },
            include: {
                packageQuestions: {
                    include: {
                        question: {
                            include: {
                                answers: true
                            }
                        }
                    }
                }
            }
        });
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }
        // Calculate score with partial credit support
        let totalScore = 0;
        const quizAnswers = answers.map((answer) => {
            const question = pkg.packageQuestions.find(pq => pq.questionId === answer.questionId)?.question;
            if (!question) {
                throw new Error(`Question ${answer.questionId} not found in package`);
            }
            // Find all correct answers for this question
            const correctAnswers = question.answers.filter(a => a.isCorrect);
            const correctAnswerIds = correctAnswers.map(a => a.id);
            // Check if user selected a correct answer
            const selectedAnswer = question.answers.find(a => a.id === answer.selectedAnswerId);
            const isCorrect = selectedAnswer?.isCorrect || false;
            // Calculate points for this question based on number of correct answers
            let questionPoints = 0;
            if (correctAnswerIds.length === 1) {
                // Single correct answer - traditional scoring (1 or 0)
                questionPoints = isCorrect ? 1 : 0;
            }
            else if (correctAnswerIds.length > 1) {
                // Multiple correct answers - partial credit
                if (isCorrect) {
                    // Award points proportionally: 1 / number_of_correct_answers
                    questionPoints = 1 / correctAnswerIds.length;
                }
                else {
                    // Wrong answer or no answer
                    questionPoints = 0;
                }
            }
            else {
                // No correct answers marked (shouldn't happen, but handle it)
                questionPoints = 0;
            }
            totalScore += questionPoints;
            return {
                questionId: answer.questionId,
                selectedAnswerId: answer.selectedAnswerId,
                isCorrect
            };
        });
        const totalQuestions = pkg.packageQuestions.length;
        const correctCount = Math.round(totalScore); // Round for display purposes
        const score = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
        // Create quiz attempt with answers
        const attempt = await prisma_1.default.quizAttempt.create({
            data: {
                userId,
                packageId,
                score,
                correctAnswers: correctCount,
                totalQuestions,
                timeSpent,
                startedAt: new Date(startedAt),
                answers: {
                    create: quizAnswers
                }
            },
            include: {
                answers: {
                    include: {
                        question: {
                            include: {
                                answers: true
                            }
                        },
                        selectedAnswer: true
                    }
                },
                package: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Quiz attempt submitted successfully',
            data: attempt
        });
    }
    catch (err) {
        console.error('Error submitting quiz attempt:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.submitQuizAttempt = submitQuizAttempt;
// Get user's quiz attempts
const getMyAttempts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId } = req.query;
        const where = { userId };
        if (packageId) {
            where.packageId = packageId;
        }
        const attempts = await prisma_1.default.quizAttempt.findMany({
            where,
            include: {
                package: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: { completedAt: 'desc' }
        });
        res.json({ success: true, data: attempts });
    }
    catch (err) {
        console.error('Error fetching quiz attempts:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getMyAttempts = getMyAttempts;
// Get specific attempt details with answers
const getAttemptById = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';
        const { id } = req.params;
        const attempt = await prisma_1.default.quizAttempt.findUnique({
            where: { id },
            include: {
                answers: {
                    include: {
                        question: {
                            include: {
                                answers: true
                            }
                        },
                        selectedAnswer: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                package: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Quiz attempt not found' });
        }
        // Users can only view their own attempts, admins can view all
        if (!isAdmin && attempt.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        res.json({ success: true, data: attempt });
    }
    catch (err) {
        console.error('Error fetching attempt:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getAttemptById = getAttemptById;
// ADMIN: Get all quiz attempts with filtering
const adminGetAllAttempts = async (req, res) => {
    try {
        const { userId, packageId, limit, offset } = req.query;
        const where = {};
        if (userId)
            where.userId = userId;
        if (packageId)
            where.packageId = packageId;
        const [attempts, total] = await Promise.all([
            prisma_1.default.quizAttempt.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    package: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: { completedAt: 'desc' },
                take: limit ? parseInt(limit) : 50,
                skip: offset ? parseInt(offset) : 0
            }),
            prisma_1.default.quizAttempt.count({ where })
        ]);
        res.json({
            success: true,
            data: {
                attempts,
                pagination: {
                    total,
                    limit: limit ? parseInt(limit) : 50,
                    offset: offset ? parseInt(offset) : 0
                }
            }
        });
    }
    catch (err) {
        console.error('Error fetching all attempts:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.adminGetAllAttempts = adminGetAllAttempts;
// ADMIN: Get quiz statistics
const adminGetQuizStats = async (req, res) => {
    try {
        const { packageId } = req.query;
        const where = {};
        if (packageId)
            where.packageId = packageId;
        const [totalAttempts, avgScore, attempts] = await Promise.all([
            prisma_1.default.quizAttempt.count({ where }),
            prisma_1.default.quizAttempt.aggregate({
                where,
                _avg: {
                    score: true,
                    timeSpent: true
                }
            }),
            prisma_1.default.quizAttempt.findMany({
                where,
                select: {
                    score: true
                }
            })
        ]);
        // Calculate pass rate (score >= 80%)
        const passedCount = attempts.filter(a => a.score >= 80).length;
        const passRate = totalAttempts > 0 ? (passedCount / totalAttempts) * 100 : 0;
        res.json({
            success: true,
            data: {
                totalAttempts,
                averageScore: avgScore._avg.score || 0,
                averageTimeSpent: avgScore._avg.timeSpent || 0,
                passRate,
                passedCount
            }
        });
    }
    catch (err) {
        console.error('Error fetching quiz stats:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.adminGetQuizStats = adminGetQuizStats;
