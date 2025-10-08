"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.isCurrentUserAdmin = exports.getUserStats = exports.updateUserProfile = exports.getUserProfile = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.getUserFromSession = void 0;
const auth_1 = require("../../lib/auth");
const node_1 = require("better-auth/node");
const better_auth_1 = require("better-auth");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const validation_middleware_1 = require("../../lib/validators/validation.middleware");
const getUserFromSession = async (req, res) => {
    try {
        // forward headers (cookies/auth headers) to better-auth
        const response = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
            asResponse: true,
            returnHeaders: false,
        });
        const session = await response.json();
        if (!session || !session.user) {
            return res.status(401).json({ message: 'No active session' });
        }
        return res.status(200).json({ user: session.user });
    }
    catch (err) {
        if (err instanceof better_auth_1.APIError) {
            return res.status(err.statusCode).json({ message: err.body?.message || 'Auth error' });
        }
        console.error('Unexpected error fetching session:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserFromSession = getUserFromSession;
// Get all users (with pagination)
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = await prisma_1.default.user.findMany({
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
        const totalUsers = await prisma_1.default.user.count();
        res.json({
            users,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
            },
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserById = getUserById;
// Create user (mainly for admin purposes)
const createUser = async (req, res) => {
    try {
        const { name, email, role } = (0, validation_middleware_1.getValidatedBody)(req);
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        // Check if user already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const user = await prisma_1.default.user.create({
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
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createUser = createUser;
// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, banned, banReason, banExpires } = req.body;
        // Check if user exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (role !== undefined)
            updateData.role = role;
        if (banned !== undefined)
            updateData.banned = banned;
        if (banReason !== undefined)
            updateData.banReason = banReason;
        if (banExpires !== undefined)
            updateData.banExpires = new Date(banExpires);
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUser = updateUser;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        await prisma_1.default.user.delete({
            where: { id },
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteUser = deleteUser;
// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserProfile = getUserProfile;
// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        // Check if user exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (image !== undefined)
            updateData.image = image;
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateUserProfile = updateUserProfile;
// Get user statistics (admin only)
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await prisma_1.default.user.count();
        const verifiedUsers = await prisma_1.default.user.count({
            where: { emailVerified: true },
        });
        const bannedUsers = await prisma_1.default.user.count({
            where: { banned: true },
        });
        const adminUsers = await prisma_1.default.user.count({
            where: { role: { not: null } },
        });
        // Users registered in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentUsers = await prisma_1.default.user.count({
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
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserStats = getUserStats;
const isCurrentUserAdmin = async (req, res) => {
    try {
        const response = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
            asResponse: true,
            returnHeaders: false,
        });
        const session = await response.json();
        if (!session || !session.user) {
            return res.status(401).json({ isAdmin: false, message: 'No active session' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });
        const isAdmin = user?.role === 'admin';
        res.json({ isAdmin });
    }
    catch (err) {
        console.error('Error checking admin status:', err);
        res.status(500).json({ isAdmin: false, message: 'Internal server error' });
    }
};
exports.isCurrentUserAdmin = isCurrentUserAdmin;
// Export all controller functions
exports.userController = {
    getUserFromSession: exports.getUserFromSession,
    getAllUsers: exports.getAllUsers,
    getUserById: exports.getUserById,
    createUser: exports.createUser,
    updateUser: exports.updateUser,
    deleteUser: exports.deleteUser,
    getUserProfile: exports.getUserProfile,
    updateUserProfile: exports.updateUserProfile,
    getUserStats: exports.getUserStats,
    isCurrentUserAdmin: exports.isCurrentUserAdmin,
};
