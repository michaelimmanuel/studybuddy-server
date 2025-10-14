"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePackage = exports.updatePackage = exports.addRandomQuestionsFromCourse = exports.removeQuestionsFromPackage = exports.addQuestionsToPackage = exports.getPackageById = exports.getPackages = exports.createPackage = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
// Create a new package (Admin only)
const createPackage = async (req, res) => {
    try {
        const { title, description, price, timeLimit, availableFrom, availableUntil } = req.body;
        const createdBy = req.user.id; // Assuming user is attached by auth middleware
        const newPackage = await prisma_1.default.package.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                timeLimit: timeLimit ? parseInt(timeLimit, 10) : null,
                availableFrom: availableFrom ? new Date(availableFrom) : null,
                availableUntil: availableUntil ? new Date(availableUntil) : null,
                createdBy,
            },
        });
        res.status(201).json({
            success: true,
            message: "Package created successfully",
            data: newPackage,
        });
    }
    catch (error) {
        console.error("Error creating package:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createPackage = createPackage;
// Get all packages (Admin can see all, users see only active)
const getPackages = async (req, res) => {
    try {
        const isAdmin = req.user.role === "admin";
        const packages = await prisma_1.default.package.findMany({
            where: isAdmin ? {} : { isActive: true },
            include: {
                packageQuestions: {
                    include: {
                        question: {
                            include: {
                                answers: true,
                                course: {
                                    select: {
                                        id: true,
                                        title: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json({
            success: true,
            data: packages,
        });
    }
    catch (error) {
        console.error("Error fetching packages:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getPackages = getPackages;
// Get a specific package by ID
const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role === "admin";
        const packageData = await prisma_1.default.package.findFirst({
            where: {
                id,
                ...(isAdmin ? {} : { isActive: true }),
            },
            include: {
                packageQuestions: {
                    include: {
                        question: {
                            include: {
                                answers: true,
                                course: {
                                    select: {
                                        id: true,
                                        title: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
        if (!packageData) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }
        res.json({
            success: true,
            data: packageData,
        });
    }
    catch (error) {
        console.error("Error fetching package:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getPackageById = getPackageById;
// Add questions to a package (Admin only)
const addQuestionsToPackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        const { questionIds } = req.body;
        // Check if package exists
        const packageExists = await prisma_1.default.package.findUnique({
            where: { id: packageId },
        });
        if (!packageExists) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }
        // Check if questions exist
        const existingQuestions = await prisma_1.default.question.findMany({
            where: {
                id: {
                    in: questionIds,
                },
            },
        });
        if (existingQuestions.length !== questionIds.length) {
            return res.status(400).json({
                success: false,
                message: "One or more questions not found",
            });
        }
        // Add questions to package (ignore duplicates)
        const packageQuestions = await Promise.all(questionIds.map(async (questionId, index) => {
            try {
                return await prisma_1.default.packageQuestion.create({
                    data: {
                        packageId,
                        questionId,
                        order: index + 1,
                    },
                });
            }
            catch (error) {
                // If it's a unique constraint violation, skip this question
                if (error.code === 'P2002') {
                    return null;
                }
                throw error;
            }
        }));
        const successfullyAdded = packageQuestions.filter(pq => pq !== null);
        res.json({
            success: true,
            message: `${successfullyAdded.length} questions added to package`,
            data: {
                packageId,
                questionsAdded: successfullyAdded.length,
                duplicatesSkipped: questionIds.length - successfullyAdded.length,
            },
        });
    }
    catch (error) {
        console.error("Error adding questions to package:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.addQuestionsToPackage = addQuestionsToPackage;
// Remove questions from a package (Admin only)
const removeQuestionsFromPackage = async (req, res) => {
    try {
        const { packageId } = req.params;
        const { questionIds } = req.body;
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Question IDs must be provided as a non-empty array",
            });
        }
        // Check if package exists
        const packageExists = await prisma_1.default.package.findUnique({
            where: { id: packageId },
        });
        if (!packageExists) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }
        // Remove questions from package
        const deleted = await prisma_1.default.packageQuestion.deleteMany({
            where: {
                packageId,
                questionId: {
                    in: questionIds,
                },
            },
        });
        res.json({
            success: true,
            message: `${deleted.count} questions removed from package`,
            data: {
                packageId,
                questionsRemoved: deleted.count,
            },
        });
    }
    catch (error) {
        console.error("Error removing questions from package:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.removeQuestionsFromPackage = removeQuestionsFromPackage;
// Add random X questions from a course to a package (Admin only)
const addRandomQuestionsFromCourse = async (req, res) => {
    try {
        const { packageId } = req.params;
        const { courseId, count } = req.body;
        // normalize count
        const targetCount = typeof count === 'string' ? parseInt(count, 10) : count;
        // Ensure package exists
        const pkg = await prisma_1.default.package.findUnique({ where: { id: packageId } });
        if (!pkg) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }
        // Ensure course exists
        const course = await prisma_1.default.course.findUnique({ where: { id: courseId } });
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        // Find question IDs already in the package to avoid duplicates
        const existing = await prisma_1.default.packageQuestion.findMany({
            where: { packageId },
            select: { questionId: true },
        });
        const existingIds = new Set(existing.map((e) => e.questionId));
        // Count available questions in course excluding existing ones
        const availableCount = await prisma_1.default.question.count({
            where: { courseId, id: { notIn: Array.from(existingIds) } },
        });
        if (availableCount === 0) {
            return res.status(400).json({
                success: false,
                message: "No available questions in this course to add to the package",
            });
        }
        const take = Math.min(targetCount, availableCount);
        // Get random 'take' questions from the course not already in package.
        // Using SQL for true randomness and efficiency on large sets.
        const randomQuestions = await prisma_1.default.$queryRaw `
      SELECT q.id
      FROM "question" q
      WHERE q."courseId" = ${courseId}
        AND q.id NOT IN (
          SELECT pq."questionId" FROM "package_question" pq WHERE pq."packageId" = ${packageId}
        )
      ORDER BY random()
      LIMIT ${take}
    `;
        if (randomQuestions.length === 0) {
            return res.status(400).json({ success: false, message: "No questions selected" });
        }
        // Determine current max order to append new questions sequentially
        const lastOrder = await prisma_1.default.packageQuestion.aggregate({
            where: { packageId },
            _max: { order: true },
        });
        let startOrder = (lastOrder._max.order ?? 0) + 1;
        // Create relations in a transaction
        const created = await prisma_1.default.$transaction(randomQuestions.map((q, idx) => prisma_1.default.packageQuestion.create({
            data: {
                packageId,
                questionId: q.id,
                order: startOrder + idx,
            },
        })));
        res.json({
            success: true,
            message: `${created.length} random question(s) added to package`,
            data: {
                packageId,
                courseId,
                requested: targetCount,
                added: created.length,
                remainingAvailable: availableCount - created.length,
            },
        });
    }
    catch (error) {
        console.error("Error adding random questions to package:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.addRandomQuestionsFromCourse = addRandomQuestionsFromCourse;
// Update package (Admin only)
const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, isActive, timeLimit, availableFrom, availableUntil } = req.body;
        const packageExists = await prisma_1.default.package.findUnique({
            where: { id },
        });
        if (!packageExists) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }
        const updatedPackage = await prisma_1.default.package.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(isActive !== undefined && { isActive }),
                ...(timeLimit !== undefined && { timeLimit: timeLimit ? parseInt(timeLimit, 10) : null }),
                ...(availableFrom !== undefined && { availableFrom: availableFrom ? new Date(availableFrom) : null }),
                ...(availableUntil !== undefined && { availableUntil: availableUntil ? new Date(availableUntil) : null }),
            },
        });
        res.json({
            success: true,
            message: "Package updated successfully",
            data: updatedPackage,
        });
    }
    catch (error) {
        console.error("Error updating package:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updatePackage = updatePackage;
// Delete package (Admin only)
const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const packageExists = await prisma_1.default.package.findUnique({
            where: { id },
        });
        if (!packageExists) {
            return res.status(404).json({
                success: false,
                message: "Package not found",
            });
        }
        await prisma_1.default.package.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: "Package deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting package:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deletePackage = deletePackage;
