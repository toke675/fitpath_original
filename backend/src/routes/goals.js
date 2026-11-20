import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  res.json(await prisma.goal.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "desc" } }));
});

router.post("/", async (req, res) => {
  const { label, metric, targetValue, currentValue, targetDate } = req.body;
  const goal = await prisma.goal.create({
    data: { userId: req.userId, label, metric, targetValue, currentValue, targetDate: targetDate ? new Date(targetDate) : null },
  });
  res.json(goal);
});

router.put("/:id", async (req, res) => {
  const goal = await prisma.goal.update({ where: { id: req.params.id }, data: req.body });
  res.json(goal);
});

router.delete("/:id", async (req, res) => {
  await prisma.goal.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
