import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import apiRoutes from "./routes";
import { requestLogger, errorLogger, errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();
const port = 8000;

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger);
}

// Configure CORS for frontend integration
app.use(cors({
    origin: true, // Allow all origins for testing (change in production)
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
}));

// Better Auth handler (must come before express.json())
app.all("/api/auth/*splat", toNodeHandler(auth));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use("/api", apiRoutes);

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);
app.use(notFoundHandler);

app.listen(port, () => {
	console.log(`🚀 StudyBuddy Server running on port ${port}`);
	console.log(`📚 API Documentation: http://localhost:${port}/api`);
	console.log(`🔐 Auth Endpoints: http://localhost:${port}/api/auth/*`);
	console.log(`💊 Health Check: http://localhost:${port}/api/health`);
});