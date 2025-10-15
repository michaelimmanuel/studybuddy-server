import { Request, Response } from "express";
import prisma from "../../lib/prisma";

// Create a new bundle (Admin only)
export const createBundle = async (req: Request, res: Response) => {
  try {
    const { title, description, price, discount, availableFrom, availableUntil } = req.body;
    const createdBy = req.user!.id; // Assuming user is attached by auth middleware

    // Normalize inputs
    const priceNumber = typeof price === 'string' ? parseFloat(price) : Number(price);
    const discountNumber = discount !== undefined && discount !== null && discount !== '' 
      ? (typeof discount === 'string' ? parseFloat(discount) : Number(discount))
      : null;
    const availableFromDate = availableFrom ? new Date(availableFrom) : null;
    const availableUntilDate = availableUntil ? new Date(availableUntil) : null;

    const newBundle = await prisma.bundle.create({
      data: {
        title,
        description,
        price: priceNumber,
        discount: discountNumber,
        availableFrom: availableFromDate,
        availableUntil: availableUntilDate,
        createdBy,
      },
    });

    res.status(201).json({
      success: true,
      message: "Bundle created successfully",
      data: newBundle,
    });
  } catch (error) {
    console.error("Error creating bundle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all bundles (Admin can see all, users see only active)
export const getBundles = async (req: Request, res: Response) => {
  try {
    const isAdmin = req.user!.role === "admin";
    
    const bundles = await prisma.bundle.findMany({
      where: isAdmin ? {} : { isActive: true },
      include: {
        bundlePackages: {
          include: {
            package: {
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

    // Calculate total original price and total questions for each bundle
    const bundlesWithStats = bundles.map(bundle => {
      const totalOriginalPrice = bundle.bundlePackages.reduce(
        (sum, bp) => sum + bp.package.price, 0
      );
      const totalQuestions = bundle.bundlePackages.reduce(
        (sum, bp) => sum + bp.package.packageQuestions.length, 0
      );
      const savings = totalOriginalPrice - bundle.price;
      const savingsPercentage = totalOriginalPrice > 0 ? (savings / totalOriginalPrice) * 100 : 0;

      return {
        ...bundle,
        stats: {
          totalOriginalPrice,
          totalQuestions,
          savings,
          savingsPercentage: Math.round(savingsPercentage * 100) / 100,
          packagesCount: bundle.bundlePackages.length,
        },
      };
    });

    res.json({
      success: true,
      data: bundlesWithStats,
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get a specific bundle by ID
export const getBundleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user!.role === "admin";

    const bundleData = await prisma.bundle.findFirst({
      where: {
        id,
        ...(isAdmin ? {} : { isActive: true }),
      },
      include: {
        bundlePackages: {
          include: {
            package: {
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
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!bundleData) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // Calculate stats
    const totalOriginalPrice = bundleData.bundlePackages.reduce(
      (sum, bp) => sum + bp.package.price, 0
    );
    const totalQuestions = bundleData.bundlePackages.reduce(
      (sum, bp) => sum + bp.package.packageQuestions.length, 0
    );
    const savings = totalOriginalPrice - bundleData.price;
    const savingsPercentage = totalOriginalPrice > 0 ? (savings / totalOriginalPrice) * 100 : 0;

    const bundleWithStats = {
      ...bundleData,
      stats: {
        totalOriginalPrice,
        totalQuestions,
        savings,
        savingsPercentage: Math.round(savingsPercentage * 100) / 100,
        packagesCount: bundleData.bundlePackages.length,
      },
    };

    res.json({
      success: true,
      data: bundleWithStats,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update bundle (Admin only)
export const updateBundle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, discount, isActive, availableFrom, availableUntil } = req.body;

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
    });

    if (!existingBundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      updateData.price = typeof price === 'string' ? parseFloat(price) : Number(price);
    }
    if (discount !== undefined) {
      updateData.discount = discount !== null && discount !== '' 
        ? (typeof discount === 'string' ? parseFloat(discount) : Number(discount))
        : null;
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (availableFrom !== undefined) {
      updateData.availableFrom = availableFrom ? new Date(availableFrom) : null;
    }
    if (availableUntil !== undefined) {
      updateData.availableUntil = availableUntil ? new Date(availableUntil) : null;
    }

    const updatedBundle = await prisma.bundle.update({
      where: { id },
      data: updateData,
      include: {
        bundlePackages: {
          include: {
            package: {
              include: {
                packageQuestions: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Bundle updated successfully",
      data: updatedBundle,
    });
  } catch (error) {
    console.error("Error updating bundle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete bundle (Admin only)
export const deleteBundle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id },
    });

    if (!existingBundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    await prisma.bundle.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Bundle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Add packages to bundle (Admin only)
export const addPackagesToBundle = async (req: Request, res: Response) => {
  try {
    const { bundleId } = req.params;
    const { packageIds } = req.body;

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
    });

    if (!existingBundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // Check if packages exist
    const packages = await prisma.package.findMany({
      where: {
        id: { in: packageIds },
        isActive: true,
      },
    });

    if (packages.length !== packageIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more packages not found or inactive",
      });
    }

    // Check for existing bundle-package relationships
    const existingRelations = await prisma.bundlePackage.findMany({
      where: {
        bundleId,
        packageId: { in: packageIds },
      },
    });

    if (existingRelations.length > 0) {
      const existingPackageIds = existingRelations.map(rel => rel.packageId);
      return res.status(400).json({
        success: false,
        message: `Some packages are already in this bundle: ${existingPackageIds.join(', ')}`,
      });
    }

    // Add packages to bundle
    const bundlePackages = await prisma.bundlePackage.createMany({
      data: packageIds.map((packageId: string, index: number) => ({
        bundleId,
        packageId,
        order: index + 1,
      })),
    });

    res.json({
      success: true,
      message: "Packages added to bundle successfully",
      data: { added: bundlePackages.count },
    });
  } catch (error) {
    console.error("Error adding packages to bundle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Remove packages from bundle (Admin only)
export const removePackagesFromBundle = async (req: Request, res: Response) => {
  try {
    const { bundleId } = req.params;
    const { packageIds } = req.body;

    // Check if bundle exists
    const existingBundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
    });

    if (!existingBundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // Remove packages from bundle
    const deleteResult = await prisma.bundlePackage.deleteMany({
      where: {
        bundleId,
        packageId: { in: packageIds },
      },
    });

    if (deleteResult.count === 0) {
      return res.status(400).json({
        success: false,
        message: "No packages were removed. They might not be in this bundle.",
      });
    }

    res.json({
      success: true,
      message: "Packages removed from bundle successfully",
      data: { removed: deleteResult.count },
    });
  } catch (error) {
    console.error("Error removing packages from bundle:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};