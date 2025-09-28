import express from "express";
import userRoutes from "./user.routes";
import courseRoutes from "./course.routes";
import quizRoutes from "./quiz.routes";
// Import other route modules here as you create them

const router = express.Router();

// Mount route modules
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/quizzes", quizRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        service: "StudyBuddy API",
        uptime: process.uptime(),
    });
});

// API info endpoint
router.get("/", (req, res) => {
    res.json({
        message: "StudyBuddy API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth/* - Authentication endpoints (Better Auth)",
            users: "/api/users - User management endpoints",
            courses: "/api/courses - Course management endpoints", 
            health: "/api/health - Health check endpoint"
        },
        features: [
            "Email/Password Authentication",
            "User Management",
            "Study Session Tracking", 
            "Course Management",
            "Admin Panel Support"
        ]
    });
});

export default router;