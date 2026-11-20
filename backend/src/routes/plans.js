import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { generatePlan, getCurrentWeekDays, getDayByOffset, todayOffset } from "../lib/planGenerator.js";

const router = Router();
router.use(requireAuth);

// Generates a plan from the user's saved profile and persists its
// months/weeks/days structure so the schedule can be browsed and edited.
router.post("/generate", async (req, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
  if (!profile) return res.status(400).json({ error: "Complete onboarding before generating a plan." });

  const plan = generatePlan(profile);

  const created = await prisma.trainingPlan.create({
    data: {
      userId: req.userId,
      sport: plan.sport,
      totalWeeks: plan.totalWeeks,
      phases: {
        create: plan.months.map((m) => ({
          monthIndex: m.monthIndex,
          name: m.name,
          focus: m.focus,
          weeks: {
            create: m.weeks.map((w) => ({
              weekIndex: w.weekIndex,
              days: {
                create: w.days.map((d) => ({
                  dayIndex: d.dayIndex,
                  type: d.type,
                  title: d.title,
                  durationMin: d.durationMin,
                  difficulty: d.difficulty,
                  blocksJson: d.blocks,
                })),
              },
            })),
          },
        })),
      },
    },
    include: { phases: { include: { weeks: { include: { days: true } } } } },
  });

  res.json(created);
});

router.get("/active", async (req, res) => {
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: req.userId, status: "active" },
    orderBy: { createdAt: "desc" },
    include: { phases: { include: { weeks: { include: { days: true } } } } },
  });
  res.json(plan);
});

export default router;
