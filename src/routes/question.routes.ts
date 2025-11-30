import express from "express";
import { normalizeRichTextFields } from "../middleware/richtext.middleware";
import { questionController } from "../controller/question";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { 
    validateBody, 
    validateQuery, 
    validateParams 
} from "../lib/validators/validation.middleware";
import {
    createQuestionSchema,
    updateQuestionSchema,
    questionQuerySchema,
    questionCourseIdParamSchema,
    questionIdParamSchema
} from "../lib/validators/question.validator";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Use shared middleware to normalize and validate rich-text fields
const normalizeQuestionText = normalizeRichTextFields(
    [
        { key: "text", required: true },
        { key: "explanation", required: false },
    ],
    { maxPlainTextChars: 2000 }
);

// Course question routes
router.get("/courses/:id/questions", 
    validateParams(questionCourseIdParamSchema),
    validateQuery(questionQuerySchema), 
    questionController.getCourseQuestions
);

router.post("/courses/:id/questions", 
    requireAdmin,
    validateParams(questionCourseIdParamSchema),
    validateBody(createQuestionSchema),
    normalizeQuestionText,
    questionController.createQuestion
);

router.get("/courses/:id/questions/stats", 
    requireAdmin,
    validateParams(questionCourseIdParamSchema), 
    questionController.getCourseQuestionStats
);

// Individual question routes
router.get("/questions/:id", 
    validateParams(questionIdParamSchema), 
    questionController.getQuestionById
);

router.put("/questions/:id", 
    requireAdmin,
    validateParams(questionIdParamSchema),
    validateBody(updateQuestionSchema),
    normalizeQuestionText,
    questionController.updateQuestion
);

router.delete("/questions/:id", 
    requireAdmin,
    validateParams(questionIdParamSchema), 
    questionController.deleteQuestion
);

export default router;