export const API_URL = import.meta.env.VITE_API_URL || null;

function getToken() {
  return localStorage.getItem("fitpath_token");
}

export async function apiRequest(path, { method = "GET", body } = {}) {
  if (!API_URL) throw new Error("No backend configured (VITE_API_URL unset) — running in local mode.");
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// A small, honest rule-based fallback so the AI Coach still feels useful
// with no backend/API key configured. It reads the athlete's real plan
// context and reacts to the same trigger phrases the product spec calls
// out (time constraints, missing equipment, missed workouts).
export function localCoachReply(message, ctx) {
  const m = message.toLowerCase();
  const today = ctx?.today;

  if (/\b(\d+)\s*min/.test(m) && today) {
    const mins = parseInt(m.match(/(\d+)\s*min/)[1], 10);
    return `Got it — with only ${mins} minutes today, keep the warm-up short (3-4 min), do the first ` +
      `1-2 blocks of "${today.title}" at full effort, and skip or shorten the rest. Consistency over completeness: ` +
      `a trimmed session still beats skipping the day.`;
  }
  if (/no (gym|court|equipment|access)|don't have (a|access)/.test(m)) {
    return `No problem. Swap any equipment-based blocks in today's session for a bodyweight or footwork/technique ` +
      `equivalent from the same category — the goal (${today?.category || "your current focus"}) stays the same, ` +
      `only the tool changes.`;
  }
  if (/missed|skip(ped)? (yesterday|a day)/.test(m)) {
    return `Missing one day won't derail your plan. Don't try to "double up" tomorrow — just pick up with today's ` +
      `scheduled session as normal. If it becomes a pattern, consider moving to fewer, more consistent training days.`;
  }
  if (/hurt|pain|injur|sore\b/.test(m)) {
    return `I can't assess injuries or give medical advice — if something hurts beyond normal training fatigue, ` +
      `please check with a doctor or athletic trainer before continuing. In the meantime, favor rest or very light ` +
      `mobility work over pushing through pain.`;
  }
  if (today) {
    return `Today's session is "${today.title}" (${today.durationMin} min, ${today.difficulty}). Ask me things like ` +
      `"I only have 30 minutes" or "I don't have a court today" and I'll adjust it — or ask me to explain any drill by name.`;
  }
  return "Generate your plan first (finish onboarding) and I'll be able to talk through today's specific workout.";
}
