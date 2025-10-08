"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseController = exports.getCourseStats = exports.deleteCourse = exports.updateCourse = exports.createCourse = exports.getCourseById = exports.getAllCourses = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
// Get all courses with pagination and search
const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        const whereClause = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }
            : {};
        const courses = await prisma_1.default.course.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        const totalCourses = await prisma_1.default.course.count({ where: whereClause });
        // Return courses without enrollment data
        const coursesData = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        }));
        res.json({
            courses: coursesData,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCourses / limit),
                totalCourses,
            },
        });
    }
    catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllCourses = getAllCourses;
// Get course by ID with detailed information
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await prisma_1.default.course.findUnique({
            where: { id }
        });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const courseData = {
            id: course.id,
            title: course.title,
            description: course.description,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
        };
        res.json({ course: courseData });
    }
    catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCourseById = getCourseById;
// Create new course (admin only)
const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Course title is required' });
        }
        // Check if course with same title already exists
        const existingCourse = await prisma_1.default.course.findFirst({
            where: {
                title: { equals: title, mode: 'insensitive' }
            }
        });
        if (existingCourse) {
            return res.status(409).json({ message: 'Course with this title already exists' });
        }
        const course = await prisma_1.default.course.create({
            data: {
                id: crypto.randomUUID(),
                title,
                description: description || null,
            }
        });
        res.status(201).json({
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createCourse = createCourse;
// Update course (admin only)
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        // Check if course exists
        const existingCourse = await prisma_1.default.course.findUnique({
            where: { id }
        });
        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // If title is being updated, check for duplicates
        if (title && title !== existingCourse.title) {
            const duplicateCourse = await prisma_1.default.course.findFirst({
                where: {
                    title: { equals: title, mode: 'insensitive' },
                    id: { not: id }
                }
            });
            if (duplicateCourse) {
                return res.status(409).json({ message: 'Course with this title already exists' });
            }
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        const updatedCourse = await prisma_1.default.course.update({
            where: { id },
            data: updateData
        });
        res.json({
            course: {
                id: updatedCourse.id,
                title: updatedCourse.title,
                description: updatedCourse.description,
                createdAt: updatedCourse.createdAt,
                updatedAt: updatedCourse.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.updateCourse = updateCourse;
// Delete course (admin only)
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if course exists
        const existingCourse = await prisma_1.default.course.findUnique({
            where: { id }
        });
        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await prisma_1.default.course.delete({
            where: { id }
        });
        res.json({ message: 'Course deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteCourse = deleteCourse;
// Get course statistics (admin only)
const getCourseStats = async (req, res) => {
    try {
        const totalCourses = await prisma_1.default.course.count();
        res.json({
            stats: {
                totalCourses
            }
        });
    }
    catch (error) {
        console.error('Error fetching course stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getCourseStats = getCourseStats;
// Export all controller functions
exports.courseController = {
    getAllCourses: exports.getAllCourses,
    getCourseById: exports.getCourseById,
    createCourse: exports.createCourse,
    updateCourse: exports.updateCourse,
    deleteCourse: exports.deleteCourse,
    getCourseStats: exports.getCourseStats,
};
