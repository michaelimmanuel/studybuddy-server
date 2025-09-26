import express from "express";
// import { courseController } from "../controller/course";

const router = express.Router();

// Course CRUD operations
// router.get("/", courseController.getAllCourses);               // GET /api/courses
// router.post("/", courseController.createCourse);              // POST /api/courses
// router.get("/:id", courseController.getCourseById);           // GET /api/courses/:id
// router.put("/:id", courseController.updateCourse);            // PUT /api/courses/:id
// router.delete("/:id", courseController.deleteCourse);         // DELETE /api/courses/:id

// Course enrollment
// router.post("/:id/enroll", courseController.enrollUser);      // POST /api/courses/:id/enroll
// router.delete("/:id/unenroll", courseController.unenrollUser); // DELETE /api/courses/:id/unenroll
// router.get("/:id/students", courseController.getCourseStudents); // GET /api/courses/:id/students

// Course content
// router.get("/:id/lessons", courseController.getCourseLessons); // GET /api/courses/:id/lessons
// router.post("/:id/lessons", courseController.addLesson);      // POST /api/courses/:id/lessons

// User's courses
// router.get("/user/:userId", courseController.getUserCourses); // GET /api/courses/user/:userId

// Placeholder route
router.get("/", (req, res) => {
    res.json({
        message: "Course routes - Coming soon!",
        availableEndpoints: [
            "GET /api/courses - Get all courses",
            "POST /api/courses - Create course",
            "GET /api/courses/:id - Get course by ID",
            "PUT /api/courses/:id - Update course",
            "DELETE /api/courses/:id - Delete course",
            "POST /api/courses/:id/enroll - Enroll user in course",
            "DELETE /api/courses/:id/unenroll - Unenroll user from course",
            "GET /api/courses/:id/students - Get course students",
            "GET /api/courses/:id/lessons - Get course lessons",
            "POST /api/courses/:id/lessons - Add lesson to course",
            "GET /api/courses/user/:userId - Get user's courses"
        ]
    });
});

export default router;