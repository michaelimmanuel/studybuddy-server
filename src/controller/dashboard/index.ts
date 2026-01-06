import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    // Aggregate overall attempt stats (count, avg, max, sum) and fetch recent attempts in parallel
    const [attemptAgg, recentAttempts] = await Promise.all([
      prisma.quizAttempt.aggregate({
        where: { userId },
        _count: { _all: true },
        _avg: { score: true },
        _max: { score: true },
        _sum: { timeSpent: true },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { completedAt: "desc" },
        take: 5,
        select: {
          id: true,
          packageId: true,
          score: true,
          correctAnswers: true,
          totalQuestions: true,
          timeSpent: true,
          startedAt: true,
          completedAt: true,
        },
      }),
    ]);

    const totalAttempts = attemptAgg._count._all ?? 0;
    const avgScore = attemptAgg._avg.score ?? 0;
    const bestScore = attemptAgg._max.score ?? 0;
    const timeSpentMinutes = Math.round(((attemptAgg._sum.timeSpent ?? 0) / 60) * 10) / 10;

    // Fetch all quiz answers for this user's attempts once, including the question's courseId
    const answers = await prisma.quizAnswer.findMany({
      where: { attempt: { userId } },
      select: { isCorrect: true, createdAt: true, attemptId: true, question: { select: { courseId: true } } },
    });

    // Group answers by courseId in-memory to compute totals, correct counts, distinct attempts and last attempt
    const courseMap = new Map<string, { totalAnswers: number; correctAnswers: number; attemptsSet: Set<string>; lastAttemptAt: Date | null }>();
    for (const a of answers) {
      const courseId = a.question.courseId;
      let entry = courseMap.get(courseId);
      if (!entry) entry = { totalAnswers: 0, correctAnswers: 0, attemptsSet: new Set(), lastAttemptAt: null };
      entry.totalAnswers += 1;
      if (a.isCorrect) entry.correctAnswers += 1;
      entry.attemptsSet.add(a.attemptId);
      if (!entry.lastAttemptAt || a.createdAt > entry.lastAttemptAt) entry.lastAttemptAt = a.createdAt;
      courseMap.set(courseId, entry);
    }

    // Fetch course titles (we show all courses to keep consistent UI)
    const courses = await prisma.course.findMany({ select: { id: true, title: true } });

    const coursePerformances = courses.map((c) => {
      const stats = courseMap.get(c.id);
      const totalAnswers = stats?.totalAnswers ?? 0;
      const correctAnswers = stats?.correctAnswers ?? 0;
      const attemptsCount = stats?.attemptsSet.size ?? 0;
      const scorePercent = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : null;
      const lastAttemptAt = stats?.lastAttemptAt ?? null;
      return { courseId: c.id, courseTitle: c.title, scorePercent, attempts: attemptsCount, lastAttemptAt };
    });

    // Choose a recommended quiz/package from the weakest course (few DB ops)
    const scored = coursePerformances.filter((p) => p.scorePercent !== null) as any[];
    scored.sort((a, b) => (a.scorePercent as number) - (b.scorePercent as number));

    let recommendedQuiz: any = null;
    if (scored.length > 0) {
      const weakest = scored[0];
      const pkg = await prisma.package.findFirst({
        where: { packageQuestions: { some: { question: { courseId: weakest.courseId } } } },
        select: { id: true, title: true },
      });
      if (pkg) {
        const qc = await prisma.packageQuestion.count({ where: { packageId: pkg.id } });
        recommendedQuiz = { id: pkg.id, title: pkg.title, questionCount: qc, estimatedMinutes: Math.ceil((qc * 30) / 60) };
      }
    }

    return res.json({
      progressPercent: null,
      avgScore: Math.round((avgScore ?? 0) * 10) / 10,
      totalAttempts,
      bestScore,
      streakDays: 0,
      timeSpentMinutes,
      recommendedQuiz,
      coursePerformances,
      recentAttempts: recentAttempts.map((a) => ({
        attemptId: a.id,
        quizId: a.packageId,
        quizTitle: a.packageId,
        score: a.score,
        correct: a.correctAnswers,
        totalQuestions: a.totalQuestions,
        status: a.completedAt ? "completed" : "in-progress",
        startedAt: a.startedAt,
        finishedAt: a.completedAt,
        durationSeconds: a.timeSpent,
      })),
      weakTopics: [],
    });
  } catch (err) {
    console.error("Error in getDashboardSummary", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getDashboardSummary,
};
