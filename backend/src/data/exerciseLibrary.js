// Sport-specific training categories and exercise pools.
// Each category has a pool of exercises tagged by difficulty (1-4) and
// the equipment they need ("none" always available).
//
// This is intentionally data-driven so new sports/categories can be added
// without touching the plan-generation logic in planGenerator.js.

export const SPORT_LIBRARY = {
  basketball: {
    label: "Basketball",
    categories: {
      shooting: {
        label: "Shooting",
        exercises: [
          { name: "Form Shooting", difficulty: 1, equipment: ["basketball"], purpose: "Builds clean shooting mechanics close to the rim.", sets: 5, reps: 10, restSec: 30 },
          { name: "Spot Shooting", difficulty: 2, equipment: ["basketball"], purpose: "Improves catch-and-set accuracy from fixed spots.", sets: 5, reps: 10, restSec: 30 },
          { name: "Catch-and-Shoot", difficulty: 2, equipment: ["basketball"], purpose: "Trains game-speed release off the pass.", sets: 5, reps: 8, restSec: 30 },
          { name: "Free Throws", difficulty: 1, equipment: ["basketball"], purpose: "Builds routine and consistency at the line.", sets: 2, reps: 10, restSec: 20 },
          { name: "Off-the-Dribble Pull-Up", difficulty: 3, equipment: ["basketball"], purpose: "Trains shooting off movement and change of direction.", sets: 4, reps: 8, restSec: 45 },
          { name: "Contested Shooting (chair/pad)", difficulty: 4, equipment: ["basketball"], purpose: "Simulates a hand in your face at game speed.", sets: 4, reps: 8, restSec: 45 },
        ],
      },
      ballHandling: {
        label: "Ball Handling",
        exercises: [
          { name: "Stationary Dribble Series", difficulty: 1, equipment: ["basketball"], purpose: "Builds ball control and hand strength.", durationSec: 240, restSec: 30 },
          { name: "Two-Ball Dribbling", difficulty: 3, equipment: ["basketball"], purpose: "Builds coordination and non-dominant hand control.", durationSec: 180, restSec: 45 },
          { name: "Cone Dribble Combos", difficulty: 2, equipment: ["basketball"], purpose: "Combines handling with change of direction.", sets: 4, reps: 1, restSec: 40 },
          { name: "Full-Speed Coast-to-Coast", difficulty: 3, equipment: ["basketball"], purpose: "Trains handling under fatigue at game pace.", sets: 6, reps: 1, restSec: 45 },
        ],
      },
      finishing: {
        label: "Finishing",
        exercises: [
          { name: "Layup Lines (both hands)", difficulty: 1, equipment: ["basketball"], purpose: "Builds finishing touch off two feet.", sets: 4, reps: 8, restSec: 30 },
          { name: "Euro Step Finishes", difficulty: 3, equipment: ["basketball"], purpose: "Adds an advanced finishing counter around defenders.", sets: 4, reps: 6, restSec: 40 },
          { name: "Contact Finishing (through a pad)", difficulty: 4, equipment: ["basketball"], purpose: "Trains finishing through contact.", sets: 4, reps: 6, restSec: 45 },
        ],
      },
      footwork: {
        label: "Footwork",
        exercises: [
          { name: "Defensive Slide Ladder", difficulty: 2, equipment: [], purpose: "Improves lateral quickness and stance.", durationSec: 180, restSec: 30 },
          { name: "Pivot & Jab Series", difficulty: 1, equipment: ["basketball"], purpose: "Builds a reliable triple-threat footwork base.", sets: 4, reps: 8, restSec: 30 },
        ],
      },
      conditioning: {
        label: "Conditioning",
        exercises: [
          { name: "Full-Court Sprints", difficulty: 3, equipment: [], purpose: "Builds game-speed conditioning.", sets: 8, reps: 1, restSec: 40 },
          { name: "Defensive Slide Intervals", difficulty: 2, equipment: [], purpose: "Builds lateral endurance.", sets: 6, reps: 1, restSec: 30 },
        ],
      },
      strength: {
        label: "Strength & Vertical",
        exercises: [
          { name: "Bodyweight Squats", difficulty: 1, equipment: [], purpose: "Builds leg strength as a jumping foundation.", sets: 4, reps: 15, restSec: 45 },
          { name: "Jump Squats", difficulty: 2, equipment: [], purpose: "Builds explosive leg power.", sets: 4, reps: 10, restSec: 60 },
          { name: "Depth Jumps", difficulty: 4, equipment: [], purpose: "Advanced plyometric for vertical jump.", sets: 4, reps: 6, restSec: 90 },
          { name: "Goblet Squats", difficulty: 2, equipment: ["dumbbells"], purpose: "Builds lower-body strength with load.", sets: 4, reps: 10, restSec: 60 },
        ],
      },
    },
  },

  soccer: {
    label: "Football / Soccer",
    aliases: ["football", "futbol"],
    categories: {
      shooting: {
        label: "Shooting & Finishing",
        exercises: [
          { name: "Static Ball Striking", difficulty: 1, equipment: ["football"], purpose: "Builds clean striking technique.", sets: 4, reps: 10, restSec: 30 },
          { name: "First-Time Finishing", difficulty: 3, equipment: ["football"], purpose: "Trains one-touch finishing under time pressure.", sets: 5, reps: 8, restSec: 40 },
          { name: "1v1 Finishing vs Keeper/Target", difficulty: 4, equipment: ["football"], purpose: "Game-realistic finishing under pressure.", sets: 4, reps: 6, restSec: 45 },
        ],
      },
      ballControl: {
        label: "Ball Control & First Touch",
        exercises: [
          { name: "Juggling", difficulty: 1, equipment: ["football"], purpose: "Builds overall touch and ball feel.", durationSec: 180, restSec: 30 },
          { name: "Wall Passing & First Touch", difficulty: 2, equipment: ["football"], purpose: "Trains receiving under a clean, then a difficult, touch.", sets: 5, reps: 10, restSec: 30 },
          { name: "Receiving Under Pressure", difficulty: 3, equipment: ["football"], purpose: "Simulates first touch with a defender closing.", sets: 4, reps: 8, restSec: 40 },
        ],
      },
      dribbling: {
        label: "Dribbling",
        exercises: [
          { name: "Cone Dribbling Circuit", difficulty: 1, equipment: ["football"], purpose: "Builds close control at speed.", sets: 4, reps: 1, restSec: 30 },
          { name: "1v1 Moves vs Mannequin/Cone", difficulty: 3, equipment: ["football"], purpose: "Adds an attacking move to beat a defender.", sets: 4, reps: 6, restSec: 40 },
        ],
      },
      passing: {
        label: "Passing",
        exercises: [
          { name: "Short Passing Accuracy", difficulty: 1, equipment: ["football"], purpose: "Builds passing accuracy over short range.", sets: 4, reps: 10, restSec: 30 },
          { name: "Long Diagonal Switches", difficulty: 3, equipment: ["football"], purpose: "Builds range and accuracy of long passing.", sets: 4, reps: 8, restSec: 40 },
        ],
      },
      speed: {
        label: "Sprinting & Acceleration",
        exercises: [
          { name: "10m Acceleration Sprints", difficulty: 2, equipment: [], purpose: "Trains first-step acceleration.", sets: 6, reps: 1, restSec: 45 },
          { name: "Repeated Sprint Shuttle", difficulty: 3, equipment: [], purpose: "Builds match-realistic repeat-sprint ability.", sets: 8, reps: 1, restSec: 40 },
        ],
      },
      conditioning: {
        label: "Endurance",
        exercises: [
          { name: "Interval Runs", difficulty: 2, equipment: [], purpose: "Builds aerobic base for a full match.", durationSec: 900, restSec: 60 },
          { name: "Small-Sided Game Simulation", difficulty: 3, equipment: ["football"], purpose: "Match-realistic conditioning with the ball.", durationSec: 600, restSec: 60 },
        ],
      },
    },
  },

  boxing: {
    label: "Boxing",
    categories: {
      footwork: {
        label: "Footwork",
        exercises: [
          { name: "Ladder/Shadow Footwork Drill", difficulty: 1, equipment: [], purpose: "Builds balanced, mobile stance and footwork.", durationSec: 180, restSec: 30 },
          { name: "Pivot & Angle Drills", difficulty: 2, equipment: [], purpose: "Trains creating angles off the opponent's line.", durationSec: 180, restSec: 30 },
        ],
      },
      shadowBoxing: {
        label: "Shadow Boxing",
        exercises: [
          { name: "Shadow Boxing Rounds", difficulty: 1, equipment: [], purpose: "Grooves technique and combinations with no resistance.", durationSec: 180, restSec: 60 },
          { name: "Shadow Boxing with Visualization Rounds", difficulty: 2, equipment: [], purpose: "Adds imagined opponent reactions to combinations.", durationSec: 180, restSec: 60 },
        ],
      },
      heavyBag: {
        label: "Heavy Bag",
        exercises: [
          { name: "Jab-Cross Bag Rounds", difficulty: 1, equipment: [], purpose: "Builds power and timing on the fundamentals.", durationSec: 180, restSec: 60 },
          { name: "Combination Bag Rounds", difficulty: 3, equipment: [], purpose: "Trains longer combinations under fatigue.", durationSec: 180, restSec: 60 },
        ],
      },
      defense: {
        label: "Defense & Reflexes",
        exercises: [
          { name: "Slip Rope Drill", difficulty: 2, equipment: [], purpose: "Trains head movement and slipping punches.", durationSec: 180, restSec: 45 },
          { name: "Reaction Ball / Partner Reflex Drill", difficulty: 3, equipment: [], purpose: "Sharpens reaction speed.", durationSec: 120, restSec: 45 },
        ],
      },
      conditioning: {
        label: "Conditioning",
        exercises: [
          { name: "Jump Rope Rounds", difficulty: 1, equipment: ["jump_rope"], purpose: "Builds footwork endurance and conditioning.", durationSec: 180, restSec: 45 },
          { name: "Round-Based Circuit (burpees/mitts/bag)", difficulty: 3, equipment: [], purpose: "Simulates the demands of fight rounds.", durationSec: 180, restSec: 60 },
        ],
      },
    },
  },

  tennis: {
    label: "Tennis",
    categories: {
      serve: {
        label: "Serve",
        exercises: [
          { name: "Serve Toss Repetitions", difficulty: 1, equipment: [], purpose: "Builds a consistent, repeatable toss.", sets: 4, reps: 10, restSec: 30 },
          { name: "Target Serving", difficulty: 3, equipment: [], purpose: "Trains serve placement under a target constraint.", sets: 4, reps: 10, restSec: 40 },
        ],
      },
      forehand: {
        label: "Forehand",
        exercises: [
          { name: "Cross-Court Forehand Rally", difficulty: 2, equipment: [], purpose: "Builds consistency and depth off the forehand.", durationSec: 300, restSec: 45 },
        ],
      },
      backhand: {
        label: "Backhand",
        exercises: [
          { name: "Cross-Court Backhand Rally", difficulty: 2, equipment: [], purpose: "Builds consistency and depth off the backhand.", durationSec: 300, restSec: 45 },
        ],
      },
      footwork: {
        label: "Footwork & Agility",
        exercises: [
          { name: "Split-Step & Lateral Shuffle Drill", difficulty: 2, equipment: [], purpose: "Trains the split step and recovery footwork.", durationSec: 180, restSec: 30 },
        ],
      },
      matchDrills: {
        label: "Match Drills",
        exercises: [
          { name: "Point Play to 11", difficulty: 3, equipment: [], purpose: "Simulates match pressure and decision-making.", durationSec: 600, restSec: 60 },
        ],
      },
    },
  },

  running: {
    label: "Running",
    categories: {
      easyRuns: {
        label: "Easy Runs",
        exercises: [
          { name: "Easy-Pace Run", difficulty: 1, equipment: [], purpose: "Builds aerobic base without excess fatigue.", durationSec: 1500, restSec: 0 },
        ],
      },
      intervals: {
        label: "Speed Intervals",
        exercises: [
          { name: "400m Repeats", difficulty: 3, equipment: [], purpose: "Builds VO2max and running speed.", sets: 6, reps: 1, restSec: 90 },
          { name: "Hill Sprints", difficulty: 4, equipment: [], purpose: "Builds power and running economy.", sets: 6, reps: 1, restSec: 90 },
        ],
      },
      tempo: {
        label: "Tempo Runs",
        exercises: [
          { name: "Tempo Run (comfortably hard)", difficulty: 3, equipment: [], purpose: "Builds lactate-threshold pace.", durationSec: 1200, restSec: 0 },
        ],
      },
      longRun: {
        label: "Long Run",
        exercises: [
          { name: "Weekly Long Run", difficulty: 2, equipment: [], purpose: "Builds endurance and durability.", durationSec: 2400, restSec: 0 },
        ],
      },
      strength: {
        label: "Runner's Strength",
        exercises: [
          { name: "Single-Leg Strength Circuit", difficulty: 2, equipment: [], purpose: "Builds injury-resistant running strength.", sets: 3, reps: 12, restSec: 45 },
        ],
      },
    },
  },

  strength: {
    label: "Gym / Strength Training",
    aliases: ["gym", "weightlifting", "powerlifting", "bodybuilding"],
    categories: {
      upperPush: {
        label: "Upper Body Push",
        exercises: [
          { name: "Push-Ups", difficulty: 1, equipment: [], purpose: "Builds pressing strength with no equipment.", sets: 4, reps: 12, restSec: 60 },
          { name: "Bench Press", difficulty: 2, equipment: ["barbell"], purpose: "Builds foundational upper-body pressing strength.", sets: 4, reps: 8, restSec: 90 },
          { name: "Overhead Press", difficulty: 3, equipment: ["barbell"], purpose: "Builds shoulder strength and stability.", sets: 4, reps: 8, restSec: 90 },
        ],
      },
      upperPull: {
        label: "Upper Body Pull",
        exercises: [
          { name: "Bodyweight Rows / Bent-Over Rows", difficulty: 2, equipment: [], purpose: "Builds back strength and posture.", sets: 4, reps: 10, restSec: 75 },
          { name: "Pull-Ups", difficulty: 3, equipment: ["pull_up_bar"], purpose: "Builds relative upper-body pulling strength.", sets: 4, reps: 6, restSec: 90 },
        ],
      },
      lowerBody: {
        label: "Lower Body",
        exercises: [
          { name: "Bodyweight Squats", difficulty: 1, equipment: [], purpose: "Builds a foundational squat pattern.", sets: 4, reps: 15, restSec: 60 },
          { name: "Back Squat", difficulty: 3, equipment: ["barbell"], purpose: "Builds maximal lower-body strength.", sets: 4, reps: 6, restSec: 120 },
          { name: "Romanian Deadlift", difficulty: 3, equipment: ["barbell"], purpose: "Builds posterior-chain strength.", sets: 4, reps: 8, restSec: 90 },
        ],
      },
      core: {
        label: "Core",
        exercises: [
          { name: "Plank Series", difficulty: 1, equipment: [], purpose: "Builds core stability.", sets: 3, reps: 1, durationSec: 45, restSec: 45 },
          { name: "Hanging Leg Raises", difficulty: 3, equipment: ["pull_up_bar"], purpose: "Builds advanced core strength.", sets: 3, reps: 12, restSec: 60 },
        ],
      },
      conditioning: {
        label: "Conditioning",
        exercises: [
          { name: "Kettlebell/Dumbbell Circuit", difficulty: 3, equipment: ["dumbbells"], purpose: "Builds work capacity and conditioning.", durationSec: 600, restSec: 60 },
        ],
      },
    },
  },

  general: {
    label: "General Athletic Development",
    aliases: ["general_fitness", "general athletic", "get fit", "fitness", "athletic development", "all-round"],
    categories: {
      strength: {
        label: "Strength",
        exercises: [
          { name: "Bodyweight Squats", difficulty: 1, equipment: [], purpose: "Builds general lower-body strength.", sets: 4, reps: 15, restSec: 60 },
          { name: "Push-Ups", difficulty: 1, equipment: [], purpose: "Builds general upper-body strength.", sets: 4, reps: 12, restSec: 60 },
          { name: "Weighted Step-Ups", difficulty: 3, equipment: ["dumbbells"], purpose: "Builds unilateral leg strength.", sets: 4, reps: 10, restSec: 75 },
        ],
      },
      speed: {
        label: "Speed & Agility",
        exercises: [
          { name: "Sprint Intervals", difficulty: 2, equipment: [], purpose: "Builds general speed.", sets: 6, reps: 1, restSec: 60 },
          { name: "Agility Ladder / Cone Drill", difficulty: 2, equipment: [], purpose: "Builds change-of-direction ability.", durationSec: 180, restSec: 30 },
        ],
      },
      conditioning: {
        label: "Conditioning",
        exercises: [
          { name: "Interval Circuit", difficulty: 2, equipment: [], purpose: "Builds general work capacity.", durationSec: 600, restSec: 60 },
        ],
      },
      mobility: {
        label: "Mobility",
        exercises: [
          { name: "Full-Body Mobility Flow", difficulty: 1, equipment: [], purpose: "Improves joint range of motion and movement quality.", durationSec: 480, restSec: 0 },
        ],
      },
      skill: {
        label: "Sport Skill",
        exercises: [
          { name: "Technical Skill Practice", difficulty: 2, equipment: [], purpose: "Deliberate practice on your sport's core technique.", durationSec: 600, restSec: 30 },
        ],
      },
    },
  },
};

// Resolve a free-typed sport string to a library entry (falls back to "general").
export function resolveSport(sportInput) {
  const key = (sportInput || "").trim().toLowerCase();
  for (const [id, sport] of Object.entries(SPORT_LIBRARY)) {
    if (id === key) return { id, ...sport };
    if (sport.aliases?.some((a) => key.includes(a))) return { id, ...sport };
    if (key.includes(id)) return { id, ...sport };
  }
  return { id: "general", ...SPORT_LIBRARY.general };
}

export const RECOVERY_ACTIVITIES = [
  { name: "Light Mobility Flow", purpose: "Keeps joints moving without adding fatigue.", durationSec: 600 },
  { name: "Static Stretching Routine", purpose: "Improves flexibility and aids recovery.", durationSec: 600 },
  { name: "Easy Walk / Bike", purpose: "Active recovery to promote blood flow.", durationSec: 1200 },
  { name: "Foam Rolling", purpose: "Reduces muscle tightness after hard training.", durationSec: 480 },
];
