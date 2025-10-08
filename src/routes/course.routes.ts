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
    coursesQuerySchema,
    courseIdParamSchema
} from "../lib/validators/course.validator";

const router = express.Router();

// Public routes
router.get("/", 
    validateQuery(coursesQuerySchema), 
    courseController.getAllCourses
);

// Admin stats route (must come before /:id route)
router.get("/stats", requireAdmin, courseController.getCourseStats);

router.get("/:id", 
    validateParams(courseIdParamSchema), 
    courseController.getCourseById
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

export default router;