"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./user.routes"));
const course_routes_1 = __importDefault(require("./course.routes"));
const question_routes_1 = __importDefault(require("./question.routes"));
const package_routes_1 = __importDefault(require("./package.routes"));
// Import other route modules here as you create them
const router = express_1.default.Router();
// Mount route modules
router.use("/users", user_routes_1.default);
router.use("/courses", course_routes_1.default);
router.use("/packages", package_routes_1.default);
router.use("/", question_routes_1.default); // Mount question routes at root level for /courses/:id/questions
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
exports.default = router;
