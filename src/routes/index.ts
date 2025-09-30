import express from "express";
import userRoutes from "./user.routes";
import courseRoutes from "./course.routes";
import questionRoutes from "./question.routes";
// Import other route modules here as you create them

const router = express.Router();

// Mount route modules
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/", questionRoutes); // Mount question routes at root level for /courses/:id/questions

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
            questions: "/api/courses/:id/questions - Course questions endpoints",
            questionsById: "/api/questions/:id - Individual question endpoints",
            health: "/api/health - Health check endpoint"
        },
        features: [
            "Email/Password Authentication",
            "User Management",
            "Study Session Tracking", 
            "Course Management",
            "Question Management",
            "Admin Panel Support"
        ]
    });
});

export default router;