import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  IconCheck,
  IconMap,
  IconClock,
  IconChevronDown,
  IconChevronRight,
  IconLightning,
  IconLeaf,
} from "../components/Icons.jsx";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function PlanOverview() {
  const { plan, offset, logs } = useApp();
  const [openMonth, setOpenMonth] = useState(0);

  let cumulativeWeeks = 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconMap className="w-3 h-3" /> LONG-TERM BLUEPRINT
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              {plan.totalWeeks} Weeks Total
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Your Athletic <span className="text-gradient-accent">Roadmap</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            {plan.sport} progression · Periodized for long-term growth and injury resilience
          </p>
        </div>

        <div className="p-3 px-4 rounded-2xl bg-surface/80 border border-line flex items-center gap-3 self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
            {Math.floor(offset / 7) + 1}W
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-mist block">
              Current Position
            </span>
            <span className="text-xs font-bold text-bone">
              Week {Math.floor(offset / 7) + 1} of {plan.totalWeeks}
            </span>
          </div>
        </div>
      </div>

      {/* Months List */}
      <div className="space-y-4">
        {plan.months.map((month, mi) => {
          const startWeek = cumulativeWeeks;
          cumulativeWeeks += month.weeks.length;
          const isOpen = openMonth === mi;
          const isCurrentMonth = offset >= startWeek * 7 && offset < cumulativeWeeks * 7;

          return (
            <div
              key={mi}
              className={`card transition-all overflow-hidden ${
                isCurrentMonth ? "border-accent/40 shadow-glow-sm" : "border-line"
              }`}
            >
              {/* Collapsible Month Header */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-surfaceHover/50 transition-colors"
                onClick={() => setOpenMonth(isOpen ? -1 : mi)}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-base shrink-0 border ${
                      isCurrentMonth
                        ? "bg-accent/20 border-accent text-accent shadow-glow-sm"
                        : "bg-surfaceRaised border-line text-mist"
                    }`}
                  >
                    M{mi + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-mist">
                        Month {mi + 1}
                      </span>
                      {isCurrentMonth && (
                        <span className="badge-neon py-0.2 px-1.5 text-[9px]">ACTIVE PHASE</span>
                      )}
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-bone">
                      {month.name}
                    </h3>
                    <p className="text-xs text-mist mt-1 max-w-xl">
                      Focus: <span className="text-bone/90">{month.focus}</span>
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-surfaceRaised border border-line flex items-center justify-center text-mist">
                  {isOpen ? <IconChevronDown className="w-4 h-4" /> : <IconChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {/* Month Weeks Grid (Expanded) */}
              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-line/60 space-y-4 bg-charcoal/40">
                  {month.weeks.map((week, wi) => {
                    const currentWeekNum = startWeek + wi + 1;
                    return (
                      <div
                        key={wi}
                        className="p-4 sm:p-5 rounded-2xl bg-surface/70 border border-line hover:border-lineBright transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-display text-sm font-bold text-bone">
                            Week {currentWeekNum}
                          </span>
                          <span className="text-[11px] text-mist font-medium">
                            7 Days Cycle
                          </span>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                          {week.days.map((d, di) => {
                            const dayOffset = (startWeek + wi) * 7 + di;
                            const status = logs[dayOffset]?.status;
                            const isToday = dayOffset === offset;
                            const isTraining = d.type === "training";
                            const isRecovery = d.type === "recovery";

                            return (
                              <Link
                                key={di}
                                to={`/workout/${dayOffset}`}
                                className={`rounded-xl p-2.5 text-center border transition-all flex flex-col items-center justify-between min-h-[70px] ${
                                  isToday
                                    ? "border-accent bg-accent/20 shadow-glow-sm"
                                    : status === "completed"
                                    ? "border-accent/40 bg-accent/5"
                                    : isTraining
                                    ? "border-line bg-surfaceRaised hover:border-accent/30"
                                    : "border-line/60 bg-surface/30 opacity-70 hover:opacity-100"
                                }`}
                                title={`${d.title} (${d.type})`}
                              >
                                <span className="text-[10px] font-bold text-mist mb-1">
                                  {DAY_LETTERS[di]}
                                </span>

                                <div className="my-auto">
                                  {status === "completed" ? (
                                    <IconCheck className="w-4 h-4 text-accent" />
                                  ) : isToday ? (
                                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                                  ) : isTraining ? (
                                    <IconLightning className="w-3.5 h-3.5 text-mist" />
                                  ) : isRecovery ? (
                                    <IconLeaf className="w-3.5 h-3.5 text-cyanAccent" />
                                  ) : (
                                    <span className="text-[10px] text-mist/60">—</span>
                                  )}
                                </div>

                                <span className="text-[9px] font-mono text-mist truncate max-w-full">
                                  {isToday ? "Today" : isTraining ? `${d.durationMin}m` : d.type === "recovery" ? "Recov" : "Rest"}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
