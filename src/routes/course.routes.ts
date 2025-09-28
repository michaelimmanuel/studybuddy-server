import express from "express";
import { courseController } from "../controller/course";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.middleware";
import { 
    validateBody, 
    validateQuery, 
    validateParams 
} from "../lib/validators/validation.middleware";
import {
    createCourseSchema,
    updateCourseSchema,
    updateEnrollmentSchema,
    coursesQuerySchema,
    courseIdParamSchema,
    enrollmentIdParamSchema,
    courseUserIdParamSchema
} from "../lib/validators/course.validator";

const router = express.Router();

// Public routes (with optional auth for enrolled status)
router.get("/", 
    optionalAuth, 
    validateQuery(coursesQuerySchema), 
    courseController.getAllCourses
);

// Admin stats route (must come before /:id route)
router.get("/stats", requireAdmin, courseController.getCourseStats);

router.get("/:id", 
    optionalAuth, 
    validateParams(courseIdParamSchema), 
    courseController.getCourseById
);             

// Protected routes (authentication required)
router.use(requireAuth); // All routes below require authentication

// User enrollment routes
router.post("/:id/enroll", 
    validateParams(courseIdParamSchema), 
    courseController.enrollUser
);          
router.delete("/:id/unenroll", 
    validateParams(courseIdParamSchema), 
    courseController.unenrollUser
);    

// Course access routes (for enrolled users or admins)
router.get("/:id/students", 
    validateParams(courseIdParamSchema), 
    courseController.getCourseStudents
); 

// User's courses
router.get("/user/:userId", 
    validateParams(courseUserIdParamSchema), 
    courseController.getUserCourses
);     

// Admin-only routes
router.post("/", 
    requireAdmin, 
    validateBody(createCourseSchema), 
    courseController.createCourse
);                 
router.put("/:id", 
    requireAdmin, 
    validateParams(courseIdParamSchema), 
    validateBody(updateCourseSchema), 
    courseController.updateCourse
); 
router.delete("/:id", 
    requireAdmin, 
    validateParams(courseIdParamSchema), 
    courseController.deleteCourse
); 

// Enrollment management (admin only)
router.put("/enrollments/:enrollmentId", 
    requireAdmin, 
    validateParams(enrollmentIdParamSchema), 
    validateBody(updateEnrollmentSchema), 
    courseController.manageEnrollment
); 

export default router;