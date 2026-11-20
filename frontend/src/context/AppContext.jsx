import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { generatePlan, getDayByOffset, todayOffset, getCurrentWeekDays } from "../lib/planGenerator.js";
import { computeSchedule } from "../lib/scheduleAI.js";

const STORAGE_KEY = "fitpath_state_v1";
const FREE_MISS_LIMIT = 3;

const defaultState = {
  profile: null,
  plan: null,
  logs: {}, // offsetDays -> { status: 'completed'|'skipped', perceivedDifficulty, notes, exercises, completedAt }
  goals: [],
  performance: [], // { id, metric, value, unit, date }
  streak: 0,
  subscription: { plan: "free" },
};

// A missed workout = a training day, in the current real-world month, that
// has already passed without being completed. Days the athlete proactively
// moved/shortened/rescheduled aren't counted against them — only days that
// were skipped outright or simply left untouched.
function countMissedThisMonth(plan, logs) {
  if (!plan) return 0;
  const start = new Date(plan.startDate);
  const now = new Date();
  const todayOff = todayOffset(plan);
  let missed = 0;
  for (let off = 0; off < todayOff; off++) {
    const date = new Date(start);
    date.setDate(date.getDate() + off);
    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) continue;
    const { day } = getDayByOffset(plan, off);
    if (day.type !== "training") continue;
    const log = logs[off];
    if (log?.status === "completed") continue;
    if (log?.action === "move" || log?.action === "shorten" || log?.action === "reschedule") continue;
    missed++;
  }
  return missed;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const st = { ...defaultState, ...JSON.parse(raw) };
    // Weight-loss goals were removed — clean up any older saved profile.
    if (st.profile) {
      const goals = (st.profile.goals || []).filter((g) => !/weight loss|lose weight/i.test(g));
      const sport = /^general fitness$/i.test(st.profile.sport || "") ? "General Athletic Development" : st.profile.sport;
      st.profile = { ...st.profile, goals, sport };
    }
    return st;
  } catch {
    return defaultState;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveProfile = (profile) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...profile } }));
  };

  const generate = () => {
    setState((s) => {
      if (!s.profile) return s;
      // The AI decides wake/sleep/training times from work-school hours
      // rather than the athlete picking them, so the schedule never
      // collides with a busy block.
      const schedule = computeSchedule(s.profile);
      const profile = { ...s.profile, ...schedule };
      const plan = generatePlan(profile);
      return { ...s, profile, plan, logs: {} };
    });
  };

  const regenerate = () => generate();

  const upgradeToPremium = () => setState((s) => ({ ...s, subscription: { plan: "premium" } }));
  const downgradeToFree = () => setState((s) => ({ ...s, subscription: { plan: "free" } }));

  const logWorkout = (offsetDays, entry) => {
    setState((s) => {
      const logs = { ...s.logs, [offsetDays]: { ...entry, completedAt: new Date().toISOString() } };
      let streak = 0;
      let cursor = todayOffset(s.plan);
      while (logs[cursor]?.status === "completed") {
        streak++;
        cursor--;
      }
      return { ...s, logs, streak };
    });
  };

  const handleMissed = (offsetDays, action, payload = {}) => {
    setState((s) => ({
      ...s,
      logs: { ...s.logs, [offsetDays]: { status: "skipped", action, ...payload, completedAt: new Date().toISOString() } },
    }));
  };

  const addGoal = (goal) => {
    setState((s) => ({ ...s, goals: [{ id: crypto.randomUUID(), status: "active", currentValue: 0, ...goal }, ...s.goals] }));
  };

  const updateGoal = (id, patch) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
  };

  const deleteGoal = (id) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  };

  const logPerformance = (record) => {
    setState((s) => ({
      ...s,
      performance: [...s.performance, { id: crypto.randomUUID(), date: new Date().toISOString(), ...record }],
    }));
  };

  const resetAll = () => setState(defaultState);

  const derived = useMemo(() => {
    if (!state.plan) return {};
    const offset = todayOffset(state.plan);
    const today = getDayByOffset(state.plan, offset);
    const week = getCurrentWeekDays(state.plan);
    const totalDays = state.plan.months.reduce((n, m) => n + m.weeks.length * 7, 0);
    const completedCount = Object.values(state.logs).filter((l) => l.status === "completed").length;
    const totalTrainingDaysSoFar = week.filter((d) => d.day.type === "training" && d.offsetDays <= offset).length;
    const consistency = totalTrainingDaysSoFar > 0
      ? Math.round(
          (week.filter((d) => d.day.type === "training" && d.offsetDays <= offset && state.logs[d.offsetDays]?.status === "completed").length /
            totalTrainingDaysSoFar) *
            100
        )
      : 0;
    const monthNumber = today.month.monthIndex + 1;
    const totalMonths = state.plan.months.length;
    const missedThisMonth = countMissedThisMonth(state.plan, state.logs);
    return { offset, today, week, totalDays, completedCount, consistency, monthNumber, totalMonths, missedThisMonth };
  }, [state.plan, state.logs]);

  const isPremium = state.subscription?.plan === "premium";
  const isLocked = !isPremium && (derived.missedThisMonth || 0) >= FREE_MISS_LIMIT;

  const value = {
    ...state,
    ...derived,
    isPremium,
    isLocked,
    freeMissLimit: FREE_MISS_LIMIT,
    saveProfile,
    generate,
    regenerate,
    logWorkout,
    handleMissed,
    addGoal,
    updateGoal,
    deleteGoal,
    logPerformance,
    resetAll,
    upgradeToPremium,
    downgradeToFree,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
