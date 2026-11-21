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

// Optional numbers coming from the AI Form Coach: keep them as whole numbers.
const toInt = (v) => (Number.isFinite(Number(v)) && v !== null && v !== "" ? Math.round(Number(v)) : undefined);
const toScore = (v) => {
  const n = toInt(v);
  return n === undefined ? undefined : Math.min(100, Math.max(0, n));
};

router.post("/:id/complete", async (req, res) => {
  const { id } = req.params;
  const { durationSec, perceivedDifficulty, notes, exercises, formScore } = req.body;
  const session = await prisma.workoutSession.update({
    where: { id },
    data: {
      status: "completed",
      completedAt: new Date(),
      durationSec,
      perceivedDifficulty,
      notes,
      formScore: toScore(formScore),
      exercises: {
        create: (exercises || []).map((e) => ({
          name: e.name,
          setsCompleted: e.setsCompleted || 0,
          setsTarget: e.setsTarget,
          repsCompleted: e.repsCompleted,
          repsTarget: e.repsTarget,
          heldSec: toInt(e.heldSec),
          formScore: toScore(e.formScore),
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
