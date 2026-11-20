import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  IconPlay,
  IconClock,
  IconFire,
  IconCheck,
  IconLightning,
  IconCalendar,
  IconTrophy,
  IconLeaf,
  IconArrowRight,
} from "../components/Icons.jsx";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildDailyRoutine(profile, today) {
  const events = [];
  if (profile.wakeTime) events.push({ time: profile.wakeTime, label: "Wake Up & Hydrate", tag: "Morning" });
  if (profile.busyBlocks?.[0]) {
    events.push({ time: profile.busyBlocks[0].start, label: profile.busyBlocks[0].label, tag: "School / Commitments" });
    events.push({ time: profile.busyBlocks[0].end, label: "Free Time & Snack", tag: "Transition" });
  }
  if (today?.type === "training") {
    events.push({
      time: "17:00",
      label: `${today.title.split("—")[0].trim()} Training Session`,
      tag: "Main Workout",
      highlight: true,
    });
    events.push({ time: "18:00", label: "Post-Workout Recovery & Shower", tag: "Recovery" });
  } else if (today?.type === "recovery") {
    events.push({ time: "17:00", label: "Active Recovery & Mobility Drill", tag: "Mobility", highlight: true });
  }
  events.push({ time: "19:30", label: "Nutrient-Dense Dinner", tag: "Fuel" });
  if (profile.sleepTime) events.push({ time: profile.sleepTime, label: "Sleep & Muscle Repair", tag: "Rest" });
  return events.sort((a, b) => a.time.localeCompare(b.time));
}

export default function Dashboard() {
  const { profile, today, week, offset, monthNumber, totalMonths, consistency, logs, streak, plan } = useApp();
  if (!today) return null;
  const day = today.day;
  const routine = buildDailyRoutine(profile, day);
  const firstName = profile?.name?.split(" ")[0] || "Athlete";
  const completedWorkoutsCount = Object.values(logs).filter((l) => l.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconLightning className="w-3 h-3 fill-current" /> PHASE 1
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              Month {monthNumber} of {totalMonths}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Ready to train, <span className="text-gradient-accent">{firstName}</span>?
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            {plan.sport} · {profile.experienceLevel.charAt(0).toUpperCase() + profile.experienceLevel.slice(1)} Program
          </p>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-3 bg-charcoal/80 border border-amber-500/30 p-3 px-4 rounded-2xl shadow-glow-amber self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <IconFire className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-xl text-amber-400">{streak}</span>
                <span className="text-xs uppercase font-bold tracking-wider text-amber-300">Days</span>
              </div>
              <p className="text-[10px] text-mist font-medium">Consecutive Streak 🔥</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Today's Session + Progress KPIs */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Workout Card (Hero) */}
        <div className="card card-glow-accent p-6 sm:p-8 lg:col-span-2 relative overflow-hidden flex flex-col justify-between group">
          {/* Ambient Glow in background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/15 transition-all duration-500" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {day.type === "training" ? (
                  <span className="badge-neon">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                    Today's Training
                  </span>
                ) : day.type === "recovery" ? (
                  <span className="badge-cyan">
                    <IconLeaf className="w-3.5 h-3.5" />
                    Active Recovery
                  </span>
                ) : (
                  <span className="badge-neutral">Rest & Recovery</span>
                )}
              </div>
              <span className="text-xs font-mono text-mist">
                Day {offset + 1}
              </span>
            </div>

            {day.type === "training" ? (
              <>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-bone mb-3 tracking-tight">
                  {day.title}
                </h2>
                <p className="text-mist text-sm mb-6 max-w-xl leading-relaxed">
                  Engineered specifically for your {plan.sport} progression. Focus on crisp form, explosiveness, and intent on every repetition.
                </p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surfaceRaised border border-line text-xs font-medium text-bone">
                    <IconClock className="w-4 h-4 text-accent" />
                    <span>{day.durationMin} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surfaceRaised border border-line text-xs font-medium text-bone">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="capitalize">{day.difficulty} Intensity</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surfaceRaised border border-line text-xs font-medium text-bone">
                    <span>🎯 {day.blocks?.length || 0} Drills / Exercises</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-bone mb-3 tracking-tight">
                  {day.type === "recovery" ? "Active Recovery & Mobility" : "Rest & Tissue Regeneration"}
                </h2>
                <p className="text-mist text-sm mb-8 max-w-xl leading-relaxed">
                  {day.type === "recovery"
                    ? "Low-intensity mobility work and tissue hydration to accelerate adaptation and prevent training fatigue."
                    : "Complete rest. Adaptation and muscle growth happen while you rest, not while you strain. Hydrate and get 8-9 hours of sleep."}
                </p>
              </>
            )}
          </div>

          <div>
            {day.type === "training" ? (
              <Link
                to={`/workout/${offset}`}
                className="btn-primary text-base py-3.5 px-8 inline-flex items-center gap-3 group"
              >
                <IconPlay className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span>Start Today's Workout</span>
                <IconArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : day.blocks?.length > 0 ? (
              <Link
                to={`/workout/${offset}`}
                className="btn-secondary py-3 px-6 inline-flex items-center gap-2"
              >
                <span>View Recovery Session</span>
                <IconArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs text-mist bg-surface/80 border border-line/60 px-4 py-2 rounded-xl">
                <span>🛌 No workout scheduled — rest well!</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Snapshot Column */}
        <div className="card p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-mist">
                Performance Stats
              </span>
              <IconTrophy className="w-4 h-4 text-accent" />
            </div>

            <div className="space-y-4">
              {/* Consistency Meter */}
              <div className="p-4 rounded-xl bg-surface/80 border border-line/60">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-mist font-medium">Training Consistency</span>
                  <span className="font-mono text-lg font-bold text-accent">{consistency}%</span>
                </div>
                <div className="progress-track h-2">
                  <div className="progress-fill" style={{ width: `${consistency}%` }} />
                </div>
              </div>

              {/* Completed Workouts */}
              <div className="p-4 rounded-xl bg-surface/80 border border-line/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-mist font-medium block">Completed Sessions</span>
                  <span className="text-[11px] text-mist/70">Logged workouts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-2xl font-bold text-bone">
                    {completedWorkoutsCount}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                    <IconCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Active Streak */}
              <div className="p-4 rounded-xl bg-surface/80 border border-line/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-mist font-medium block">Current Streak</span>
                  <span className="text-[11px] text-mist/70">Consistent training</span>
                </div>
                <span className="font-display text-2xl font-bold text-amber-400">
                  {streak} <span className="text-xs font-normal text-mist">days</span>
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/progress"
            className="text-xs text-accent hover:underline flex items-center justify-between pt-2 border-t border-line/50"
          >
            <span>View in-depth analytics</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Routine Timeline & Weekly Schedule Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Routine */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs uppercase font-bold tracking-wider text-mist">
              Today's Routine
            </span>
            <span className="badge-neutral text-[10px]">AI Synced</span>
          </div>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-line">
            {routine.map((e, i) => (
              <div key={i} className="relative group">
                {/* Node dot */}
                <div
                  className={`absolute -left-[1.8rem] top-1.5 w-3 h-3 rounded-full border-2 border-charcoal transition-transform ${
                    e.highlight
                      ? "bg-accent shadow-glow scale-125"
                      : "bg-lineBright group-hover:bg-accent"
                  }`}
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-accent block">
                      {e.time}
                    </span>
                    <span className="text-sm font-medium text-bone leading-tight block mt-0.5">
                      {e.label}
                    </span>
                  </div>
                  {e.tag && (
                    <span className="text-[10px] text-mist bg-surfaceRaised border border-line px-2 py-0.5 rounded-full shrink-0">
                      {e.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Training Calendar Strip */}
        <div className="card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-mist block">
                  Weekly Schedule
                </span>
                <span className="text-xs text-mist/80">Tap any day to preview session or log workout</span>
              </div>
              <Link to="/schedule" className="btn-ghost text-xs text-accent">
                Full Schedule →
              </Link>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {week.map((w, i) => {
                const status = logs[w.offsetDays]?.status;
                const isToday = w.offsetDays === offset;
                const isTraining = w.day.type === "training";
                const isRecovery = w.day.type === "recovery";

                return (
                  <Link
                    key={i}
                    to={`/workout/${w.offsetDays}`}
                    className={`rounded-2xl p-3 text-center border transition-all flex flex-col items-center justify-between min-h-[110px] sm:min-h-[120px] ${
                      isToday
                        ? "border-accent bg-accent/10 shadow-glow-sm"
                        : "border-line bg-surface/60 hover:bg-surface hover:border-lineBright"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-mist">{DAY_LABELS[i]}</div>

                    <div className="my-auto py-1">
                      {status === "completed" ? (
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto shadow-glow-sm">
                          <IconCheck className="w-4 h-4" />
                        </div>
                      ) : status === "skipped" ? (
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xs font-bold">
                          –
                        </div>
                      ) : isTraining ? (
                        <div className="w-8 h-8 rounded-full bg-surfaceRaised text-mist flex items-center justify-center mx-auto text-xs font-bold border border-line">
                          ⚡
                        </div>
                      ) : isRecovery ? (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyanAccent flex items-center justify-center mx-auto text-xs font-bold border border-cyan-500/30">
                          🌱
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface text-mist/60 flex items-center justify-center mx-auto text-[11px]">
                          Rest
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] font-semibold">
                      {isToday ? (
                        <span className="text-accent font-bold">TODAY</span>
                      ) : (
                        <span className="text-mist truncate max-w-full block">
                          {isTraining ? `${w.day.durationMin}m` : isRecovery ? "Recov" : "Off"}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between text-xs text-mist">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-glow-sm" /> Training
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyanAccent" /> Active Recovery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-lineBright" /> Full Rest
              </span>
            </div>
            <span className="font-mono">{profile.daysPerWeek} training days/week</span>
          </div>
        </div>
      </div>
    </div>
  );
}
