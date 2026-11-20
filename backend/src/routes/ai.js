import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

const SYSTEM_PROMPT = `You are the FitPath AI Coach, embedded in a sports training app for young athletes aged 12–18.
Speak in a friendly, encouraging, age-appropriate way.
You know the athlete's sport, goals, experience level, equipment, and current
training plan (given to you as context below). Help them understand today's
workout, adapt it to real constraints ("I only have 30 minutes", "no gym
today", "I missed yesterday"), and explain drills clearly.

Rules:
- Never provide medical diagnoses or treatment advice. If something sounds
  like an injury or medical concern, tell the athlete to see a doctor or
  athletic trainer instead of guessing.
- Never recommend unsafe training (extreme calorie restriction, training
  through pain, ignoring recovery, or intensity inappropriate for the
  athlete's stated age/experience).
- Never give weight-loss, dieting, or body-image advice. If the athlete asks about losing weight,
  gently say you focus on skills, strength, and energy for sport, and suggest talking with a
  parent/guardian, doctor, or registered dietitian.
- Encourage sleep, rest days, fun, and fueling well for growth and training.
- Keep answers practical and specific to their plan, not generic fitness
  trivia.`;

router.post("/chat", async (req, res) => {
  const { message, planContext, history } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.json({
      reply:
        "The AI Coach isn't connected yet — add ANTHROPIC_API_KEY to backend/.env to enable real answers. " +
        "For now: tell me your constraint (time, equipment, missed day) and I'll echo how FitPath would " +
        "adapt your plan once this is wired up.",
    });
  }

  try {
    const contextBlock = planContext ? `\n\nAthlete context:\n${JSON.stringify(planContext).slice(0, 4000)}` : "";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: SYSTEM_PROMPT + contextBlock,
        messages: [...(history || []), { role: "user", content: message }],
      }),
    });
    const data = await response.json();
    const reply = data?.content?.find((c) => c.type === "text")?.text || "Sorry, I couldn't generate a reply.";

    await prisma.aIConversation.createMany({
      data: [
        { userId: req.userId, role: "user", content: message },
        { userId: req.userId, role: "assistant", content: reply },
      ],
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI Coach request failed.", detail: String(err) });
  }
});

router.get("/history", async (req, res) => {
  const rows = await prisma.aIConversation.findMany({ where: { userId: req.userId }, orderBy: { createdAt: "asc" } });
  res.json(rows);
});

const FOOD_SYSTEM_PROMPT = `You analyze a photo of food for the FitPath app. Estimate calories and
macros (protein, carbs, fat) for what's visible, and give one short, kind
sentence on whether it fits the athlete's current goal and training phase
(given as context). This is a rough visual estimate, not a lab measurement —
say so. Never shame the athlete's choice, never prescribe a strict diet, and
never suggest extreme restriction. All FitPath athletes are young people (12–18): keep the framing supportive,
focus on fueling energy, growth and recovery, and never mention weight loss,
calorie cutting, or body size.

Respond ONLY with strict JSON, no markdown fences, no extra text, in this
exact shape:
{"foodGuess":"short name","calories":number,"proteinG":number,"carbsG":number,"fatG":number,"verdict":"one short sentence","note":"one short disclaimer sentence"}`;

router.post("/food-scan", async (req, res) => {
  const { imageBase64, mediaType, context } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: "AI food scanning isn't connected yet — add ANTHROPIC_API_KEY to backend/.env to enable it.",
    });
  }
  if (!imageBase64) return res.status(400).json({ error: "No image provided." });

  try {
    const contextBlock = context ? `\n\nAthlete context:\n${JSON.stringify(context).slice(0, 2000)}` : "";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 400,
        system: FOOD_SYSTEM_PROMPT + contextBlock,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 } },
              { type: "text", text: "What is this food, roughly how many calories/macros, and does it fit my goal?" },
            ],
          },
        ],
      }),
    });
    const data = await response.json();
    const raw = data?.content?.find((c) => c.type === "text")?.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return res.status(502).json({ error: "Could not parse the AI's analysis. Try another photo." });
    }
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: "Food scan request failed.", detail: String(err) });
  }
});

export default router;
