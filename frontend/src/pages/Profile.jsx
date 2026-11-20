import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  IconUser,
  IconTrophy,
  IconCheck,
  IconSparkles,
  IconLightning,
} from "../components/Icons.jsx";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

export default function Profile() {
  const {
    profile,
    saveProfile,
    regenerate,
    resetAll,
    isPremium,
    upgradeToPremium,
    downgradeToFree,
    missedThisMonth,
    freeMissLimit,
  } = useApp();

  const [form, setForm] = useState({
    ...profile,
    hasBusyBlock: profile?.busyBlocks?.length > 0,
    busyLabel: profile?.busyBlocks?.[0]?.label || "School",
    busyStart: profile?.busyBlocks?.[0]?.start || "09:00",
    busyEnd: profile?.busyBlocks?.[0]?.end || "15:00",
  });
  const [dirty, setDirty] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setDirty(true);
  };

  const buildProfile = () => ({
    ...form,
    busyBlocks: form.hasBusyBlock ? [{ label: form.busyLabel, start: form.busyStart, end: form.busyEnd }] : [],
  });

  const save = () => {
    saveProfile(buildProfile());
    setDirty(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const athleteInitial = (form.name || "A").charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconUser className="w-3 h-3" /> ATHLETE PASSPORT
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              {form.sport || "General Athletics"}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Athlete <span className="text-gradient-accent">Settings</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            Manage your physical baseline metrics, schedule, and subscription tier
          </p>
        </div>
      </div>

      {/* Athlete Header Card */}
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-accentDim p-0.5 shadow-glow flex items-center justify-center text-ink text-3xl font-display font-bold shrink-0">
          {athleteInitial}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-bone">
              {form.name || "Youth Athlete"}
            </h2>
            {isPremium ? (
              <span className="badge-neon py-0.5 px-2 text-[9px] self-center sm:self-auto">
                PRO ATHLETE
              </span>
            ) : (
              <span className="badge-neutral py-0.5 px-2 text-[9px] self-center sm:self-auto">
                FREE TIER
              </span>
            )}
          </div>
          <p className="text-xs text-mist mb-3">
            Age {form.age || 15} · {form.heightCm || 170} cm · {form.weightKg || 60} kg · Blood Group {form.bloodGroup || "O+"}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-surfaceRaised border border-line text-mist font-medium">
              ⚡ {form.experienceLevel} Level
            </span>
            <span className="px-3 py-1 rounded-lg bg-surfaceRaised border border-line text-mist font-medium">
              📅 {form.daysPerWeek} Days/Wk
            </span>
            <span className="px-3 py-1 rounded-lg bg-surfaceRaised border border-line text-mist font-medium">
              ⏱️ {form.sessionMinutes}m Sessions
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="card p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="font-display text-base font-bold text-bone mb-1">
            Physical & Athletic Baseline
          </h3>
          <p className="text-xs text-mist mb-4">
            Changes to baseline stats help our AI calibrate appropriate training loads.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FieldRow label="Athlete Name">
            <input
              className="input-base"
              value={form.name || ""}
              onChange={(e) => update({ name: e.target.value })}
            />
          </FieldRow>
          <FieldRow label="Sport Focus">
            <input
              className="input-base"
              value={form.sport || ""}
              onChange={(e) => update({ sport: e.target.value })}
            />
          </FieldRow>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FieldRow label="Age (12–18)">
            <input
              type="number"
              min={12}
              max={18}
              className="input-base"
              value={form.age || ""}
              onChange={(e) => update({ age: Number(e.target.value) })}
            />
          </FieldRow>
          <FieldRow label="Height (cm)">
            <input
              type="number"
              className="input-base"
              value={form.heightCm || ""}
              onChange={(e) => update({ heightCm: Number(e.target.value) })}
            />
          </FieldRow>
          <FieldRow label="Weight (kg)">
            <input
              type="number"
              className="input-base"
              value={form.weightKg || ""}
              onChange={(e) => update({ weightKg: Number(e.target.value) })}
            />
          </FieldRow>
          <FieldRow label="Blood Group">
            <select
              className="input-base"
              value={form.bloodGroup || ""}
              onChange={(e) => update({ bloodGroup: e.target.value })}
            >
              {BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </FieldRow>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-line/60">
          <FieldRow label="Gender">
            <select
              className="input-base"
              value={form.gender || ""}
              onChange={(e) => update({ gender: e.target.value })}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Experience Level">
            <select
              className="input-base"
              value={form.experienceLevel || "beginner"}
              onChange={(e) => update({ experienceLevel: e.target.value })}
            >
              <option value="beginner">Beginner (Foundations)</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced (Competitive)</option>
            </select>
          </FieldRow>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FieldRow label="Training Intensity">
            <select
              className="input-base"
              value={form.difficulty || "moderate"}
              onChange={(e) => update({ difficulty: e.target.value })}
            >
              <option value="easy">Easy / Gentle</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
              <option value="very_hard">Very Hard</option>
            </select>
          </FieldRow>
          <FieldRow label="Frequency (Days/Wk)">
            <input
              type="number"
              min={1}
              max={7}
              className="input-base"
              value={form.daysPerWeek || 3}
              onChange={(e) => update({ daysPerWeek: Number(e.target.value) })}
            />
          </FieldRow>
          <FieldRow label="Session Duration (Min)">
            <input
              type="number"
              className="input-base"
              value={form.sessionMinutes || 45}
              onChange={(e) => update({ sessionMinutes: Number(e.target.value) })}
            />
          </FieldRow>
        </div>

        {/* School / Commitments Block */}
        <div className="pt-4 border-t border-line/60">
          <h4 className="font-display text-sm font-bold text-bone mb-1">
            School & Busy Commitments
          </h4>
          <p className="text-xs text-mist mb-3">
            FitPath AI automatically syncs wake, train, and sleep windows around these hours.
          </p>

          <div className="flex gap-3 mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                form.hasBusyBlock
                  ? "bg-accent/15 border-accent text-accent shadow-glow-sm"
                  : "bg-surface border-line text-mist"
              }`}
              onClick={() => update({ hasBusyBlock: true })}
            >
              Yes, I have school/work
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                !form.hasBusyBlock
                  ? "bg-accent/15 border-accent text-accent shadow-glow-sm"
                  : "bg-surface border-line text-mist"
              }`}
              onClick={() => update({ hasBusyBlock: false })}
            >
              No busy block
            </button>
          </div>

          {form.hasBusyBlock && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surfaceRaised border border-line">
              <FieldRow label="Block Name">
                <input
                  className="input-base"
                  value={form.busyLabel}
                  onChange={(e) => update({ busyLabel: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Start Time">
                <input
                  type="time"
                  className="input-base"
                  value={form.busyStart}
                  onChange={(e) => update({ busyStart: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="End Time">
                <input
                  type="time"
                  className="input-base"
                  value={form.busyEnd}
                  onChange={(e) => update({ busyEnd: e.target.value })}
                />
              </FieldRow>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-line/60">
          <button
            type="button"
            className="btn-primary py-3 px-7 text-sm shadow-glow"
            onClick={save}
            disabled={!dirty}
            style={{ opacity: dirty ? 1 : 0.4 }}
          >
            {savedToast ? "✓ Changes Saved!" : "Save Profile"}
          </button>

          <button
            type="button"
            className="btn-secondary py-3 px-6 text-sm"
            onClick={() => {
              saveProfile(buildProfile());
              setDirty(false);
              setTimeout(regenerate, 0);
            }}
          >
            Regenerate Plan with New Data
          </button>

          <button
            type="button"
            className="btn-ghost py-3 px-4 text-xs text-rose-400 hover:bg-rose-500/10 ml-auto"
            onClick={() => {
              if (confirm("This clears your profile, workout logs, and plan progress. Reset all?")) {
                resetAll();
              }
            }}
          >
            Reset Everything
          </button>
        </div>
      </div>

      {/* Subscription Tier Card */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-bone">
            Subscription & Monthly Miss Protection
          </h3>
          <span className="badge-neutral text-[10px]">Account Tier</span>
        </div>

        {isPremium ? (
          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
                <IconTrophy className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-bone">
                  Pro Athlete Plan Active
                </h4>
                <p className="text-xs text-mist">
                  Unlimited workout grace, priority AI Coach tokens, and advanced periodization.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary text-xs py-2 px-4"
              onClick={downgradeToFree}
            >
              Switch back to Free (demo toggle)
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface border border-line space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-base font-bold text-bone mb-1">
                  Free Athlete Plan
                </h4>
                <p className="text-xs text-mist max-w-md leading-relaxed">
                  Free accounts pause after {freeMissLimit} missed workouts in a calendar month to keep you accountable. Pro removes all miss limits.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-2xl font-bold text-accent">
                  {missedThisMonth} / {freeMissLimit}
                </span>
                <span className="block text-[10px] text-mist">Misses this month</span>
              </div>
            </div>

            <div className="progress-track h-2">
              <div
                className={`h-full rounded-full transition-all ${
                  missedThisMonth >= freeMissLimit ? "bg-rose-500" : "bg-accent shadow-glow-sm"
                }`}
                style={{ width: `${Math.min(100, (missedThisMonth / freeMissLimit) * 100)}%` }}
              />
            </div>

            <button
              type="button"
              className="btn-primary py-3 px-6 text-sm shadow-glow"
              onClick={upgradeToPremium}
            >
              Upgrade to Pro (Demo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-mist uppercase tracking-wider mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
