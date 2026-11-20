import React from "react";
import { RECOVERY_ACTIVITIES } from "../data/exerciseLibrary.js";
import { useApp } from "../context/AppContext.jsx";
import {
  IconLeaf,
  IconClock,
  IconSparkles,
} from "../components/Icons.jsx";

const RECOVERY_PILLARS = [
  { title: "Sleep Architecture", desc: "8.5 to 9.5 hours for teen athletes is when 90% of growth hormone is released.", icon: "🌙" },
  { title: "Tissue Hydration", desc: "Muscles are over 70% water. Hydrate steadily before, during, and after training.", icon: "💧" },
  { title: "Active Flushing", desc: "Light 10-min movement clears metabolic waste faster than passive couch sitting.", icon: "🚶" },
];

export default function Recovery() {
  const { plan } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-cyan py-0.5 px-2 text-[10px]">
              <IconLeaf className="w-3 h-3" /> REGENERATION PROTOCOLS
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              {plan.sport} Specific
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Recovery & <span className="text-gradient-accent">Tissue Health</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            Recovery isn't time off — it's when your muscles rebuild, tendons adapt, and athletic gains lock in
          </p>
        </div>
      </div>

      {/* Recovery Pillars Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        {RECOVERY_PILLARS.map((p) => (
          <div key={p.title} className="card p-5 border-cyan-500/20 bg-cyan-500/5">
            <div className="text-2xl mb-2">{p.icon}</div>
            <h3 className="font-display font-bold text-bone text-sm mb-1">{p.title}</h3>
            <p className="text-xs text-mist leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Activities Section */}
      <div>
        <h2 className="font-display text-lg font-bold text-bone mb-4">
          Recommended Active Recovery Sessions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECOVERY_ACTIVITIES.map((a) => (
            <div
              key={a.name}
              className="card p-6 flex flex-col justify-between hover:border-cyanAccent/40 transition-all group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="badge-cyan text-[10px]">
                    <IconLeaf className="w-3 h-3" /> Mobility
                  </span>
                  <span className="flex items-center gap-1 text-xs font-mono text-mist">
                    <IconClock className="w-3.5 h-3.5 text-cyanAccent" />
                    {Math.round(a.durationSec / 60)} min
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-bone mb-2 group-hover:text-cyanAccent transition-colors">
                  {a.name}
                </h3>
                <p className="text-xs text-mist leading-relaxed mb-4">
                  {a.purpose}
                </p>
              </div>

              <div className="pt-3 border-t border-line/40 flex justify-between items-center text-[11px] text-cyanAccent font-semibold">
                <span>Guided Drill</span>
                <span>Ready ➔</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Safety Disclaimer */}
      <div className="p-5 rounded-2xl bg-surfaceRaised border border-line text-xs text-mist flex items-start gap-3">
        <span className="text-xl">🛡️</span>
        <div className="leading-relaxed">
          <strong className="text-bone block mb-0.5">Youth Athletic Safety Notice:</strong>
          This information is educational and designed for developmental youth athletic recovery. If you experience sharp joint pain, swelling, or persistent discomfort, always consult a parent, doctor, or certified athletic trainer rather than pushing through pain.
        </div>
      </div>
    </div>
  );
}
