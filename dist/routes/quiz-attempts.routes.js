"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const quiz_1 = require("../controller/quiz");
const router = (0, express_1.Router)();
// User routes (authenticated)
router.post('/attempts', auth_middleware_1.requireAuth, quiz_1.submitQuizAttempt);
router.get('/attempts/mine', auth_middleware_1.requireAuth, quiz_1.getMyAttempts);
router.get('/attempts/:id', auth_middleware_1.requireAuth, quiz_1.getAttemptById);
// Admin routes
router.get('/admin/attempts', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, quiz_1.adminGetAllAttempts);
router.get('/admin/stats', auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, quiz_1.adminGetQuizStats);
exports.default = router;
