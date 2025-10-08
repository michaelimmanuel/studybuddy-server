"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const question_1 = require("../controller/question");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../lib/validators/validation.middleware");
const question_validator_1 = require("../lib/validators/question.validator");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_middleware_1.requireAuth);
// Course question routes
router.get("/courses/:id/questions", (0, validation_middleware_1.validateParams)(question_validator_1.questionCourseIdParamSchema), (0, validation_middleware_1.validateQuery)(question_validator_1.questionQuerySchema), question_1.questionController.getCourseQuestions);
router.post("/courses/:id/questions", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(question_validator_1.questionCourseIdParamSchema), (0, validation_middleware_1.validateBody)(question_validator_1.createQuestionSchema), question_1.questionController.createQuestion);
router.get("/courses/:id/questions/stats", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(question_validator_1.questionCourseIdParamSchema), question_1.questionController.getCourseQuestionStats);
// Individual question routes
router.get("/questions/:id", (0, validation_middleware_1.validateParams)(question_validator_1.questionIdParamSchema), question_1.questionController.getQuestionById);
router.put("/questions/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(question_validator_1.questionIdParamSchema), (0, validation_middleware_1.validateBody)(question_validator_1.updateQuestionSchema), question_1.questionController.updateQuestion);
router.delete("/questions/:id", auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(question_validator_1.questionIdParamSchema), question_1.questionController.deleteQuestion);
exports.default = router;
