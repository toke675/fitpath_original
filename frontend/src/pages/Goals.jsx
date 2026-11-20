import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  IconTarget,
  IconPlus,
  IconTrash,
  IconCheck,
  IconTrophy,
} from "../components/Icons.jsx";

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    addGoal({ label: label.trim(), targetValue: target ? Number(target) : null, currentValue: 0 });
    setLabel("");
    setTarget("");
  };

  const handleUpdate = (g) => {
    const newVal = prompt(`Update current progress for "${g.label}":`, g.currentValue || 0);
    if (newVal !== null && !isNaN(Number(newVal))) {
      updateGoal(g.id, { currentValue: Number(newVal) });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconTarget className="w-3 h-3" /> TARGET TRACKER
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              {goals.length} Active Targets
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Athletic <span className="text-gradient-accent">Goals</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            Break big sports ambitions down into measurable daily milestones
          </p>
        </div>
      </div>

      {/* Add New Goal Card */}
      <form onSubmit={submit} className="card p-5 sm:p-6 shadow-lg">
        <h3 className="font-display text-sm font-bold text-bone mb-3">Set a New Athletic Target</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input-base flex-1"
            placeholder='e.g. "Hit 10 consecutive three-pointers" or "Run 1km under 4 mins"'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            className="input-base sm:w-36"
            placeholder="Target # (opt)"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary py-3 px-6 whitespace-nowrap flex items-center justify-center gap-2"
          >
            <IconPlus className="w-4 h-4 stroke-[3]" />
            <span>Add Goal</span>
          </button>
        </div>
      </form>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="card p-12 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-surfaceRaised border border-line text-mist flex items-center justify-center mx-auto mb-4 text-2xl">
              🎯
            </div>
            <h3 className="font-display text-lg font-bold text-bone mb-1">No goals set yet</h3>
            <p className="text-mist text-xs leading-relaxed">
              Add your first target above. Tracking specific numbers keeps you accountable through every training block!
            </p>
          </div>
        ) : (
          goals.map((g) => {
            const pct = g.targetValue
              ? Math.min(100, Math.round(((g.currentValue || 0) / g.targetValue) * 100))
              : null;
            const isCompleted = pct !== null && pct >= 100;

            return (
              <div
                key={g.id}
                className={`card p-6 transition-all hover:border-lineBright ${
                  isCompleted ? "border-accent/40 bg-accent/5 shadow-glow-sm" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCompleted
                          ? "bg-accent/20 border-accent text-accent"
                          : "bg-surfaceRaised border-line text-mist"
                      }`}
                    >
                      {isCompleted ? <IconTrophy className="w-4 h-4" /> : <IconTarget className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-bone">
                        {g.label}
                      </h3>
                      {isCompleted && (
                        <span className="badge-neon py-0.5 px-2 text-[9px] mt-1">
                          🎉 TARGET ACHIEVED!
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-ghost text-mist hover:text-rose-400 p-2 text-xs"
                    onClick={() => deleteGoal(g.id)}
                    title="Remove goal"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>

                {g.targetValue ? (
                  <div className="mt-4 pt-4 border-t border-line/40">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-mist font-medium">Progress</span>
                      <span className="font-mono font-bold text-accent">
                        {g.currentValue || 0} / {g.targetValue} ({pct}%)
                      </span>
                    </div>

                    <div className="progress-track h-2.5 mb-4">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.max(3, pct)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-surfaceRaised border border-line text-xs font-mono text-mist hover:text-bone hover:border-lineBright"
                          onClick={() => updateGoal(g.id, { currentValue: Math.max(0, (g.currentValue || 0) + 1) })}
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-surfaceRaised border border-line text-xs font-mono text-mist hover:text-bone hover:border-lineBright"
                          onClick={() => updateGoal(g.id, { currentValue: Math.max(0, (g.currentValue || 0) + 5) })}
                        >
                          +5
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-secondary text-xs py-1.5 px-4"
                        onClick={() => handleUpdate(g)}
                      >
                        Set Exact Value
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-line/40 flex justify-between items-center text-xs text-mist">
                    <span>Open-ended habit / qualitative target</span>
                    <button
                      type="button"
                      className="btn-secondary text-xs py-1.5 px-4"
                      onClick={() => handleUpdate(g)}
                    >
                      Log Notes
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
