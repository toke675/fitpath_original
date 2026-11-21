import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { computeSchedule } from "../lib/scheduleAI.js";
import {
  IconLightning,
  IconCheck,
  IconArrowRight,
  IconSparkles,
} from "../components/Icons.jsx";

const GOAL_OPTIONS = [
  "Strength",
  "Speed",
  "Endurance",
  "Agility",
  "Explosiveness",
  "Flexibility",
  "Technique",
  "Skill",
  "Game Performance",
  "Recovery",
  "Overall Athleticism",
];

const HISTORY_OPTIONS = [
  { id: "never", label: "Never trained before" },
  { id: "lt3", label: "Less than 3 months" },
  { id: "3-6", label: "3–6 months" },
  { id: "6-12", label: "6–12 months" },
  { id: "1-2y", label: "1–2 years" },
  { id: "2y+", label: "2+ years" },
];

const EQUIPMENT_OPTIONS = [
  "none",
  "basketball",
  "football",
  "dumbbells",
  "barbell",
  "resistance_bands",
  "jump_rope",
  "pull_up_bar",
  "gym_equipment",
];

const LENGTH_OPTIONS = [
  { id: "1_month", label: "1 Month" },
  { id: "3_months", label: "3 Months (Recommended)" },
  { id: "6_months", label: "6 Months" },
  { id: "1_year", label: "1 Year" },
  { id: "2_years", label: "2 Years" },
  { id: "custom", label: "Custom Length" },
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const STEPS = [
  "Athlete Profile",
  "Main Sport",
  "Athletic Goals",
  "Experience",
  "Intensity Level",
  "Training Schedule",
  "Program Duration",
  "Daily Schedule",
  "Review & Build",
];

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
        active
          ? "bg-accent text-ink border-accent shadow-glow-sm scale-[1.02]"
          : "bg-surface/80 border-line text-mist hover:text-bone hover:border-lineBright hover:bg-surfaceHover"
      }`}
    >
      {active && <IconCheck className="w-3.5 h-3.5 stroke-[3]" />}
      <span>{children}</span>
    </button>
  );
}

function Field({ label, helper, children }) {
  return (
    <label className="block mb-5">
      <span className="block text-xs font-bold text-mist uppercase tracking-wider mb-2">
        {label}
      </span>
      {children}
      {helper && <span className="block text-[11px] text-mist/70 mt-1.5">{helper}</span>}
    </label>
  );
}

export default function Onboarding() {
  const { saveProfile, generate } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    heightCm: "",
    weightKg: "",
    sport: "",
    goals: [],
    customGoal: "",
    experienceLevel: "beginner",
    trainingHistory: "never",
    difficulty: "moderate",
    daysPerWeek: 3,
    sessionMinutes: 45,
    location: "home",
    equipment: ["none"],
    transformationLength: "3_months",
    customLengthWeeks: 8,
    hasBusyBlock: null,
    busyLabel: "School",
    busyStart: "09:00",
    busyEnd: "15:00",
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleGoal = (g) =>
    update({
      goals: form.goals.includes(g) ? form.goals.filter((x) => x !== g) : [...form.goals, g],
    });
  const toggleEquip = (e) =>
    update({
      equipment: form.equipment.includes(e) ? form.equipment.filter((x) => x !== e) : [...form.equipment, e],
    });

  const validate = () => {
    switch (step) {
      case 0:
        if (!form.name.trim() || !form.age || !form.gender || !form.bloodGroup || !form.heightCm || !form.weightKg) {
          return "Please fill in all physical baseline fields before continuing.";
        }
        if (Number(form.age) < 12 || Number(form.age) > 18) {
          return "FitPath is optimized for young athletes aged 12–18. Please enter an age between 12 and 18.";
        }
        return null;
      case 1:
        if (!form.sport.trim()) {
          return "Please enter your primary sport.";
        }
        return null;
      case 2:
        if (form.goals.length === 0 && !form.customGoal.trim()) {
          return "Please select at least one athletic focus goal.";
        }
        return null;
      case 5:
        if (!form.daysPerWeek || !form.sessionMinutes || !form.location || form.equipment.length === 0) {
          return "Please fill in your training schedule and equipment availability.";
        }
        return null;
      case 6:
        if (form.transformationLength === "custom" && !form.customLengthWeeks) {
          return "Please specify the custom plan length in weeks.";
        }
        return null;
      case 7:
        if (form.hasBusyBlock === null) {
          return "Please indicate whether you have school or other scheduled busy hours.";
        }
        if (form.hasBusyBlock && (!form.busyLabel.trim() || !form.busyStart || !form.busyEnd)) {
          return "Please provide the start and end hours of your busy block.";
        }
        return null;
      default:
        return null;
    }
  };

  const next = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setGenerating(true);
    const goals = [...form.goals, ...(form.customGoal ? [form.customGoal] : [])];
    const profile = {
      ...form,
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      sport: form.sport,
      goals,
      daysPerWeek: Number(form.daysPerWeek),
      sessionMinutes: Number(form.sessionMinutes),
      busyBlocks: form.hasBusyBlock ? [{ label: form.busyLabel, start: form.busyStart, end: form.busyEnd }] : [],
    };
    saveProfile(profile);

    setTimeout(() => {
      generate();
      navigate("/");
    }, 600);
  };

  const previewSchedule = computeSchedule({
    age: Number(form.age) || 15,
    sessionMinutes: Number(form.sessionMinutes) || 45,
    hasBusyBlock: form.hasBusyBlock,
    busyBlocks: form.hasBusyBlock ? [{ label: form.busyLabel, start: form.busyStart, end: form.busyEnd }] : [],
  });

  return (
    <div className="min-h-screen bg-ink bg-ambient-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Brand Banner */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent p-0.5 shadow-glow flex items-center justify-center text-ink">
              <IconLightning className="w-5 h-5 fill-current" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-bone">
              FIT<span className="text-accent">PATH</span>
            </span>
          </div>
          <p className="text-mist text-xs sm:text-sm max-w-sm mx-auto">
            Personalized athletic performance & training plans engineered for youth athletes aged 12–18.
          </p>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-mist font-medium">
              Step <span className="text-bone font-bold">{step + 1}</span> of {STEPS.length}
            </span>
            <span className="text-accent font-bold font-mono">
              {Math.round(((step + 1) / STEPS.length) * 100)}%
            </span>
          </div>
          <div className="grid grid-cols-9 gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step
                    ? "bg-accent shadow-glow-sm"
                    : "bg-line"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="card p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-line/60">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent block mb-1">
                Phase Setup
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-bone">
                {STEPS[step]}
              </h2>
            </div>
            <span className="text-2xl">⚡</span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 0: Athlete Profile Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Athlete Name" helper="What should your coach call you?">
                <input
                  className="input-base"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                />
              </Field>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Age (12–18)">
                  <input
                    type="number"
                    min={12}
                    max={18}
                    className="input-base"
                    value={form.age}
                    onChange={(e) => update({ age: e.target.value })}
                    placeholder="15"
                  />
                </Field>
                <Field label="Height (cm)">
                  <input
                    type="number"
                    className="input-base"
                    value={form.heightCm}
                    onChange={(e) => update({ heightCm: e.target.value })}
                    placeholder="175"
                  />
                </Field>
                <Field label="Weight (kg)">
                  <input
                    type="number"
                    className="input-base"
                    value={form.weightKg}
                    onChange={(e) => update({ weightKg: e.target.value })}
                    placeholder="65"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Blood Group">
                  <select
                    className="input-base"
                    value={form.bloodGroup}
                    onChange={(e) => update({ bloodGroup: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Gender">
                  <select
                    className="input-base"
                    value={form.gender}
                    onChange={(e) => update({ gender: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* STEP 1: Sport */}
          {step === 1 && (
            <div className="space-y-5">
              <Field label="Primary Sport or Athletic Discipline">
                <input
                  className="input-base"
                  value={form.sport}
                  onChange={(e) => update({ sport: e.target.value })}
                  placeholder="e.g. Basketball, Soccer, Swimming, Track & Field..."
                />
              </Field>
            </div>
          )}

          {/* STEP 2: Goals */}
          {step === 2 && (
            <div>
              <p className="text-xs text-mist mb-3">Select the athletic attributes you want to elevate:</p>
              <div className="flex flex-wrap gap-2.5 mb-6">
                {GOAL_OPTIONS.map((g) => (
                  <Chip key={g} active={form.goals.includes(g)} onClick={() => toggleGoal(g)}>
                    {g}
                  </Chip>
                ))}
              </div>

              <Field label="Custom Goal / Particular Weakness">
                <textarea
                  className="input-base"
                  rows={3}
                  value={form.customGoal}
                  onChange={(e) => update({ customGoal: e.target.value })}
                  placeholder="e.g. Increase vertical jump for basketball, improve lateral quickness on defense..."
                />
              </Field>
            </div>
          )}

          {/* STEP 3: Experience */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-mist uppercase tracking-wider mb-3">Training Level</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { id: "beginner", label: "Beginner", desc: "Learning proper mechanics & fundamentals." },
                    { id: "intermediate", label: "Intermediate", desc: "1+ years consistent training, solid form." },
                    { id: "advanced", label: "Advanced", desc: "Competitive school/club athlete." },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => update({ experienceLevel: o.id })}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        form.experienceLevel === o.id
                          ? "border-accent bg-accent/10 shadow-glow-sm"
                          : "border-line bg-surface/60 hover:border-lineBright"
                      }`}
                    >
                      <div className="font-display font-bold text-bone mb-1">{o.label}</div>
                      <div className="text-[11px] text-mist">{o.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-mist uppercase tracking-wider mb-3">
                  Consistent Training History
                </p>
                <div className="flex flex-wrap gap-2">
                  {HISTORY_OPTIONS.map((h) => (
                    <Chip key={h.id} active={form.trainingHistory === h.id} onClick={() => update({ trainingHistory: h.id })}>
                      {h.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Intensity */}
          {step === 4 && (
            <div>
              <p className="text-xs text-mist mb-4">Choose your target intensity pace:</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: "easy", label: "Gentle / Foundation", emoji: "🌱" },
                  { id: "moderate", label: "Moderate Pace", emoji: "⚡" },
                  { id: "hard", label: "Challenging / Hard", emoji: "🔥" },
                  { id: "very_hard", label: "High Performance", emoji: "🚀" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => update({ difficulty: d.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.difficulty === d.id
                        ? "border-accent bg-accent/10 shadow-glow-sm"
                        : "border-line bg-surface/60 hover:border-lineBright"
                    }`}
                  >
                    <span className="text-xl mb-1 block">{d.emoji}</span>
                    <span className="font-display font-bold text-bone text-sm block">{d.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-surfaceRaised border border-line text-xs text-mist">
                🛡️ FitPath dynamically adapts intensity caps for developing teen bones and joints to prevent overuse injuries.
              </div>
            </div>
          )}

          {/* STEP 5: Schedule & Equipment */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Days Per Week">
                  <input
                    type="number"
                    min={1}
                    max={7}
                    className="input-base"
                    value={form.daysPerWeek}
                    onChange={(e) => update({ daysPerWeek: e.target.value })}
                  />
                </Field>
                <Field label="Duration Per Session">
                  <select
                    className="input-base"
                    value={form.sessionMinutes}
                    onChange={(e) => update({ sessionMinutes: e.target.value })}
                  >
                    {[20, 30, 45, 60, 90, 120].map((m) => (
                      <option key={m} value={m}>{m} minutes</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Primary Training Location">
                <div className="flex flex-wrap gap-2">
                  {["home", "gym", "outdoor", "facility", "multiple"].map((l) => (
                    <Chip key={l} active={form.location === l} onClick={() => update({ location: l })}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Available Equipment">
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((e) => (
                    <Chip key={e} active={form.equipment.includes(e)} onClick={() => toggleEquip(e)}>
                      {e.replace("_", " ")}
                    </Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 6: Journey Length */}
          {step === 6 && (
            <div>
              <p className="text-xs text-mist mb-4">Choose your training horizon:</p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {LENGTH_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => update({ transformationLength: o.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.transformationLength === o.id
                        ? "border-accent bg-accent/10 shadow-glow-sm"
                        : "border-line bg-surface/60 hover:border-lineBright"
                    }`}
                  >
                    <span className="font-display font-bold text-bone text-sm block">{o.label}</span>
                  </button>
                ))}
              </div>

              {form.transformationLength === "custom" && (
                <Field label="Custom Length in Weeks">
                  <input
                    type="number"
                    min={2}
                    max={104}
                    className="input-base"
                    value={form.customLengthWeeks}
                    onChange={(e) => update({ customLengthWeeks: e.target.value })}
                  />
                </Field>
              )}
            </div>
          )}

          {/* STEP 7: Daily Routine & School Schedule */}
          {step === 7 && (
            <div className="space-y-4">
              <p className="text-xs text-mist leading-relaxed mb-2">
                FitPath calculates optimal training and recovery windows around your daily school/study obligations.
              </p>

              <Field label="Do you attend school or regular busy blocks?">
                <div className="flex gap-3">
                  <Chip active={form.hasBusyBlock === true} onClick={() => update({ hasBusyBlock: true })}>
                    Yes, I have school/work
                  </Chip>
                  <Chip active={form.hasBusyBlock === false} onClick={() => update({ hasBusyBlock: false })}>
                    No regular block
                  </Chip>
                </div>
              </Field>

              {form.hasBusyBlock && (
                <div className="p-4 rounded-2xl bg-surface border border-line space-y-4">
                  <Field label="Block Title">
                    <input
                      className="input-base"
                      value={form.busyLabel}
                      onChange={(e) => update({ busyLabel: e.target.value })}
                      placeholder="School / Classes"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Start Time">
                      <input
                        type="time"
                        className="input-base"
                        value={form.busyStart}
                        onChange={(e) => update({ busyStart: e.target.value })}
                      />
                    </Field>
                    <Field label="End Time">
                      <input
                        type="time"
                        className="input-base"
                        value={form.busyEnd}
                        onChange={(e) => update({ busyEnd: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {form.hasBusyBlock !== null && (
                <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 text-xs">
                  <div className="font-bold text-accent mb-2 flex items-center gap-1.5">
                    <IconSparkles className="w-3.5 h-3.5" /> AI Recommended Schedule Windows
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl bg-surface border border-line">
                      <span className="text-mist block text-[10px]">Wake Up</span>
                      <span className="font-mono font-bold text-bone">{previewSchedule.wakeTime}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-surface border border-accent/40">
                      <span className="text-accent block text-[10px]">Train Session</span>
                      <span className="font-mono font-bold text-accent">{previewSchedule.trainingTime}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-surface border border-line">
                      <span className="text-mist block text-[10px]">Sleep Window</span>
                      <span className="font-mono font-bold text-bone">{previewSchedule.sleepTime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Final Review & Confirmation */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-surface/90 border border-line space-y-3">
                <ReviewRow label="Athlete Name" value={form.name || "—"} />
                <ReviewRow
                  label="Sport"
                  value={form.sport || "—"}
                  highlight
                />
                <ReviewRow
                  label="Goals"
                  value={[...form.goals, form.customGoal].filter(Boolean).join(", ") || "—"}
                />
                <ReviewRow label="Experience" value={form.experienceLevel} />
                <ReviewRow label="Intensity" value={form.difficulty.replace("_", " ")} />
                <ReviewRow
                  label="Weekly Frequency"
                  value={`${form.daysPerWeek} days/wk · ${form.sessionMinutes} mins · ${form.location}`}
                />
                <ReviewRow
                  label="Duration"
                  value={LENGTH_OPTIONS.find((o) => o.id === form.transformationLength)?.label || "Custom"}
                />
                <ReviewRow
                  label="Target Routine"
                  value={`Wake ${previewSchedule.wakeTime} · Train ${previewSchedule.trainingTime} · Sleep ${previewSchedule.sleepTime}`}
                />
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-line/60">
            <button
              type="button"
              className="btn-secondary px-5 py-2.5 text-xs sm:text-sm"
              onClick={back}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.3 : 1 }}
            >
              ← Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn-primary px-7 py-3 text-sm flex items-center gap-2"
                onClick={next}
              >
                <span>Continue</span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={generating}
                className="btn-primary px-8 py-3.5 text-sm flex items-center gap-2 shadow-glow"
                onClick={finish}
              >
                {generating ? (
                  <span>Building Plan...</span>
                ) : (
                  <>
                    <IconSparkles className="w-4 h-4" />
                    <span>Generate My Training Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-line/40 last:border-0 text-xs sm:text-sm">
      <span className="text-mist">{label}</span>
      <span className={`font-semibold text-right max-w-[60%] truncate ${highlight ? "text-accent" : "text-bone"}`}>
        {value}
      </span>
    </div>
  );
}
