# FitPath — Personalized Sports Training Platform for Young Athletes (12–18)

FitPath turns "I want to get better at basketball" into an exact, day-by-day
training journey: onboarding → long-term plan → this month → this week →
today's workout → set-by-set player → progress tracking → adaptive re-planning.

This repo contains a full project scaffold:

```
fitpath/
├── frontend/   React + Vite + Tailwind app (the whole product experience)
└── backend/    Node + Express + Prisma/PostgreSQL API + plan-generation engine
```

## Quick start (frontend only — no backend/DB needed)

The frontend works standalone: it runs the same plan-generation engine
locally in the browser and stores everything in `localStorage`, so you can
click through the entire product (onboarding, plan, workout player,
progress, AI Coach placeholder) with zero setup.

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL. Complete onboarding to generate your plan.

## Running the real backend (Postgres + Prisma + API)

Once you're ready to persist real accounts and let multiple devices share
a plan, wire the frontend to the API:

```bash
cd backend
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm install
npx prisma migrate dev --name init
npm run dev                 # http://localhost:4000
```

Then in `frontend/.env`:

```
VITE_API_URL=http://localhost:4000
```

`frontend/src/lib/api.js` automatically switches from local mode to real
API calls when `VITE_API_URL` is set.

## What's implemented

- Multi-step onboarding — name, age, gender, height, weight, **blood group**,
  a free-text sport field **or "I don't have a main sport yet" for building
  general athleticism** (ages 12–18 only), goals, experience, difficulty,
  schedule, equipment, transformation length, and a simple work/school
  yes-no + hours question. Every step is validated: leaving required fields
  empty and pressing Continue shows "Please fill in everything on this page
  before continuing." and keeps you on that step.
- **AI-recommended daily schedule** (`lib/scheduleAI.js`, mirrored on the
  backend): the athlete never picks a wake-up or sleep time directly — FitPath
  works out wake time, training time, and bedtime itself from their work/
  school hours and session length, targeting age-appropriate sleep and never
  scheduling training over school/work.
- A sport-aware **plan generator** (`lib/planGenerator.js`) that builds a full
  long-term journey — months → weeks → days — with progressive phases
  (Foundation → Development → Performance → Advanced → Optimization →
  Evaluation) instead of repeating one week
- Sport-specific exercise templates for Basketball, Football/Soccer, Boxing,
  Tennis, Running, Gym/Strength, a **General Athletic Development track**
  for young athletes with no main sport yet, and a smart generic fallback for any
  other typed-in sport
- Dashboard, weekly schedule, interactive workout player, missed-workout
  handling, performance logging, progress dashboard with charts, goals,
  exercise library, recovery, profile + regenerate, and an AI Coach panel
  wired to call an LLM with the user's live plan context
- **AI food photo scanner** (Nutrition page): upload/take a photo of a meal
  and the backend calls Claude's vision API to estimate calories/macros and
  give a short verdict on how it supports the athlete's training —
  framed as a rough estimate and educational, never a diagnosis or strict
  diet order, with supportive, growth-focused framing (no weight-loss language) since all users are 12–18
- **Free-tier workout paywall**: if a free-plan athlete misses 3 training
  days in a calendar month, the app locks behind an upgrade screen until
  they either wait for next month or hit the (demo) "Upgrade to Premium"
  button. Premium accounts have no miss limit. Wire the upgrade button to a
  real payment provider before shipping.
- Prisma schema covering every model from the product spec (Users,
  UserProfiles, Sports, SportGoals, Exercises, TrainingPlans/Phases/
  Weeks/Days, WorkoutSessions/Exercises, PerformanceRecords, Goals,
  DailySchedules, ProgressRecords, Subscriptions, AIConversations)

## What you'll want to do next

- Run `npx prisma migrate dev` against a real Postgres instance and seed
  `exerciseLibrary.js` into the `Exercise` table
- Add `ANTHROPIC_API_KEY` to `backend/.env` to power both the AI Coach chat
  and the food-photo scanner for real (both degrade gracefully without it)
- Replace the demo "Upgrade to Premium" button with a real payment flow
  (Stripe, etc.) and persist `subscription.plan` server-side via the
  `Subscription` model instead of local state
- Add real auth (the scaffold uses a minimal email+password/JWT flow —
  fine for a prototype, harden before production)
- Replace icon/video placeholders in the exercise library with real assets

This was generated as a working scaffold, not a hardened production app —
treat the safety copy (nutrition, food-scanner framing, training-difficulty
caps for minors, "not medical advice" language) as a starting point to
review, not a substitute for real safety/legal review before shipping.


## Guided workouts + AI Form Coach

- Every drill shows what to do, how to do it (3 steps), a video guide and timers.
- Squats, push-ups and planks can be counted and scored by the AI camera (on-device, nothing is uploaded).
- To play a video inside the app, put a YouTube ID in `videoId` for that drill in `frontend/src/data/exerciseGuides.js`.
- After pulling these changes run `npm install` in `frontend/` and `npm run prisma:migrate` in `backend/`.
