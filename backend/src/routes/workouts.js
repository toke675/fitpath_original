import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.post("/start", async (req, res) => {
  const { dayId } = req.body;
  const session = await prisma.workoutSession.create({ data: { userId: req.userId, dayId, status: "in_progress" } });
  res.json(session);
});

router.post("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const { durationSec, perceivedDifficulty, notes, exercises } = req.body;
  const session = await prisma.workoutSession.update({
    where: { id },
    data: {
      status: "completed",
      completedAt: new Date(),
      durationSec,
      perceivedDifficulty,
      notes,
      exercises: {
        create: (exercises || []).map((e) => ({
          name: e.name,
          setsCompleted: e.setsCompleted || 0,
          setsTarget: e.setsTarget,
          repsCompleted: e.repsCompleted,
          repsTarget: e.repsTarget,
        })),
      },
    },
  });
  res.json(session);
});

router.post("/:id/skip", async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const session = await prisma.workoutSession.update({
    where: { id },
    data: { status: "skipped", notes: reason },
  });
  res.json(session);
});

router.get("/history", async (req, res) => {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: req.userId },
    orderBy: { startedAt: "desc" },
    include: { exercises: true },
    take: 100,
  });
  res.json(sessions);
});

export default router;
