import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { getDayByOffset } from "../lib/planGenerator.js";
import {
  IconCheck,
  IconClock,
  IconPlay,
  IconPause,
  IconSkip,
  IconTrophy,
  IconArrowRight,
  IconDumbbell,
} from "../components/Icons.jsx";

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const RPE_RATINGS = [
  { label: "Easy", emoji: "🟢", desc: "Light effort, felt smooth" },
  { label: "Moderate", emoji: "🟡", desc: "Good challenge, steady pace" },
  { label: "Hard", emoji: "🟠", desc: "Pushed limits, fatigued" },
  { label: "Very Hard", emoji: "🔴", desc: "Max effort, near failure" },
];

export default function WorkoutPlayer() {
  const { offset } = useParams();
  const offsetNum = Number(offset);
  const { plan, logWorkout, handleMissed } = useApp();
  const navigate = useNavigate();

  const { day } = useMemo(() => getDayByOffset(plan, offsetNum), [plan, offsetNum]);
  const blocks = day?.blocks || [];

  const [idx, setIdx] = useState(0);
  const [setsDone, setSetsDone] = useState(() => blocks.map(() => 0));
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState(null);
  const [notes, setNotes] = useState("");
  const [showMissed, setShowMissed] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!resting) return;
    if (restLeft <= 0) {
      setResting(false);
      return;
    }
    const t = setTimeout(() => setRestLeft((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resting, restLeft]);

  if (!blocks || blocks.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-surfaceRaised border border-line text-mist flex items-center justify-center mx-auto mb-6 text-2xl">
          🛌
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Rest & Recovery Day</h1>
        <p className="text-mist text-sm mb-8 max-w-sm mx-auto">
          No training session scheduled for this day. Muscles recover and rebuild during rest.
        </p>
        <button className="btn-secondary px-6 py-3" onClick={() => navigate("/")}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const block = blocks[idx] || blocks[0];
  const progressPct = Math.round(((idx + (setsDone[idx] / (block.sets || 1))) / blocks.length) * 100);

  const completeSet = () => {
    const currentSets = setsDone[idx] || 0;
    const nextSets = currentSets + 1;

    setSetsDone((s) => {
      const copy = [...s];
      copy[idx] = nextSets;
      return copy;
    });

    if (block.restSec) {
      setResting(true);
      setRestLeft(block.restSec);
    }

    if (nextSets >= (block.sets || 1)) {
      goNext();
    }
  };

  const goNext = () => {
    if (idx < blocks.length - 1) {
      setIdx(idx + 1);
      setResting(false);
    } else {
      setFinished(true);
    }
  };

  const goPrev = () => {
    setIdx((i) => Math.max(0, i - 1));
    setResting(false);
  };

  const skip = () => goNext();

  const finishWorkout = (rating) => {
    setDifficultyRating(rating);
    logWorkout(offsetNum, {
      status: "completed",
      durationSec: elapsed,
      perceivedDifficulty: rating,
      notes,
      exercises: blocks.map((b, i) => ({ name: b.name, setsCompleted: setsDone[i], setsTarget: b.sets })),
    });
  };

  /* Screen: Finished -> RPE Rating */
  if (finished && !difficultyRating) {
    return (
      <div className="max-w-lg mx-auto px-5 sm:px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-3xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center mx-auto mb-6 shadow-glow">
          <IconTrophy className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-2">Session Complete! 🔥</h1>
        <p className="text-mist text-sm mb-8">
          {day.title} · <span className="font-mono text-accent font-bold">{formatTime(elapsed)}</span>
        </p>

        <div className="card p-6 mb-8 text-left space-y-3">
          <Row label="Total Duration" value={formatTime(elapsed)} isMono />
          <Row label="Exercises Completed" value={`${blocks.length} drills`} />
          <Row label="Total Sets Logged" value={`${setsDone.reduce((a, b) => a + b, 0)} sets`} />
        </div>

        <div className="mb-8 text-left">
          <p className="text-sm font-semibold text-bone mb-1">Rate Session Difficulty</p>
          <p className="text-xs text-mist mb-4">This helps calibrate future volume and load.</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {RPE_RATINGS.map((r) => (
              <button
                key={r.label}
                type="button"
                className="p-4 rounded-2xl bg-surface border border-line text-left hover:border-accent hover:bg-surfaceHover transition-all group"
                onClick={() => finishWorkout(r.label)}
              >
                <div className="text-xl mb-1">{r.emoji}</div>
                <div className="font-display font-bold text-bone group-hover:text-accent transition-colors">
                  {r.label}
                </div>
                <div className="text-[11px] text-mist">{r.desc}</div>
              </button>
            ))}
          </div>

          <label className="block">
            <span className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">
              Athlete Notes (Optional)
            </span>
            <textarea
              className="input-base"
              rows={3}
              placeholder="e.g., Felt fast on footwork drills, slight tightness in hamstrings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      </div>
    );
  }

  /* Screen: Saved / Confirmed */
  if (difficultyRating) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center mx-auto mb-6 shadow-glow animate-bounce">
          <IconCheck className="w-10 h-10" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-3">Great Work, Champ!</h1>
        <p className="text-mist text-sm mb-8 leading-relaxed">
          Your training data has been recorded. Your recovery timeline and weekly consistency score have been updated.
        </p>
        <button className="btn-primary w-full py-3.5 text-base" onClick={() => navigate("/")}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  /* Active Workout Console */
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-line/60">
        <button
          className="btn-ghost text-xs text-mist hover:text-bone flex items-center gap-1.5"
          onClick={() => {
            if (window.confirm("Exit workout? Your session progress for today will remain open.")) {
              navigate("/");
            }
          }}
        >
          <span>← Exit Workout</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal border border-line">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-bone">{formatTime(elapsed)}</span>
        </div>

        <button
          className="text-xs text-mist hover:text-accent underline transition-colors"
          onClick={() => setShowMissed(true)}
        >
          Reschedule?
        </button>
      </div>

      {/* Progress Bar & Drill Step Indicator */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-mist font-medium">
            Drill <span className="text-bone font-bold">{idx + 1}</span> of {blocks.length}
          </span>
          <span className="font-mono text-accent font-bold">{progressPct}%</span>
        </div>
        <div className="progress-track h-2.5">
          <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }} />
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="card card-glow-accent p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle background icon */}
        <div className="absolute -right-6 -bottom-6 text-surfaceRaised/40 pointer-events-none select-none">
          <IconDumbbell className="w-48 h-48" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="badge-neon">
              {block.category || "Main Focus"}
            </span>
            {block.equipment && (
              <span className="badge-neutral text-[10px]">
                {block.equipment}
              </span>
            )}
          </div>

          <h2 className="font-display text-2xl sm:text-4xl font-bold text-bone mb-3">
            {block.name}
          </h2>

          <p className="text-mist text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
            {block.instructions || block.purpose || "Perform each rep with full athletic intent and proper posture."}
          </p>

          {/* Sets & Target Details */}
          <div className="p-6 rounded-2xl bg-surface/80 border border-line/80 mb-8 max-w-lg">
            {block.sets ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-mist">
                    Set Progress
                  </span>
                  <span className="font-mono text-sm font-bold text-accent">
                    {Math.min(setsDone[idx] + 1, block.sets)} / {block.sets}
                  </span>
                </div>

                {/* Set Pills */}
                <div className="flex items-center gap-2 mb-5">
                  {Array.from({ length: block.sets }).map((_, sIdx) => {
                    const isDone = sIdx < (setsDone[idx] || 0);
                    const isCurrent = sIdx === (setsDone[idx] || 0);

                    return (
                      <div
                        key={sIdx}
                        className={`flex-1 py-2 rounded-xl text-center text-xs font-bold border transition-all ${
                          isDone
                            ? "bg-accent/20 border-accent text-accent shadow-glow-sm"
                            : isCurrent
                            ? "bg-surfaceRaised border-accent/60 text-bone animate-pulse"
                            : "bg-surface border-line text-mist/50"
                        }`}
                      >
                        {isDone ? `✓ Set ${sIdx + 1}` : `Set ${sIdx + 1}`}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-line/60 text-sm">
                  <span className="text-mist">Target:</span>
                  <span className="font-display font-bold text-bone">
                    {block.reps ? `${block.reps} Reps` : block.durationSec ? `${block.durationSec}s Duration` : "Per form"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <span className="text-xs text-mist block mb-1">Target Duration</span>
                <span className="font-mono text-3xl font-bold text-accent">
                  {formatTime(block.durationSec || 60)}
                </span>
              </div>
            )}
          </div>

          {/* Rest Timer Countdown */}
          {resting && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-8 max-w-lg flex items-center justify-between shadow-glow-amber animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-300 block">
                    Resting Between Sets
                  </span>
                  <span className="font-mono text-2xl font-bold text-amber-400">
                    {formatTime(restLeft)}
                  </span>
                </div>
              </div>
              <button
                className="btn-secondary text-xs py-2 px-4 border-amber-500/40 text-amber-300 hover:text-amber-400"
                onClick={() => setResting(false)}
              >
                Skip Rest ➔
              </button>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {!resting && block.sets && (
              <button
                type="button"
                className="btn-primary py-3.5 px-8 text-base shadow-glow flex-1 sm:flex-initial"
                onClick={completeSet}
              >
                <IconCheck className="w-5 h-5 stroke-[3]" />
                <span>Complete Set {Math.min(setsDone[idx] + 1, block.sets)}</span>
              </button>
            )}

            {!block.sets && !resting && (
              <button
                type="button"
                className="btn-primary py-3.5 px-8 text-base shadow-glow flex-1 sm:flex-initial"
                onClick={goNext}
              >
                <IconCheck className="w-5 h-5 stroke-[3]" />
                <span>Drill Finished</span>
              </button>
            )}

            <button
              type="button"
              className="btn-secondary py-3.5 px-5 text-sm"
              onClick={skip}
            >
              <IconSkip className="w-4 h-4" />
              <span>Skip Drill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Prev / Next / Finish */}
      <div className="flex items-center justify-between pt-4">
        <button
          className="btn-secondary px-5 py-2.5 text-xs"
          onClick={goPrev}
          disabled={idx === 0}
        >
          ← Previous Drill
        </button>

        <button
          className="btn-ghost text-xs text-accent hover:underline font-semibold"
          onClick={() => setFinished(true)}
        >
          End Session Early
        </button>

        <button
          className="btn-secondary px-5 py-2.5 text-xs text-bone"
          onClick={goNext}
        >
          {idx === blocks.length - 1 ? "Finish Session →" : "Next Drill →"}
        </button>
      </div>

      {/* Missed / Reschedule Modal */}
      {showMissed && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setShowMissed(false)}
        >
          <div
            className="card p-6 sm:p-8 max-w-md w-full shadow-2xl border-lineBright"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <IconClock className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Adjust Today's Workout</h3>
            <p className="text-mist text-xs mb-6 leading-relaxed">
              Young athletes have exams, games, and busy schedules. Adjusting your workout keeps your streak intact and avoids burnout.
            </p>

            <div className="space-y-2.5">
              {[
                { id: "move", label: "Move it to tomorrow", icon: "📅" },
                { id: "shorten", label: "Shorten session to 20 mins", icon: "⚡" },
                { id: "reschedule", label: "Reschedule this week's plan", icon: "🔄" },
                { id: "skip", label: "Skip today entirely", icon: "⏭️" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className="w-full text-left p-3.5 rounded-xl bg-surface hover:bg-surfaceHover border border-line hover:border-accent/40 flex items-center gap-3 transition-colors text-sm font-medium"
                  onClick={() => {
                    handleMissed(offsetNum, opt.id);
                    setShowMissed(false);
                    navigate("/");
                  }}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-bone">{opt.label}</span>
                </button>
              ))}
            </div>

            <button
              className="btn-ghost w-full mt-4 text-xs text-mist"
              onClick={() => setShowMissed(false)}
            >
              Cancel & Continue Workout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, isMono }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-line/40 last:border-0">
      <span className="text-mist text-xs">{label}</span>
      <span className={`text-sm font-bold text-bone ${isMono ? "font-mono text-accent" : ""}`}>
        {value}
      </span>
    </div>
  );
}
