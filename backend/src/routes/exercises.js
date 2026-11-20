import { Router } from "express";
import { SPORT_LIBRARY } from "../data/exerciseLibrary.js";

const router = Router();

// Flattens the sport library into a searchable/filterable list, mirroring
// the frontend's Exercise Library page. In production, seed these rows
// into the Exercise table instead and query Prisma here.
router.get("/", (req, res) => {
  const { sport, difficulty, equipment, q } = req.query;
  const rows = [];
  for (const [sportId, sportDef] of Object.entries(SPORT_LIBRARY)) {
    for (const [catId, cat] of Object.entries(sportDef.categories)) {
      for (const ex of cat.exercises) {
        rows.push({ sportId, sport: sportDef.label, category: cat.label, ...ex });
      }
    }
  }
  let filtered = rows;
  if (sport) filtered = filtered.filter((r) => r.sportId === sport);
  if (difficulty) filtered = filtered.filter((r) => String(r.difficulty) === String(difficulty));
  if (equipment) filtered = filtered.filter((r) => (r.equipment || []).includes(equipment));
  if (q) filtered = filtered.filter((r) => r.name.toLowerCase().includes(String(q).toLowerCase()));
  res.json(filtered);
});

export default router;
