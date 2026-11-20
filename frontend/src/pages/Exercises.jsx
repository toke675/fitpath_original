import React, { useMemo, useState } from "react";
import { SPORT_LIBRARY } from "../data/exerciseLibrary.js";
import {
  IconSearch,
  IconPlay,
  IconBook,
  IconClock,
  IconDumbbell,
} from "../components/Icons.jsx";

function flatten() {
  const rows = [];
  for (const [sportId, sport] of Object.entries(SPORT_LIBRARY)) {
    for (const [catId, cat] of Object.entries(sport.categories)) {
      for (const ex of cat.exercises) {
        rows.push({ sportId, sportLabel: sport.label, category: cat.label, ...ex });
      }
    }
  }
  return rows;
}

const ALL = flatten();
const DIFFICULTY_LABELS = ["", "Fundamental", "Intermediate", "Advanced", "Elite"];

export default function Exercises() {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const filtered = useMemo(() => {
    return ALL.filter((e) => {
      if (sport !== "all" && e.sportId !== sport) return false;
      if (difficulty !== "all" && String(e.difficulty) !== difficulty) return false;
      if (
        q &&
        !e.name.toLowerCase().includes(q.toLowerCase()) &&
        !e.category.toLowerCase().includes(q.toLowerCase()) &&
        !e.sportLabel.toLowerCase().includes(q.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [q, sport, difficulty]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconBook className="w-3 h-3" /> DRILL & TECHNIQUE VAULT
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              {ALL.length} Drills Across {Object.keys(SPORT_LIBRARY).length} Sports
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Exercise <span className="text-gradient-accent">Library</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            Curated youth-safe strength, plyometrics, speed, and sport-specific motor skills
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 sm:p-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <IconSearch className="w-4 h-4 text-mist absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            className="input-base pl-11"
            placeholder="Search exercises, skills, or drills..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select
          className="input-base w-auto min-w-[150px] cursor-pointer"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
        >
          <option value="all">All Sports</option>
          {Object.entries(SPORT_LIBRARY).map(([id, s]) => (
            <option key={id} value={id}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          className="input-base w-auto min-w-[150px] cursor-pointer"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="all">All Difficulties</option>
          {[1, 2, 3, 4].map((d) => (
            <option key={d} value={d}>
              Level {d} — {DIFFICULTY_LABELS[d]}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-mist px-1">
        <span>Showing <strong className="text-bone">{filtered.length}</strong> matching drills</span>
        {sport !== "all" && (
          <button
            onClick={() => { setSport("all"); setDifficulty("all"); setQ(""); }}
            className="text-accent hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Drill Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((e, i) => (
          <div
            key={i}
            className="card p-6 flex flex-col justify-between hover:border-lineBright hover:-translate-y-1 transition-all group"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="badge-neutral text-[10px]">
                  {e.sportLabel}
                </span>

                {/* Difficulty Dot Bar */}
                <div className="flex items-center gap-1 bg-surfaceRaised border border-line px-2 py-1 rounded-full" title={`Difficulty: ${DIFFICULTY_LABELS[e.difficulty]}`}>
                  {[1, 2, 3, 4].map((dot) => (
                    <span
                      key={dot}
                      className={`w-1.5 h-1.5 rounded-full ${dot <= e.difficulty ? "bg-accent shadow-glow-sm" : "bg-line"
                        }`}
                    />
                  ))}
                  <span className="text-[9px] font-mono font-bold text-mist ml-1">
                    L{e.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-bone mb-1 group-hover:text-accent transition-colors">
                {e.name}
              </h3>
              <p className="text-xs text-accent/80 font-medium mb-3">
                {e.category}
              </p>

              <p className="text-xs text-mist leading-relaxed mb-5">
                {e.purpose}
              </p>

              {/* Param Badges */}
              <div className="flex flex-wrap gap-2 text-xs mb-5">
                {e.sets && (
                  <span className="px-2.5 py-1 rounded-lg bg-surfaceRaised border border-line text-mist font-medium">
                    {e.sets} sets
                  </span>
                )}
                {e.reps && (
                  <span className="px-2.5 py-1 rounded-lg bg-surfaceRaised border border-line text-mist font-medium">
                    {e.reps} reps
                  </span>
                )}
                {e.durationSec && (
                  <span className="px-2.5 py-1 rounded-lg bg-surfaceRaised border border-line text-mist font-medium">
                    {Math.round(e.durationSec / 60)} min
                  </span>
                )}
                {e.restSec && (
                  <span className="px-2.5 py-1 rounded-lg bg-surfaceRaised border border-line text-mist font-medium">
                    {e.restSec}s rest
                  </span>
                )}
              </div>
            </div>

            {/* Video Demonstration Mockup Banner */}
            <div className="mt-2 h-28 rounded-xl bg-gradient-to-br from-surface to-charcoal border border-line/80 flex flex-col items-center justify-center relative overflow-hidden group/vid cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/40 text-accent flex items-center justify-center transition-transform group-hover/vid:scale-110 shadow-glow-sm">
                <IconPlay className="w-4 h-4 ml-0.5" />
              </div>
              <span className="text-[10px] font-semibold text-mist mt-2 group-hover/vid:text-bone transition-colors">
                Demonstration & Form Cue
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center max-w-md mx-auto">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="font-display text-lg font-bold text-bone mb-1">No drills matched</h3>
          <p className="text-mist text-xs mb-4">Try relaxing your search terms or selecting "All Sports".</p>
          <button
            className="btn-secondary text-xs px-4 py-2"
            onClick={() => { setSport("all"); setDifficulty("all"); setQ(""); }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
