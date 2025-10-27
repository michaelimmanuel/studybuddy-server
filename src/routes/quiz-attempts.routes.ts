import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import {
  submitQuizAttempt,
  getMyAttempts,
  getAttemptById,
  adminGetAllAttempts,
  adminGetQuizStats
} from '../controller/quiz';

const router = Router();

// User routes (authenticated)
router.post('/attempts', requireAuth, submitQuizAttempt);
router.get('/attempts/mine', requireAuth, getMyAttempts);
router.get('/attempts/:id', requireAuth, getAttemptById);

// Admin routes
router.get('/admin/attempts', requireAuth, requireAdmin, adminGetAllAttempts);
router.get('/admin/stats', requireAuth, requireAdmin, adminGetQuizStats);

export default router;
