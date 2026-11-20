import { SPORT_LIBRARY, resolveSport, RECOVERY_ACTIVITIES } from "../data/exerciseLibrary.js";

export const TRANSFORMATION_WEEKS = {
  "1_month": 4,
  "3_months": 13,
  "6_months": 26,
  "1_year": 52,
  "2_years": 104,
};

export function getTotalWeeks(profile) {
  if (profile.transformationLength === "custom") {
    return Math.max(1, Number(profile.customLengthWeeks) || 8);
  }
  return TRANSFORMATION_WEEKS[profile.transformationLength] || 12;
}

// A 6-month progression cycle. Longer journeys repeat the cycle, but each
// repeat is harder (see `cycleNumber` below), so month 7 is not month 1.
export const PHASE_CYCLE = [
  { name: "Foundation", focus: "Learn fundamentals and build consistency.", tier: 1 },
  { name: "Development", focus: "Increase volume and technical difficulty.", tier: 2 },
  { name: "Performance", focus: "Introduce more advanced drills.", tier: 2 },
  { name: "Advanced Skill", focus: "Increase game-specific training.", tier: 3 },
  { name: "Performance Optimization", focus: "More complex combinations and higher intensity.", tier: 3 },
  { name: "Evaluation", focus: "Measure progress and prepare the next phase.", tier: 4 },
];

const DIFFICULTY_LABELS = ["Easy", "Moderate", "Hard", "Very Hard"];
const USER_DIFFICULTY_SHIFT = { easy: -1, moderate: 0, hard: 1, very_hard: 2 };

function ageCap(age) {
  if (!age) return 4;
  if (age < 13) return 1;
  if (age < 16) return 2;
  if (age < 18) return 3;
  return 4;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function estimateExerciseSeconds(ex) {
  if (ex.durationSec) return ex.durationSec + (ex.restSec || 0);
  const sets = ex.sets || 1;
  const perSet = (ex.reps ? ex.reps * 3 : 30) + (ex.restSec || 30);
  return sets * perSet;
}

function scaleExercise(ex, tier) {
  // Progressive overload: later tiers add sets/reps/duration, not just a
  // difficulty label, so months genuinely differ from each other.
  const bump = clamp(tier - 1, 0, 3);
  const scaled = { ...ex };
  if (ex.sets) scaled.sets = ex.sets + Math.floor(bump * 0.6);
  if (ex.reps) scaled.reps = ex.reps + bump * 2;
  if (ex.durationSec) scaled.durationSec = Math.round(ex.durationSec * (1 + bump * 0.15));
  return scaled;
}

function matchGoalsToCategories(goals, categories) {
  const catIds = Object.keys(categories);
  if (!goals || goals.length === 0) return catIds;
  const matched = new Set();
  for (const goal of goals) {
    const g = goal.toLowerCase();
    for (const id of catIds) {
      const label = categories[id].label.toLowerCase();
      if (g.includes(id.toLowerCase()) || g.includes(label) || label.includes(g)) {
        matched.add(id);
      }
    }
  }
  // Free-text custom goals ("I want to become a better shooter") won't match
  // exactly — fall back to a keyword scan across all category labels.
  if (matched.size === 0) {
    for (const goal of goals) {
      const words = goal.toLowerCase().split(/\W+/).filter(Boolean);
      for (const id of catIds) {
        const label = categories[id].label.toLowerCase();
        if (words.some((w) => w.length > 3 && label.includes(w))) matched.add(id);
      }
    }
  }
  return matched.size > 0 ? Array.from(matched) : catIds;
}

function spreadTrainingDays(daysPerWeek) {
  const n = clamp(daysPerWeek, 1, 7);
  if (n === 7) return [0, 1, 2, 3, 4, 5, 6];
  const step = 7 / n;
  const set = new Set();
  for (let i = 0; i < n; i++) set.add(Math.round(i * step) % 7);
  // Fill any collisions by scanning forward for a free slot.
  const result = new Set(set);
  let idx = 0;
  while (result.size < n && idx < 7) {
    if (!result.has(idx)) result.add(idx);
    idx++;
  }
  return Array.from(result).sort((a, b) => a - b);
}

function pickBlocksForDay({ categoryIds, categories, sessionMinutes, equipment, targetDifficulty, seed }) {
  const availEquip = new Set(["none", ...(equipment || [])]);
  const budgetSec = sessionMinutes * 60;
  const warmupSec = clamp(Math.round(sessionMinutes * 0.12) * 60, 300, 720);
  const cooldownSec = 300;
  let remaining = budgetSec - warmupSec - cooldownSec;

  const categoryId = categoryIds[seed % categoryIds.length];
  const category = categories[categoryId];
  const pool = category.exercises.filter(
    (ex) => (ex.equipment || []).every((e) => availEquip.has(e)) || (ex.equipment || []).length === 0
  );
  const sorted = [...pool].sort(
    (a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty)
  );

  const blocks = [
    { name: "Warm-up", instructions: "Light cardio and dynamic stretching to prepare the body.", durationSec: warmupSec, purpose: "Prepares muscles and joints for training.", isWarmup: true },
  ];

  let i = 0;
  let guard = 0;
  while (remaining > 60 && blocks.length < 7 && guard < 20) {
    const ex = sorted[i % sorted.length];
    i++;
    guard++;
    if (!ex) break;
    const scaled = scaleExercise(ex, targetDifficulty);
    const dur = estimateExerciseSeconds(scaled);
    blocks.push({
      name: scaled.name,
      instructions: `Focus on quality technique. ${scaled.purpose}`,
      sets: scaled.sets,
      reps: scaled.reps,
      durationSec: scaled.durationSec,
      restSec: scaled.restSec ?? 30,
      purpose: scaled.purpose,
      difficulty: DIFFICULTY_LABELS[clamp(ex.difficulty, 1, 4) - 1],
    });
    remaining -= dur;
  }

  blocks.push({ name: "Cool Down", instructions: "Static stretching and easy breathing to recover.", durationSec: cooldownSec, purpose: "Aids recovery and reduces soreness.", isCooldown: true });

  return { blocks, categoryLabel: category.label };
}

function generateDay({ profile, dayIndex, isTrainingDay, dayKindIfRest, categoryIds, categories, targetDifficulty, seed, sportLabel }) {
  if (!isTrainingDay) {
    if (dayKindIfRest === "recovery") {
      const acts = RECOVERY_ACTIVITIES.slice(0, 2);
      return {
        dayIndex,
        type: "recovery",
        title: "Active Recovery",
        durationMin: Math.round(acts.reduce((s, a) => s + a.durationSec, 0) / 60),
        difficulty: "Easy",
        blocks: acts.map((a) => ({ name: a.name, instructions: a.purpose, durationSec: a.durationSec, purpose: a.purpose })),
      };
    }
    return { dayIndex, type: "rest", title: "Rest Day", durationMin: 0, difficulty: "—", blocks: [] };
  }

  const { blocks, categoryLabel } = pickBlocksForDay({
    categoryIds,
    categories,
    sessionMinutes: profile.sessionMinutes || 45,
    equipment: profile.equipment,
    targetDifficulty,
    seed,
  });

  return {
    dayIndex,
    type: "training",
    title: `${sportLabel} — ${categoryLabel} Development`,
    durationMin: profile.sessionMinutes || 45,
    difficulty: DIFFICULTY_LABELS[clamp(targetDifficulty, 1, 4) - 1],
    category: categoryLabel,
    blocks,
  };
}

function generateWeek({ profile, monthIndex, weekIndex, phaseTier, cycleNumber, categoryIds, categories, sportLabel, globalWeekIndex }) {
  const trainingIdx = new Set(spreadTrainingDays(profile.daysPerWeek || 3));
  const userShift = USER_DIFFICULTY_SHIFT[profile.difficulty] ?? 0;
  const cap = ageCap(profile.age);
  const targetDifficulty = clamp(phaseTier + userShift + Math.floor(cycleNumber / 1), 1, cap);

  const nonTrainingCount = 7 - trainingIdx.size;
  let recoveriesLeft = profile.daysPerWeek >= 5 ? Math.max(0, nonTrainingCount - 1) : 0;

  const days = [];
  for (let d = 0; d < 7; d++) {
    const isTraining = trainingIdx.has(d);
    let restKind = "rest";
    if (!isTraining && recoveriesLeft > 0) {
      restKind = "recovery";
      recoveriesLeft--;
    }
    const seed = globalWeekIndex * 7 + d;
    days.push(
      generateDay({
        profile,
        dayIndex: d,
        isTrainingDay: isTraining,
        dayKindIfRest: restKind,
        categoryIds,
        categories,
        targetDifficulty,
        seed,
        sportLabel,
      })
    );
  }
  return { weekIndex, days };
}

export function generatePlan(profile) {
  const totalWeeks = getTotalWeeks(profile);
  const sport = resolveSport(profile.sport);
  const categoryIds = matchGoalsToCategories(profile.goals, sport.categories);

  const months = [];
  let weeksSoFar = 0;
  let monthIndex = 0;
  let globalWeekIndex = 0;

  while (weeksSoFar < totalWeeks) {
    const weeksInMonth = Math.min(4, totalWeeks - weeksSoFar);
    const cycleNumber = Math.floor(monthIndex / PHASE_CYCLE.length);
    const phase = PHASE_CYCLE[monthIndex % PHASE_CYCLE.length];

    const weeks = [];
    for (let w = 0; w < weeksInMonth; w++) {
      weeks.push(
        generateWeek({
          profile,
          monthIndex,
          weekIndex: w,
          phaseTier: phase.tier,
          cycleNumber,
          categoryIds,
          categories: sport.categories,
          sportLabel: sport.label,
          globalWeekIndex,
        })
      );
      globalWeekIndex++;
    }

    months.push({ monthIndex, name: phase.name, focus: phase.focus, weeks });
    weeksSoFar += weeksInMonth;
    monthIndex++;
  }

  return {
    sport: sport.label,
    sportId: sport.id,
    totalWeeks,
    startDate: new Date().toISOString(),
    months,
    generatedAt: new Date().toISOString(),
  };
}

// --- Helpers for locating "today" inside a generated plan -----------------

export function planDayCount(plan) {
  return plan.months.reduce((sum, m) => sum + m.weeks.length * 7, 0);
}

export function getDayByOffset(plan, offsetDays) {
  let remaining = offsetDays;
  for (const month of plan.months) {
    for (const week of month.weeks) {
      if (remaining < 7) {
        return { month, week, day: week.days[remaining], offsetDays };
      }
      remaining -= 7;
    }
  }
  const lastMonth = plan.months[plan.months.length - 1];
  const lastWeek = lastMonth.weeks[lastMonth.weeks.length - 1];
  return { month: lastMonth, week: lastWeek, day: lastWeek.days[6], offsetDays: planDayCount(plan) - 1, finished: true };
}

export function todayOffset(plan) {
  const start = new Date(plan.startDate);
  const now = new Date();
  const diffMs = now.setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0);
  return Math.max(0, Math.round(diffMs / 86400000));
}

export function getCurrentWeekDays(plan) {
  const offset = todayOffset(plan);
  const weekStart = offset - (offset % 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push({ ...getDayByOffset(plan, weekStart + i), offsetDays: weekStart + i });
  }
  return days;
}

export const DIFFICULTY_LABEL_LIST = DIFFICULTY_LABELS;
