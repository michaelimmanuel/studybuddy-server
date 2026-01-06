import express from "express";
import { getDashboardSummary } from "../controller/dashboard";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", requireAuth, getDashboardSummary);

export default router;
