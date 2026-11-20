import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const profile = await prisma.userProfile.findUnique({ where: { userId: req.userId } });
  res.json(profile);
});

router.put("/", async (req, res) => {
  const data = req.body;
  const profile = await prisma.userProfile.upsert({
    where: { userId: req.userId },
    update: data,
    create: { ...data, userId: req.userId },
  });
  res.json(profile);
});

export default router;
