import React from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  IconLightning,
  IconCheck,
  IconTrophy,
} from "../components/Icons.jsx";

const PRO_BENEFITS = [
  "Unlimited missed workout grace (never get paused again)",
  "Full AI Coach reasoning for daily drill adjustments",
  "Adaptive multi-phase periodization & recovery cycles",
  "Advanced performance benchmark curves and exports",
];

export default function UpgradeGate() {
  const { missedThisMonth, freeMissLimit, upgradeToPremium } = useApp();

  return (
    <div className="min-h-screen bg-ink bg-ambient-mesh flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accentDim p-0.5 shadow-glow flex items-center justify-center text-ink">
              <IconLightning className="w-6 h-6 fill-current" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-bone">
              FIT<span className="text-accent">PATH</span>
            </span>
          </div>
          <p className="text-mist text-xs">Youth Athlete Performance</p>
        </div>

        {/* Paywall Card */}
        <div className="card card-glow-accent p-6 sm:p-8 shadow-2xl relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-bold text-bone text-center mb-2">
            Training Plan Paused
          </h1>
          <p className="text-mist text-xs sm:text-sm text-center mb-6 leading-relaxed">
            You've missed <strong className="text-rose-400">{missedThisMonth} workouts</strong> this month. Free accounts pause after {freeMissLimit} misses to keep training plans calibrated and safe.
          </p>

          <div className="p-4 rounded-2xl bg-surface/80 border border-line mb-6 space-y-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-accent block mb-1">
              With Pro Athlete:
            </span>
            {PRO_BENEFITS.map((b) => (
              <div key={b} className="flex items-start gap-2.5 text-xs text-bone">
                <div className="w-4 h-4 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{b}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-primary w-full py-3.5 text-sm shadow-glow mb-4"
            onClick={upgradeToPremium}
          >
            Unlock Pro & Resume Training
          </button>

          <p className="text-[10px] text-mist/60 text-center leading-normal">
            Demo checkout simulation. In production, connect this button to Stripe or Apple In-App Purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
