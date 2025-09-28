import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

// Get all courses with pagination and search
export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const skip = (page - 1) * limit;

        const whereClause = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } }
                ]
            }
            : {};

        const courses = await prisma.course.findMany({
            where: whereClause,
            skip,
            take: limit,
            include: {
                enrollments: {
                    where: { status: 'APPROVED' },
                    select: { id: true }
                },
                _count: {
                    select: {
                        enrollments: {
                            where: { status: 'APPROVED' }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalCourses = await prisma.course.count({ where: whereClause });

        // Add enrollment count to each course
        const coursesWithStats = courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            enrollmentCount: course._count.enrollments,
            isEnrolled: req.user ? course.enrollments.some(e => true) : false // Will be properly checked in getUserCourses
        }));

        res.json({
            courses: coursesWithStats,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCourses / limit),
                totalCourses,
            },
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get course by ID with detailed information
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                enrollments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        enrollments: {
                            where: { status: 'APPROVED' }
                        }
                    }
                }
            }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if current user is enrolled
        const userEnrollment = req.user
            ? course.enrollments.find(e => e.userId === req.user?.id)
            : null;

        const courseData = {
            id: course.id,
            title: course.title,
            description: course.description,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            enrollmentCount: course._count.enrollments,
            userEnrollment: userEnrollment ? {
                status: userEnrollment.status,
                enrolledAt: userEnrollment.createdAt
            } : null,
            // Only show enrolled users if user is admin or enrolled in course
            enrolledUsers: (req.user?.role || userEnrollment) 
                ? course.enrollments
                    .filter(e => e.status === 'APPROVED')
                    .map(e => ({
                        id: e.user.id,
                        name: e.user.name,
                        email: e.user.email,
                        image: e.user.image,
                        enrolledAt: e.createdAt
                    }))
                : []
        };

        res.json({ course: courseData });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create new course (admin only)
export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Course title is required' });
        }

        // Check if course with same title already exists
        const existingCourse = await prisma.course.findFirst({
            where: {
                title: { equals: title, mode: 'insensitive' }
            }
        });

        if (existingCourse) {
            return res.status(409).json({ message: 'Course with this title already exists' });
        }

        const course = await prisma.course.create({
            data: {
                id: crypto.randomUUID(),
                title,
                description: description || null,
            },
            include: {
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            }
        });

        res.status(201).json({
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt,
                enrollmentCount: 0
            }
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update course (admin only)
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
            where: { id }
        });

        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If title is being updated, check for duplicates
        if (title && title !== existingCourse.title) {
            const duplicateCourse = await prisma.course.findFirst({
                where: {
                    title: { equals: title, mode: 'insensitive' },
                    id: { not: id }
                }
            });

            if (duplicateCourse) {
                return res.status(409).json({ message: 'Course with this title already exists' });
            }
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        const updatedCourse = await prisma.course.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        enrollments: {
                            where: { status: 'APPROVED' }
                        }
                    }
                }
            }
        });

        res.json({
            course: {
                id: updatedCourse.id,
                title: updatedCourse.title,
                description: updatedCourse.description,
                createdAt: updatedCourse.createdAt,
                updatedAt: updatedCourse.updatedAt,
                enrollmentCount: updatedCourse._count.enrollments
            }
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete course (admin only)
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if course exists
        const existingCourse = await prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrollments: true }
                }
            }
        });

        if (!existingCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if course has enrollments
        if (existingCourse._count.enrollments > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete course with existing enrollments',
                enrollmentCount: existingCourse._count.enrollments
            });
        }

        await prisma.course.delete({
            where: { id }
        });

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Enroll user in course
export const enrollUser = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        if (existingEnrollment) {
            return res.status(409).json({ 
                message: 'Already enrolled in this course',
                status: existingEnrollment.status
            });
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                courseId,
                status: 'PENDING' // Default status
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Enrollment request submitted successfully',
            enrollment: {
                id: enrollment.id,
                status: enrollment.status,
                course: enrollment.course,
                enrolledAt: enrollment.createdAt
            }
        });
    } catch (error) {
        console.error('Error enrolling user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Unenroll user from course
export const unenrollUser = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Check if enrollment exists
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Not enrolled in this course' });
        }

        await prisma.enrollment.delete({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        res.json({ message: 'Successfully unenrolled from course' });
    } catch (error) {
        console.error('Error unenrolling user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get course students (admin or enrolled users only)
export const getCourseStudents = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        const isAdmin = req.user?.role;

        // Check if course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user has permission to view students
        if (!isAdmin) {
            const userEnrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: userId!,
                        courseId
                    }
                }
            });

            if (!userEnrollment || userEnrollment.status !== 'APPROVED') {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const students = enrollments.map(enrollment => ({
            enrollmentId: enrollment.id,
            status: enrollment.status,
            enrolledAt: enrollment.createdAt,
            user: enrollment.user
        }));

        res.json({
            course: {
                id: course.id,
                title: course.title
            },
            students,
            totalStudents: students.length,
            approvedStudents: students.filter(s => s.status === 'APPROVED').length
        });
    } catch (error) {
        console.error('Error fetching course students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user's courses
export const getUserCourses = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        const isAdmin = req.user?.role;

        // Check if user can view this data
        if (!isAdmin && currentUserId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const courses = enrollments.map(enrollment => ({
            enrollmentId: enrollment.id,
            status: enrollment.status,
            enrolledAt: enrollment.createdAt,
            course: enrollment.course
        }));

        res.json({
            courses,
            totalEnrollments: courses.length,
            approvedEnrollments: courses.filter(c => c.status === 'APPROVED').length,
            pendingEnrollments: courses.filter(c => c.status === 'PENDING').length
        });
    } catch (error) {
        console.error('Error fetching user courses:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Manage enrollment status (admin only)
export const manageEnrollment = async (req: Request, res: Response) => {
    try {
        const { enrollmentId } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be PENDING, APPROVED, or REJECTED' 
            });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        const updatedEnrollment = await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: { status: status as EnrollmentStatus },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        res.json({
            message: `Enrollment ${status.toLowerCase()} successfully`,
            enrollment: {
                id: updatedEnrollment.id,
                status: updatedEnrollment.status,
                user: updatedEnrollment.user,
                course: updatedEnrollment.course,
                updatedAt: updatedEnrollment.updatedAt
            }
        });
    } catch (error) {
        console.error('Error managing enrollment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get course statistics (admin only)
export const getCourseStats = async (req: Request, res: Response) => {
    try {
        const totalCourses = await prisma.course.count();
        const totalEnrollments = await prisma.enrollment.count();
        const approvedEnrollments = await prisma.enrollment.count({
            where: { status: 'APPROVED' }
        });
        const pendingEnrollments = await prisma.enrollment.count({
            where: { status: 'PENDING' }
        });

        // Most popular courses
        const popularCourses = await prisma.course.findMany({
            include: {
                _count: {
                    select: {
                        enrollments: {
                            where: { status: 'APPROVED' }
                        }
                    }
                }
            },
            orderBy: {
                enrollments: {
                    _count: 'desc'
                }
            },
            take: 5
        });

        res.json({
            stats: {
                totalCourses,
                totalEnrollments,
                approvedEnrollments,
                pendingEnrollments,
                rejectedEnrollments: totalEnrollments - approvedEnrollments - pendingEnrollments,
                averageEnrollmentsPerCourse: totalCourses > 0 ? (approvedEnrollments / totalCourses).toFixed(2) : 0
            },
            popularCourses: popularCourses.map(course => ({
                id: course.id,
                title: course.title,
                enrollmentCount: course._count.enrollments
            }))
        });
    } catch (error) {
        console.error('Error fetching course stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Export all controller functions
export const courseController = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollUser,
    unenrollUser,
    getCourseStudents,
    getUserCourses,
    manageEnrollment,
    getCourseStats,
};