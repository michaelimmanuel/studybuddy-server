import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import crypto from 'crypto';

// ADMIN: Create a new referral code
export const createReferralCode = async (req: Request, res: Response) => {
    try {
        const { code, discountType, discountValue, quota, isActive, expiresAt } = req.body;
        const createdBy = req.user!.id;

        // Check if code already exists
        const existing = await prisma.referralCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Referral code already exists'
            });
        }

        // Validate discount value based on type
        if (discountType === 'PERCENTAGE' && discountValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount cannot exceed 100%'
            });
        }

        const referralCode = await prisma.referralCode.create({
            data: {
                id: crypto.randomUUID(),
                code: code.toUpperCase(),
                discountType,
                discountValue,
                quota,
                isActive: isActive !== undefined ? isActive : true,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy,
            }
        });

        res.status(201).json({
            success: true,
            message: 'Referral code created successfully',
            data: referralCode
        });
    } catch (error) {
        console.error('Error creating referral code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ADMIN: Get all referral codes with pagination
export const getAllReferralCodes = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const search = req.query.search as string || '';
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        
        if (isActive !== undefined) {
            whereClause.isActive = isActive;
        }

        if (search) {
            whereClause.code = {
                contains: search,
                mode: 'insensitive'
            };
        }

        const [referralCodes, total] = await Promise.all([
            prisma.referralCode.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            packagePurchases: true,
                            bundlePurchases: true
                        }
                    }
                }
            }),
            prisma.referralCode.count({ where: whereClause })
        ]);

        // Calculate total uses for each code
        const enrichedCodes = referralCodes.map(code => ({
            ...code,
            totalUses: code._count.packagePurchases + code._count.bundlePurchases,
            remainingQuota: code.quota - code.usedCount,
            _count: undefined
        }));

        res.json({
            success: true,
            data: enrichedCodes,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching referral codes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ADMIN: Get referral code by ID
export const getReferralCodeById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const referralCode = await prisma.referralCode.findUnique({
            where: { id },
            include: {
                packagePurchases: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                        package: { select: { id: true, title: true } }
                    },
                    orderBy: { purchasedAt: 'desc' },
                    take: 10
                },
                bundlePurchases: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                        bundle: { select: { id: true, title: true } }
                    },
                    orderBy: { purchasedAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!referralCode) {
            return res.status(404).json({
                success: false,
                message: 'Referral code not found'
            });
        }

        res.json({
            success: true,
            data: {
                ...referralCode,
                totalUses: referralCode.packagePurchases.length + referralCode.bundlePurchases.length,
                remainingQuota: referralCode.quota - referralCode.usedCount
            }
        });
    } catch (error) {
        console.error('Error fetching referral code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ADMIN: Update referral code
export const updateReferralCode = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, discountType, discountValue, quota, isActive, expiresAt } = req.body;

        const existing = await prisma.referralCode.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Referral code not found'
            });
        }

        // If updating code, check for duplicates
        if (code && code.toUpperCase() !== existing.code) {
            const duplicate = await prisma.referralCode.findUnique({
                where: { code: code.toUpperCase() }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'Referral code already exists'
                });
            }
        }

        // Validate discount value if being updated
        if (discountType === 'PERCENTAGE' && discountValue && discountValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount cannot exceed 100%'
            });
        }

        const updateData: any = {};
        if (code !== undefined) updateData.code = code.toUpperCase();
        if (discountType !== undefined) updateData.discountType = discountType;
        if (discountValue !== undefined) updateData.discountValue = discountValue;
        if (quota !== undefined) updateData.quota = quota;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

        const updated = await prisma.referralCode.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Referral code updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error updating referral code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// ADMIN: Delete referral code
export const deleteReferralCode = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await prisma.referralCode.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Referral code not found'
            });
        }

        await prisma.referralCode.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Referral code deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting referral code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// PUBLIC: Validate referral code (check if valid and available)
export const validateReferralCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;

        const referralCode = await prisma.referralCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!referralCode) {
            return res.status(404).json({
                success: false,
                message: 'Invalid referral code',
                valid: false
            });
        }

        // Check if active
        if (!referralCode.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This referral code is no longer active',
                valid: false
            });
        }

        // Check expiration
        if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This referral code has expired',
                valid: false
            });
        }

        // Check quota
        if (referralCode.usedCount >= referralCode.quota) {
            return res.status(400).json({
                success: false,
                message: 'This referral code has reached its usage limit',
                valid: false
            });
        }

        res.json({
            success: true,
            message: 'Referral code is valid',
            valid: true,
            data: {
                code: referralCode.code,
                discountType: referralCode.discountType,
                discountValue: referralCode.discountValue,
                remainingUses: referralCode.quota - referralCode.usedCount
            }
        });
    } catch (error) {
        console.error('Error validating referral code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Helper function to calculate discount
export const calculateDiscount = (price: number, discountType: string, discountValue: number): number => {
    if (discountType === 'PERCENTAGE') {
        return (price * discountValue) / 100;
    } else {
        return Math.min(discountValue, price); // Can't discount more than the price
    }
};

export const referralCodeController = {
    createReferralCode,
    getAllReferralCodes,
    getReferralCodeById,
    updateReferralCode,
    deleteReferralCode,
    validateReferralCode,
    calculateDiscount
};
