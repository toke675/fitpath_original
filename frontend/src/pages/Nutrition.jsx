import React, { useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { API_URL, apiRequest } from "../lib/api.js";
import {
  IconApple,
  IconCamera,
  IconSparkles,
  IconCheck,
} from "../components/Icons.jsx";

const TOPICS = [
  {
    title: "Balanced Fueling",
    body: "Aim for a color-rich plate of lean protein, complex carbohydrates, healthy fats, and greens at most meals — no single food group needs to be restricted.",
    icon: "🥗",
  },
  {
    title: "Protein for Muscle Repair",
    body: "Crucial for rebuilding muscle tissue after rigorous training drills. Reliable sources: eggs, dairy, chicken, fish, lentils, beans, and tofu.",
    icon: "🍗",
  },
  {
    title: "Complex Carbohydrates",
    body: "The primary high-octane fuel for athletic sprinting and stamina. Oats, brown rice, whole-grain pasta, fruit, and sweet potatoes.",
    icon: "🥔",
  },
  {
    title: "Essential Healthy Fats",
    body: "Supports teenage hormone production, brain health, and joint lubrication. Nuts, chia seeds, olive oil, and avocados.",
    icon: "🥑",
  },
  {
    title: "Hydration Strategy",
    body: "Drink water consistently throughout the day. Dehydration of just 2% significantly degrades athletic reaction time and sprint speed.",
    icon: "💧",
  },
  {
    title: "Pre-Workout Timing",
    body: "A light snack rich in easily digestible carbs with moderate protein 1–2 hours before training powers your performance without stomach cramps.",
    icon: "🍌",
  },
  {
    title: "Post-Workout Window",
    body: "Refuel with protein and carbohydrates within 45–90 minutes post-training to accelerate glycogen replenishment and muscle recovery.",
    icon: "🥪",
  },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function FoodScanner() {
  const { profile, plan, today } = useApp();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const context = {
    sport: plan?.sport,
    goals: profile?.goals,
    experience: profile?.experienceLevel,
    isMinor: profile?.age && profile.age < 18,
    todaysWorkout: today?.day?.title,
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setResult(null);
    setPreview(URL.createObjectURL(file));

    if (!API_URL) {
      setError(
        "Photo analysis requires the backend AI service connected (set VITE_API_URL and ANTHROPIC_API_KEY) — running in local mode right now."
      );
      return;
    }

    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await apiRequest("/api/ai/food-scan", {
        method: "POST",
        body: { imageBase64: base64, mediaType: file.type, context },
      });
      setResult(res);
    } catch (err) {
      setError(err.message || "Couldn't analyze that photo — try another one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-glow-accent p-6 sm:p-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconCamera className="w-5 h-5 text-accent" />
          <h2 className="font-display text-lg font-bold text-bone">AI Athlete Fuel Scanner</h2>
        </div>
        <span className="badge-neon text-[10px]">Vision AI</span>
      </div>

      <p className="text-mist text-xs sm:text-sm mb-6 max-w-xl leading-relaxed">
        Snap or upload a photo of your pre/post-workout meal. FitPath estimates macronutrients and evaluates whether it matches your athletic training demand today.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />

      <button
        type="button"
        className="btn-primary py-3 px-6 shadow-glow flex items-center gap-2.5 mb-6"
        onClick={() => inputRef.current?.click()}
      >
        <IconCamera className="w-4 h-4" />
        <span>Scan or Upload Meal Photo</span>
      </button>

      {preview && (
        <div className="p-5 rounded-2xl bg-surface/90 border border-line flex flex-col md:flex-row gap-6">
          <img
            src={preview}
            alt="Food preview"
            className="w-full md:w-56 h-56 object-cover rounded-xl border border-line shadow-md"
          />

          <div className="flex-1 space-y-4">
            {loading && (
              <div className="flex items-center gap-2 text-accent text-xs font-semibold py-4">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span>AI is identifying ingredients and estimating macros...</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-mist block mb-1">
                    Meal Identified
                  </span>
                  <h3 className="font-display text-xl font-bold text-bone">
                    {result.foodGuess}
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <MacroPill label="Calories" value={result.calories} unit="kcal" />
                  <MacroPill label="Protein" value={result.proteinG} unit="g" />
                  <MacroPill label="Carbs" value={result.carbsG} unit="g" />
                  <MacroPill label="Fats" value={result.fatG} unit="g" />
                </div>

                <div className="p-3.5 rounded-xl bg-surfaceRaised border border-line text-xs">
                  <span className="font-bold text-accent block mb-1">Coach Verdict:</span>
                  <p className="text-bone mb-1">{result.verdict}</p>
                  <p className="text-mist">{result.note}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MacroPill({ label, value, unit }) {
  return (
    <div className="p-3 rounded-xl bg-surface border border-line text-center">
      <div className="font-mono text-base font-bold text-accent">
        {value ?? "—"} <span className="text-[10px] font-normal text-mist">{unit}</span>
      </div>
      <div className="text-[10px] text-mist font-semibold uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  );
}

export default function Nutrition() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge-neon py-0.5 px-2 text-[10px]">
              <IconApple className="w-3 h-3" /> ATHLETIC FUEL
            </span>
            <span className="badge-neutral py-0.5 px-2 text-[10px]">
              Youth Sports Nutrition
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-bone">
            Nutrition & <span className="text-gradient-accent">Fueling</span>
          </h1>
          <p className="text-mist text-xs sm:text-sm mt-1">
            Nutritional fundamentals to maximize training adaptation, recovery speed, and cognitive sharpness
          </p>
        </div>
      </div>

      {/* AI Food Scanner */}
      <FoodScanner />

      {/* Topics Grid */}
      <div>
        <h2 className="font-display text-lg font-bold text-bone mb-4">
          Core Principles of Youth Athletic Nutrition
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPICS.map((t) => (
            <div
              key={t.title}
              className="card p-6 flex flex-col justify-between hover:border-lineBright transition-all"
            >
              <div>
                <div className="text-2xl mb-2">{t.icon}</div>
                <h3 className="font-display text-base font-bold text-bone mb-2">
                  {t.title}
                </h3>
                <p className="text-xs text-mist leading-relaxed">
                  {t.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minor Athlete Protection Callout */}
      <div className="p-5 rounded-2xl bg-surfaceRaised border border-line text-xs text-mist flex items-start gap-3">
        <span className="text-xl">🥗</span>
        <div className="leading-relaxed">
          <strong className="text-bone block mb-0.5">Youth Development Guidance:</strong>
          Growing adolescent bodies require sufficient caloric intake to fuel both high-intensity athletics and bone/muscle maturation. FitPath does not promote extreme caloric restriction. For tailored medical or dietary plans, consult a registered sports dietitian.
        </div>
      </div>
    </div>
  );
}
