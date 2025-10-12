import { Request, Response } from "express";
import prisma from "../../lib/prisma";

// Create a new package (Admin only)
export const createPackage = async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;
    const createdBy = req.user!.id; // Assuming user is attached by auth middleware

    const newPackage = await prisma.package.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        createdBy,
      },
    });

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all packages (Admin can see all, users see only active)
export const getPackages = async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user!.role === "admin";
    
    const packages = await prisma.package.findMany({
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
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific package by ID
export const getPackageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user!.role === "admin";

    const packageData = await prisma.package.findFirst({
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
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Add questions to a package (Admin only)
export const addQuestionsToPackage = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const { questionIds } = req.body;

    // Check if package exists
    const packageExists = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageExists) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Check if questions exist
    const existingQuestions = await prisma.question.findMany({
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
    const packageQuestions = await Promise.all(
      questionIds.map(async (questionId: string, index: number) => {
        try {
          return await prisma.packageQuestion.create({
            data: {
              packageId,
              questionId,
              order: index + 1,
            },
          });
        } catch (error: any) {
          // If it's a unique constraint violation, skip this question
          if (error.code === 'P2002') {
            return null;
          }
          throw error;
        }
      })
    );

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
  } catch (error) {
    console.error("Error adding questions to package:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Remove questions from a package (Admin only)
export const removeQuestionsFromPackage = async (req: Request, res: Response) => {
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
    const packageExists = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageExists) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    // Remove questions from package
    const deleted = await prisma.packageQuestion.deleteMany({
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
  } catch (error) {
    console.error("Error removing questions from package:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update package (Admin only)
export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, isActive } = req.body;

    const packageExists = await prisma.package.findUnique({
      where: { id },
    });

    if (!packageExists) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete package (Admin only)
export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const packageExists = await prisma.package.findUnique({
      where: { id },
    });

    if (!packageExists) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    await prisma.package.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};