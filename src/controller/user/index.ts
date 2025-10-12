import { Request, Response } from 'express';
import { auth } from '../../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { APIError } from 'better-auth';
import prisma from '../../lib/prisma';
import { getValidatedBody, getValidatedQuery, getValidatedParams } from '../../lib/validators/validation.middleware';


export const getUserFromSession = async (req: Request, res: Response) => {
	try {
		// forward headers (cookies/auth headers) to better-auth
		const response = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
			asResponse: true,
			returnHeaders: false,
		});

		const session = await response.json();

		if (!session || !session.user) {
			return res.status(401).json({ message: 'No active session' });
		}

		return res.status(200).json({ user: session.user });
	} catch (err) {
		if (err instanceof APIError) {
			return res.status(err.statusCode).json({ message: err.body?.message || 'Auth error' });
		}
		console.error('Unexpected error fetching session:', err);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

// Get all users (with pagination)
export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const page = parseInt(req.query.page as string) || 1;
		const limit = parseInt(req.query.limit as string) || 10;
		const skip = (page - 1) * limit;

		const users = await prisma.user.findMany({
			skip,
			take: limit,
			select: {
				id: true,
				name: true,
				email: true,
				emailVerified: true,
				image: true,
				role: true,
				banned: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		const totalUsers = await prisma.user.count();

		res.json({
			users,
			pagination: {
				page,
				limit,
				totalPages: Math.ceil(totalUsers / limit),
				totalUsers,
			},
		});
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				emailVerified: true,
				image: true,
				role: true,
				banned: true,
				banReason: true,
				banExpires: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({ user });
	} catch (error) {
		console.error('Error fetching user:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Create user (mainly for admin purposes)
export const createUser = async (req: Request, res: Response) => {
	try {
		const { name, email, role } = getValidatedBody(req);

		if (!name || !email) {
			return res.status(400).json({ message: 'Name and email are required' });
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return res.status(409).json({ message: 'User already exists' });
		}

		const user = await prisma.user.create({
			data: {
				id: crypto.randomUUID(),
				name,
				email,
				role: role || null,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});

		res.status(201).json({ user });
	} catch (error) {
		console.error('Error creating user:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, role, banned, banReason, banExpires } = req.body;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (role !== undefined) updateData.role = role;
		if (banned !== undefined) updateData.banned = banned;
		if (banReason !== undefined) updateData.banReason = banReason;
		if (banExpires !== undefined) updateData.banExpires = new Date(banExpires);

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				banned: true,
				banReason: true,
				banExpires: true,
				updatedAt: true,
			},
		});

		res.json({ user: updatedUser });
	} catch (error) {
		console.error('Error updating user:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		await prisma.user.delete({
			where: { id },
		});

		res.json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Error deleting user:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				emailVerified: true,
				image: true,
				role: true,
				createdAt: true,
				// Add any profile-specific fields here
			},
		});

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({ profile: user });
	} catch (error) {
		console.error('Error fetching user profile:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, image } = req.body;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return res.status(404).json({ message: 'User not found' });
		}

		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (image !== undefined) updateData.image = image;

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				updatedAt: true,
			},
		});

		res.json({ profile: updatedUser });
	} catch (error) {
		console.error('Error updating user profile:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

// Get user statistics (admin only)
export const getUserStats = async (req: Request, res: Response) => {
	try {
		const totalUsers = await prisma.user.count();
		const verifiedUsers = await prisma.user.count({
			where: { emailVerified: true },
		});
		const bannedUsers = await prisma.user.count({
			where: { banned: true },
		});
		const adminUsers = await prisma.user.count({
			where: { role: { not: null } },
		});

		// Users registered in the last 30 days
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		
		const recentUsers = await prisma.user.count({
			where: {
				createdAt: {
					gte: thirtyDaysAgo,
				},
			},
		});

		res.json({
			stats: {
				totalUsers,
				verifiedUsers,
				bannedUsers,
				adminUsers,
				recentUsers,
				verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0,
			},
		});
	} catch (error) {
		console.error('Error fetching user stats:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const isCurrentUserAdmin = async (req: Request, res: Response) => {
	try {
		const response = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
			asResponse: true,
			returnHeaders: false,
		});
		const session = await response.json();

		if (!session || !session.user) {
			return res.status(401).json({ isAdmin: false, message: 'No active session' });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});

		const isAdmin = user?.role === 'admin';
		res.json({ isAdmin });
	} catch (err) {
		console.error('Error checking admin status:', err);
		res.status(500).json({ isAdmin: false, message: 'Internal server error' });
	}
};

export const createAdminUserWithPlugin = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = getValidatedBody(req);

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ 
                message: 'A user with this email already exists' 
            });
        }

        // Create admin user using better-auth
        const response = await auth.api.createUser({
            body: {
                name,
                email,
                password,
                role: 'admin',
            },
        });

        if (!response || !response.user) {
            return res.status(500).json({ 
                message: 'Failed to create admin user' 
            });
        }

        // Log admin creation activity
        console.log(`✅ Admin user created: ${email} by admin: ${req.user?.email}`);

        res.status(201).json({ 
            message: 'Admin user created successfully',
            user: {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email,
                role: response.user.role,
                emailVerified: response.user.emailVerified,
                createdAt: response.user.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating admin user:', error);
        
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes('email')) {
                return res.status(400).json({ 
                    message: 'Invalid email address' 
                });
            }
            if (error.message.includes('password')) {
                return res.status(400).json({ 
                    message: 'Password does not meet requirements' 
                });
            }
        }

        res.status(500).json({ 
            message: 'Internal server error while creating admin user' 
        });
    }
};

// Get all admin users
export const getAllAdminUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const adminUsers = await prisma.user.findMany({
            where: {
                role: 'admin'
            },
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                image: true,
                role: true,
                banned: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalAdminUsers = await prisma.user.count({
            where: {
                role: 'admin'
            }
        });

        res.json({
            adminUsers,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalAdminUsers / limit),
                totalAdminUsers,
            },
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Revoke admin privileges (demote admin to user)
export const revokeAdminPrivileges = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is currently an admin
        if (existingUser.role !== 'admin') {
            return res.status(400).json({ 
                message: 'User is not an admin' 
            });
        }

        // Prevent self-demotion
        if (req.user?.id === id) {
            return res.status(403).json({ 
                message: 'You cannot revoke your own admin privileges' 
            });
        }

        // Check if this is the last admin
        const adminCount = await prisma.user.count({
            where: { 
                role: 'admin',
                banned: { not: true }
            }
        });

        if (adminCount <= 1) {
            return res.status(403).json({ 
                message: 'Cannot revoke admin privileges. At least one admin must remain.' 
            });
        }

        // Revoke admin privileges
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role: 'user' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                updatedAt: true,
            },
        });

        // Log admin revocation activity
        console.log(`⚠️ Admin privileges revoked for: ${existingUser.email} by admin: ${req.user?.email}`);

        res.json({ 
            message: 'Admin privileges revoked successfully',
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error revoking admin privileges:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export all controller functions
export const userController = {
	getUserFromSession,
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	getUserProfile,
	updateUserProfile,
	getUserStats,
	isCurrentUserAdmin,
	createAdminUserWithPlugin,
	getAllAdminUsers,
	revokeAdminPrivileges
};