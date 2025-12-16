import express from "express";
import userRoutes from "./user.routes";
import courseRoutes from "./course.routes";
import questionRoutes from "./question.routes";
import packageRoutes from "./package.routes";
import bundleRoutes from "./bundle.routes";
import purchaseRoutes from "./purchase.routes";
import quizAttemptsRoutes from "./quiz-attempts.routes";
import referralRoutes from "./referral.routes";
import debugRoutes from "./debug.permissions";
import adminPermissionsRoutes from "./admin.permissions";
// Import other route modules here as you create them

const router = express.Router();

// Mount route modules
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/packages", packageRoutes);
router.use("/bundles", bundleRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/quiz", quizAttemptsRoutes);
router.use("/referral-codes", referralRoutes);
router.use('/debug', debugRoutes);
router.use('/admin', adminPermissionsRoutes);
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
            packages: "/api/packages - Package management endpoints",
            bundles: "/api/bundles - Bundle management endpoints",
            purchases: "/api/purchases - Purchase management endpoints",
            referralCodes: "/api/referral-codes - Referral code management endpoints",
            health: "/api/health - Health check endpoint"
        },
        features: [
            "Email/Password Authentication",
            "User Management",
            "Study Session Tracking", 
            "Course Management",
            "Question Management",
            "Package & Bundle System",
            "Referral Code Discounts",
            "Admin Panel Support"
        ]
    });
});

export default router;