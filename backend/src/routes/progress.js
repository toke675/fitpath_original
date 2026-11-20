import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.post("/performance", async (req, res) => {
  const { sport, metric, value, unit } = req.body;
  const record = await prisma.performanceRecord.create({ data: { userId: req.userId, sport, metric, value, unit } });
  res.json(record);
});

router.get("/performance", async (req, res) => {
  const { metric } = req.query;
  const records = await prisma.performanceRecord.findMany({
    where: { userId: req.userId, ...(metric ? { metric } : {}) },
    orderBy: { recordedAt: "asc" },
  });
  res.json(records);
});

router.get("/summary", async (req, res) => {
  const [completed, total] = await Promise.all([
    prisma.workoutSession.count({ where: { userId: req.userId, status: "completed" } }),
    prisma.workoutSession.count({ where: { userId: req.userId } }),
  ]);
  const consistency = total > 0 ? Math.round((completed / total) * 100) : 0;
  res.json({ completedWorkouts: completed, totalSessions: total, consistency });
});

export default router;
