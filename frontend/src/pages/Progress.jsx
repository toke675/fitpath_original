import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useApp } from "../context/AppContext.jsx";
import {
  IconChart,
  IconFire,
  IconCheck,
  IconTrophy,
  IconPlus,
} from "../components/Icons.jsx";

const SUGGESTED_METRICS = [
  { name: "Vertical Jump", unit: "cm" },
  { name: "Beep Test Level", unit: "lvl" },
  { name: "Free Throw Accuracy", unit: "%" },
  { name: "Agility 5-10-5 Shuttle", unit: "sec" },
];

export default function Progress() {
  const { plan, logs, streak, consistency, performance, logPerformance, totalDays, completedCount } = useApp();
  const [metric, setMetric] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");

  const metrics = Array.from(new Set(performance.map((p) => p.metric)));
  const overallProgress = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

  const submit = (e) => {
    e.preventDefault();
    if (!metric || !value) return;
    logPerformance({ metric, value: Number(value), unit });
    setMetric("");
    setValue("");
    setUnit("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconChart className="w-3 h-3" /> ANALYTICS & METRICS
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              {plan.sport}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Athletic <span className="text-gradient-accent">Progress</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            Data-driven training feedback · Track physical adaptation and sport-specific milestones
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Roadmap"
          value={`${overallProgress}%`}
          desc="Program completed"
          icon="🗺️"
          color="accent"
        />
        <StatCard
          label="Consistency"
          value={`${consistency}%`}
          desc="On scheduled days"
          icon="⚡"
          color="accent"
        />
        <StatCard
          label="Active Streak"
          value={`${streak}d`}
          desc="Consecutive days"
          icon="🔥"
          color="amber"
        />
        <StatCard
          label="Logged Workouts"
          value={completedCount}
          desc="Sessions in the books"
          icon="💪"
          color="cyan"
        />
      </div>

      {/* Log New Performance Result Card */}
      <div className="card p-6 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-base font-bold text-bone">
              Record a Test Result or Benchmark
            </h3>
            <p className="text-xs text-mist mt-0.5">
              Log periodic metrics to visualize your athletic development curve.
            </p>
          </div>
          <span className="badge-neutral text-[10px]">Benchmarking</span>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED_METRICS.map((s) => (
            <button
              key={s.name}
              type="button"
              className="text-[11px] px-3 py-1 rounded-lg bg-surfaceRaised border border-line text-mist hover:text-accent hover:border-accent/40 transition-colors"
              onClick={() => { setMetric(s.name); setUnit(s.unit); }}
            >
              + {s.name} ({s.unit})
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            className="input-base sm:col-span-6"
            placeholder="Metric (e.g. Vertical Jump, 3-pt %, 40yd dash)"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          />
          <input
            className="input-base sm:col-span-3"
            placeholder="Score (e.g. 68)"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <input
            className="input-base sm:col-span-3"
            placeholder="Unit (cm, sec, %)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary sm:col-span-12 py-3 flex items-center justify-center gap-2"
          >
            <IconPlus className="w-4 h-4 stroke-[3]" />
            <span>Save Benchmark Result</span>
          </button>
        </form>
      </div>

      {/* Chart Section */}
      {metrics.length === 0 ? (
        <div className="card p-10 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-surfaceRaised border border-line text-mist flex items-center justify-center mx-auto mb-4 text-2xl">
            📈
          </div>
          <h3 className="font-display text-lg font-bold text-bone mb-2">No benchmarks logged yet</h3>
          <p className="text-mist text-xs leading-relaxed max-w-sm mx-auto">
            Log your first metric above (like your vertical jump or sprint time) to start plotting your performance trajectory!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {metrics.map((m) => {
            const points = performance
              .filter((p) => p.metric === m)
              .map((p) => ({
                date: new Date(p.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                }),
                value: p.value,
                unit: p.unit,
              }));

            const latestPoint = points[points.length - 1];

            return (
              <div key={m} className="card p-6">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-line/40">
                  <div>
                    <h3 className="font-display text-lg font-bold text-bone">{m}</h3>
                    <span className="text-xs text-mist">Historical trend progression</span>
                  </div>
                  {latestPoint && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-mist block">Latest</span>
                      <span className="font-mono text-lg font-bold text-accent">
                        {latestPoint.value} {latestPoint.unit}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${m}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#15803D" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#15803D" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#CDC8C3" strokeDasharray="4 4" />
                      <XAxis dataKey="date" stroke="#57534E" fontSize={12} tickLine={false} />
                      <YAxis stroke="#57534E" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #CDC8C3",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(28,25,23,0.08)",
                          color: "#1C1917",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#15803D"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill={`url(#grad-${m})`}
                        dot={{ r: 4, fill: "#15803D", stroke: "#FFFFFF", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#22C55E", stroke: "#FFFFFF", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, desc, icon, color }) {
  const colorMap = {
    accent: "text-accent border-accent/20 bg-accent/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    cyan: "text-cyanAccent border-cyan-500/20 bg-cyan-500/5",
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all ${colorMap[color] || colorMap.accent}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-mist uppercase tracking-wider">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-bone">
        {value}
      </p>
      <p className="text-[11px] text-mist">{desc}</p>
    </div>
  );
}
