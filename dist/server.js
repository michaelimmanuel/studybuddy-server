"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); // Add this import
const node_1 = require("better-auth/node");
const auth_1 = require("./lib/auth");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const port = 8000;
// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(error_middleware_1.requestLogger);
}
// Configure CORS for frontend integration
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://studybuddymeds.com",
        "https://www.studybuddymeds.com", // Your frontend domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "Access-Control-Allow-Credentials"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
}));
// Add cookie parser middleware BEFORE Better Auth
app.use((0, cookie_parser_1.default)());
// Better Auth handler (must come before express.json())
app.all("/api/auth/*splat", (0, node_1.toNodeHandler)(auth_1.auth));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Mount API routes
app.use("/api", routes_1.default);
// Error handling middleware (must be last)
app.use(error_middleware_1.errorLogger);
app.use(error_middleware_1.errorHandler);
app.use(error_middleware_1.notFoundHandler);
app.listen(port, () => {
    console.log(`🚀 StudyBuddy Server running on port ${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`🔐 Auth Endpoints: http://localhost:${port}/api/auth/*`);
    console.log(`💊 Health Check: http://localhost:${port}/api/health`);
});
