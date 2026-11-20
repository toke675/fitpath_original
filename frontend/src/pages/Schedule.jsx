import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconSparkles,
  IconLightning,
  IconLeaf,
  IconArrowRight,
} from "../components/Icons.jsx";

const DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Schedule() {
  const { week, offset, logs, profile } = useApp();
  const [selectedConstraint, setSelectedConstraint] = useState("");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconCalendar className="w-3 h-3" /> MICROCYCLE SCHEDULE
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              {profile.daysPerWeek} Training Days
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            This Week's <span className="text-gradient-accent">Program</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            {profile.daysPerWeek}x weekly frequency · {profile.sessionMinutes}m target sessions · {profile.location}
          </p>
        </div>

        <Link to="/coach" className="btn-secondary py-2.5 px-4 text-xs inline-flex items-center gap-2 self-start sm:self-auto">
          <IconSparkles className="w-4 h-4 text-accent" />
          <span>Ask AI Coach</span>
        </Link>
      </div>

      {/* Week Day Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {week.map((w, i) => {
          const status = logs[w.offsetDays]?.status;
          const isToday = w.offsetDays === offset;
          const isTraining = w.day.type === "training";
          const isRecovery = w.day.type === "recovery";

          return (
            <Link
              key={i}
              to={`/workout/${w.offsetDays}`}
              className={`card p-5 block transition-all group ${
                isToday
                  ? "border-accent bg-accent/10 shadow-glow-sm hover:border-accent"
                  : "hover:border-lineBright hover:bg-surfaceHover"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-mist">{DAY_LABELS[i]}</span>
                  {isToday && (
                    <span className="badge-neon text-[9px] py-0.5 px-1.5">TODAY</span>
                  )}
                </div>

                {status === "completed" ? (
                  <span className="badge-neon text-[10px] py-0.5 px-2 flex items-center gap-1">
                    <IconCheck className="w-3 h-3" /> Done
                  </span>
                ) : status === "skipped" ? (
                  <span className="badge-neutral text-[10px] py-0.5 px-2 text-rose-400 border-rose-500/30">
                    Skipped
                  </span>
                ) : isTraining ? (
                  <span className="text-[10px] text-mist font-mono">Scheduled</span>
                ) : isRecovery ? (
                  <span className="badge-cyan text-[9px] py-0.5 px-1.5">Recovery</span>
                ) : (
                  <span className="badge-neutral text-[9px] py-0.5 px-1.5">Rest</span>
                )}
              </div>

              <h3 className="font-display text-base font-bold text-bone mb-2 group-hover:text-accent transition-colors">
                {w.day.title}
              </h3>

              {isTraining ? (
                <div className="flex items-center gap-3 text-xs text-mist pt-2 border-t border-line/40">
                  <span className="flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5 text-accent" /> {w.day.durationMin} mins
                  </span>
                  <span>·</span>
                  <span className="capitalize">{w.day.difficulty}</span>
                </div>
              ) : isRecovery ? (
                <div className="flex items-center gap-1 text-xs text-cyanAccent pt-2 border-t border-line/40">
                  <IconLeaf className="w-3.5 h-3.5" /> Active Mobility
                </div>
              ) : (
                <div className="text-xs text-mist/70 pt-2 border-t border-line/40">
                  Full Recovery Day
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Constraint & Real-time AI Adjustment */}
      <div className="card card-glow-accent p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <IconSparkles className="w-4 h-4 text-accent" />
          <span className="text-xs uppercase font-bold tracking-wider text-accent">
            Life Happens · Adapt Instantly
          </span>
        </div>
        <h3 className="font-display text-xl font-bold text-bone mb-2">
          Need to adapt today's training?
        </h3>
        <p className="text-mist text-xs sm:text-sm mb-6 max-w-xl">
          School exams, no gym access, or low energy? Select your situation and our AI Coach will recalibrate today's workout so you keep momentum without overtraining.
        </p>

        <div className="flex flex-wrap gap-2.5 mb-6">
          {[
            { text: "I only have 25 minutes today.", icon: "⏱️" },
            { text: "I don't have access to a gym right now.", icon: "🏠" },
            { text: "Feeling sore or low energy.", icon: "🔋" },
            { text: "I have a competitive game tomorrow.", icon: "🏆" },
          ].map(({ text, icon }) => (
            <button
              key={text}
              type="button"
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all flex items-center gap-2 ${
                selectedConstraint === text
                  ? "bg-accent text-ink border-accent shadow-glow-sm"
                  : "bg-surface border-line text-mist hover:text-bone hover:border-lineBright"
              }`}
              onClick={() => setSelectedConstraint(text)}
            >
              <span>{icon}</span>
              <span>{text}</span>
            </button>
          ))}
        </div>

        {selectedConstraint && (
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-xs sm:text-sm text-bone flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div>
              <span className="font-bold text-accent block mb-0.5">Constraint selected:</span>
              <span className="text-mist">"{selectedConstraint}"</span>
            </div>
            <Link
              to="/coach"
              className="btn-primary py-2 px-5 text-xs whitespace-nowrap self-start sm:self-auto"
            >
              <span>Open in AI Coach</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
