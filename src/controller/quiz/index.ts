import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { userHasPackageAccess } from '../../lib/access-control';

// Submit a quiz attempt
export const submitQuizAttempt = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { packageId, answers, timeSpent, startedAt } = req.body;

    // Validate required fields
    if (!packageId || !answers || !Array.isArray(answers) || timeSpent === undefined || !startedAt) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: packageId, answers, timeSpent, startedAt'
      });
    }

    // Verify user has access to this package (approved purchase)
    const hasAccess = await userHasPackageAccess(userId, packageId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this package. Please purchase and wait for admin approval.'
      });
    }

    // Get package with questions
    const pkg = await prisma.package.findUnique({
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
    const quizAnswers = answers.map((answer: { questionId: string; selectedAnswerId: string | null }) => {
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
      } else if (correctAnswerIds.length > 1) {
        // Multiple correct answers - partial credit
        if (isCorrect) {
          // Award points proportionally: 1 / number_of_correct_answers
          questionPoints = 1 / correctAnswerIds.length;
        } else {
          // Wrong answer or no answer
          questionPoints = 0;
        }
      } else {
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
    const attempt = await prisma.quizAttempt.create({
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
  } catch (err) {
    console.error('Error submitting quiz attempt:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get user's quiz attempts
export const getMyAttempts = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { packageId } = req.query;

    const where: any = { userId };
    if (packageId) {
      where.packageId = packageId as string;
    }

    const attempts = await prisma.quizAttempt.findMany({
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
  } catch (err) {
    console.error('Error fetching quiz attempts:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get specific attempt details with answers
export const getAttemptById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    const { id } = req.params;

    const attempt = await prisma.quizAttempt.findUnique({
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
  } catch (err) {
    console.error('Error fetching attempt:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ADMIN: Get all quiz attempts with filtering
export const adminGetAllAttempts = async (req: Request, res: Response) => {
  try {
    const { userId, packageId, limit, offset } = req.query;

    const where: any = {};
    if (userId) where.userId = userId as string;
    if (packageId) where.packageId = packageId as string;

    const [attempts, total] = await Promise.all([
      prisma.quizAttempt.findMany({
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
        take: limit ? parseInt(limit as string) : 50,
        skip: offset ? parseInt(offset as string) : 0
      }),
      prisma.quizAttempt.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          total,
          limit: limit ? parseInt(limit as string) : 50,
          offset: offset ? parseInt(offset as string) : 0
        }
      }
    });
  } catch (err) {
    console.error('Error fetching all attempts:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ADMIN: Get quiz statistics
export const adminGetQuizStats = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.query;

    const where: any = {};
    if (packageId) where.packageId = packageId as string;

    const [totalAttempts, avgScore, attempts] = await Promise.all([
      prisma.quizAttempt.count({ where }),
      prisma.quizAttempt.aggregate({
        where,
        _avg: {
          score: true,
          timeSpent: true
        }
      }),
      prisma.quizAttempt.findMany({
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
  } catch (err) {
    console.error('Error fetching quiz stats:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
