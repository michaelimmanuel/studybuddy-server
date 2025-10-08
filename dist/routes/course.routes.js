"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_1 = require("../controller/course");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../lib/validators/validation.middleware");
const course_validator_1 = require("../lib/validators/course.validator");
const router = express_1.default.Router();
// Public routes
router.get("/", (0, validation_middleware_1.validateQuery)(course_validator_1.coursesQuerySchema), course_1.courseController.getAllCourses);
// Admin stats route (must come before /:id route)
router.get("/stats", auth_middleware_1.requireAdmin, course_1.courseController.getCourseStats);
router.get("/:id", (0, validation_middleware_1.validateParams)(course_validator_1.courseIdParamSchema), course_1.courseController.getCourseById);
// Admin-only routes
router.post("/", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateBody)(course_validator_1.createCourseSchema), course_1.courseController.createCourse);
router.put("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(course_validator_1.courseIdParamSchema), (0, validation_middleware_1.validateBody)(course_validator_1.updateCourseSchema), course_1.courseController.updateCourse);
router.delete("/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(course_validator_1.courseIdParamSchema), course_1.courseController.deleteCourse);
exports.default = router;
