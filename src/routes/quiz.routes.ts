import express from "express";
import { quizController } from "../controller/quiz";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.middleware";
import { 
    validateBody, 
    validateQuery, 
    validateParams 
} from "../lib/validators/validation.middleware";
import {
    createQuizSchema,
    updateQuizSchema,
    updateQuizQuestionsSchema,
    submitQuizSchema,
    quizIdParamSchema,
    quizCourseIdParamSchema,
    quizQuerySchema
} from "../lib/validators/quiz.validator";

const router = express.Router();

// Public routes (with authentication)
router.use(requireAuth); // All quiz routes require authentication

// Course quiz routes
router.get("/course/:courseId", 
    validateParams(quizCourseIdParamSchema),
    validateQuery(quizQuerySchema), 
    quizController.getCourseQuizzes
);

// Quiz management routes
router.get("/:id", 
    validateParams(quizIdParamSchema), 
    quizController.getQuizById
);

router.post("/:id/submit", 
    validateParams(quizIdParamSchema),
    validateBody(submitQuizSchema), 
    quizController.submitQuiz
);

// Admin-only routes
router.post("/", 
    requireAdmin,
    validateBody(createQuizSchema), 
    quizController.createQuiz
);

router.put("/:id", 
    requireAdmin,
    validateParams(quizIdParamSchema),
    validateBody(updateQuizSchema), 
    quizController.updateQuiz
);

router.put("/:id/questions", 
    requireAdmin,
    validateParams(quizIdParamSchema),
    validateBody(updateQuizQuestionsSchema), 
    quizController.updateQuizQuestions
);

router.delete("/:id", 
    requireAdmin,
    validateParams(quizIdParamSchema), 
    quizController.deleteQuiz
);

router.get("/:id/submissions", 
    requireAdmin,
    validateParams(quizIdParamSchema), 
    quizController.getQuizSubmissions
);

export default router;