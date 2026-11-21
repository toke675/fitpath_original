// Short, athlete-friendly guides for every drill in exerciseLibrary.js.
//
// Each guide has:
//   summary  – one sentence: what this drill is and why you do it
//   steps    – 3 short "how to do it" steps
//   avoid    – the #1 mistake to watch for
//   videoId  – OPTIONAL YouTube video ID (the part after ?v=). When filled in,
//              the video plays inside the app. When empty, the app shows a
//              "Watch how-to videos" button that opens a YouTube search instead.
//   query    – OPTIONAL custom YouTube search text (defaults to "<name> how to")
//   analyzer – OPTIONAL "squat" | "pushup" | "plank": drills the AI camera
//              can count and score (see lib/poseAnalysis.js)
//
// Guides are looked up by drill NAME at render time, so plans that were already
// generated and saved keep working — no need to regenerate anything.

const g = (summary, steps, avoid, extra = {}) => ({ summary, steps, avoid, videoId: "", ...extra });

export const EXERCISE_GUIDES = {
  // ───────────── Warm-up / cool-down / recovery ─────────────
  "Warm-up": g(
    "Wake your body up and raise your heart rate so you can train hard without getting hurt.",
    [
      "Start with 2–3 minutes of easy jogging or jumping jacks.",
      "Do arm circles, leg swings, hip circles and a few bodyweight squats.",
      "Build up speed little by little until you feel warm and loose.",
    ],
    "Long static stretching before training — save that for the cool down.",
    { query: "dynamic warm up for athletes" }
  ),
  "Cool Down": g(
    "Bring your heart rate down slowly and stretch the muscles you just worked.",
    [
      "Slow down to an easy walk for 1–2 minutes.",
      "Hold each stretch for 20–30 seconds (legs, hips, shoulders).",
      "Breathe in through your nose and out slowly through your mouth.",
    ],
    "Bouncing in a stretch or stretching until it hurts.",
    { query: "cool down stretches after workout" }
  ),
  "Light Mobility Flow": g(
    "Gentle joint movements that keep you loose on recovery days.",
    ["Move slowly through neck, shoulders, hips, knees and ankles.", "Do 8–10 smooth circles or reps per joint.", "Keep it easy — you should feel better afterwards, not tired."],
    "Pushing into pain or rushing through it.",
    { query: "light mobility routine for athletes" }
  ),
  "Static Stretching Routine": g(
    "Long, relaxed stretches to improve flexibility and help recovery.",
    ["Stretch calves, quads, hamstrings, hips, chest and shoulders.", "Hold each stretch 20–30 seconds, both sides.", "Relax into it and breathe slowly."],
    "Forcing the stretch or holding your breath.",
    { query: "full body static stretching routine" }
  ),
  "Easy Walk / Bike": g(
    "Low-effort movement that gets blood flowing to tired muscles.",
    ["Walk or cycle at an easy pace you could chat at.", "Keep your posture tall and shoulders relaxed.", "Stop when the time is up — this is not a workout."],
    "Turning recovery into a hard session.",
    { query: "active recovery walk benefits" }
  ),
  "Foam Rolling": g(
    "Self-massage that eases tight, sore muscles.",
    ["Place the roller under a muscle (calf, quad, back) and roll slowly.", "Pause for a few seconds on tight spots.", "Breathe and keep rolling for 30–60 seconds per muscle."],
    "Rolling directly on joints or your lower back.",
    { query: "foam rolling for beginners" }
  ),

  // ───────────── Basketball ─────────────
  "Form Shooting": g(
    "Close-range shots that groove a smooth, repeatable shooting motion.",
    [
      "Stand 1–2 m from the hoop, feet shoulder-width, shooting foot slightly forward.",
      "Hold the ball with your shooting hand under it and your guide hand on the side, elbow under the ball.",
      "Extend your elbow and flick your wrist so the ball arcs up with backspin; hold the follow-through.",
    ],
    "Pushing the ball with your guide hand or letting your elbow flare out."
  ),
  "Spot Shooting": g(
    "Shoot from fixed spots to build accuracy and a quick, consistent release.",
    ["Pick 5 spots around the arc and take your shots from each one.", "Land balanced with knees bent and eyes on the rim.", "Use the same motion every shot and hold your follow-through."],
    "Shooting before your feet are set."
  ),
  "Catch-and-Shoot": g(
    "Catch a pass and shoot in one smooth motion, just like in a game.",
    ["Show your hands as the pass comes and meet the ball.", "Catch with a small hop so your feet land ready to shoot.", "Rise straight up into your shot without dropping the ball low."],
    "Bringing the ball down to your waist before you shoot."
  ),
  "Free Throws": g(
    "Build a calm routine for shooting from the free-throw line.",
    ["Use the same routine every time: breathe, bounce, aim.", "Bend your knees and use your legs to power the shot.", "Hold your follow-through until the ball hits the rim."],
    "Changing your routine after a miss."
  ),
  "Off-the-Dribble Pull-Up": g(
    "Stop quickly off the dribble and shoot a balanced jump shot.",
    ["Dribble at game speed, then take a hard 1–2 step stop.", "Square your feet to the rim and rise straight up.", "Shoot at the top of your jump and land where you took off."],
    "Fading backward or leaning on your shot."
  ),
  "Contested Shooting (chair/pad)": g(
    "Shoot over a chair or pad to practice getting your shot off with a defender close.",
    ["Place a stable chair or pad about an arm's length in front of you.", "Raise the ball slightly higher and shoot over it.", "Stay balanced and finish with a full follow-through."],
    "Flattening your shot to avoid the obstacle — keep your normal arc."
  ),
  "Stationary Dribble Series": g(
    "Dribble in place with different patterns to build ball control.",
    ["Stay low with knees bent and your head up.", "Dribble with your fingertips, not your palm: side to side, in front, between the legs.", "Speed up only as long as you keep control."],
    "Staring at the ball the whole time."
  ),
  "Two-Ball Dribbling": g(
    "Dribble two balls at once to build coordination and a stronger off-hand.",
    ["Hold one ball in each hand, knees bent, head up.", "Start by bouncing both balls together, then alternate.", "Add variations like one high, one low."],
    "Slapping the balls — use your fingertips."
  ),
  "Cone Dribble Combos": g(
    "Link dribble moves with changes of direction around cones.",
    ["Set 4–5 cones in a line about 2 m apart.", "Use a different move at each cone (crossover, between the legs, behind the back).", "Explode out of each move toward the next cone."],
    "Slowing down right before each move."
  ),
  "Full-Speed Coast-to-Coast": g(
    "Dribble the full length of the court at game speed.",
    ["Start on the baseline with the ball.", "Dribble to the other end as fast as you can control it.", "Finish with a layup or a stop, then walk back to recover."],
    "Pushing the ball too far ahead and losing control."
  ),
  "Layup Lines (both hands)": g(
    "Finish layups with both your right and left hand.",
    ["Take a controlled dribble, then step off the opposite foot (right hand → left foot).", "Jump, lift your inside knee and reach high toward the backboard.", "Lay the ball in softly off the glass."],
    "Only practicing with your strong hand."
  ),
  "Euro Step Finishes": g(
    "A two-step move that lets you go around a defender before you finish.",
    ["Drive toward the hoop and gather the ball with a step in one direction.", "Take a long second step in the opposite direction.", "Finish with a soft layup, shielding the ball with your body."],
    "Traveling — count a clean “one-two” on your gather steps."
  ),
  "Contact Finishing (through a pad)": g(
    "Finish at the rim while a partner bumps you with a soft pad.",
    ["Have a partner hold a soft pad near the rim side.", "Drive and finish through the contact, keeping the ball high.", "Stay balanced and land under control."],
    "Closing your eyes or turning away from contact. Use a soft pad and a ready partner."
  ),
  "Defensive Slide Ladder": g(
    "Quick sideways slides that build defensive footwork.",
    ["Get low in a defensive stance: knees bent, chest up.", "Slide sideways without crossing your feet.", "Push off the outside foot to change direction fast."],
    "Standing tall or crossing your feet."
  ),
  "Pivot & Jab Series": g(
    "Footwork from triple-threat position so you can shoot, pass or drive.",
    ["Hold the ball in triple-threat position.", "Keep one foot planted as your pivot foot and step with the other.", "Use jab steps and pivots to read the defender."],
    "Lifting your pivot foot off the floor."
  ),
  "Full-Court Sprints": g(
    "All-out sprints that build game-speed conditioning.",
    ["Start on the baseline in an athletic stance.", "Sprint at full speed to the other baseline.", "Walk back to recover before the next rep."],
    "Sprinting at half-effort or skipping the warm-up."
  ),
  "Defensive Slide Intervals": g(
    "Repeated defensive slides to build lateral endurance.",
    ["Get low in your defensive stance.", "Slide from sideline to sideline (or cone to cone) as fast as you can.", "Rest between rounds and keep your chest up."],
    "Letting your hips rise as you get tired."
  ),
  "Bodyweight Squats": g(
    "Sit down and stand up with control to build leg strength.",
    [
      "Stand with feet shoulder-width apart, toes slightly out.",
      "Push your hips back and bend your knees until your thighs are about parallel to the floor.",
      "Keep your chest up, then push through your heels to stand.",
    ],
    "Knees caving inward or heels lifting off the floor.",
    { analyzer: "squat", query: "bodyweight squat proper form" }
  ),
  "Jump Squats": g(
    "Explosive squats that build jumping power.",
    ["Lower into a squat with your chest up.", "Jump up as high as you can, swinging your arms.", "Land softly with bent knees and go right into the next rep."],
    "Landing with stiff, straight legs.",
    { analyzer: "squat", query: "jump squat proper form" }
  ),
  "Depth Jumps": g(
    "An advanced jump drill that trains your legs to react fast off the ground.",
    ["Stand on a low, stable box (about 20–30 cm).", "Step off — don't jump — and land on both feet.", "The moment you land, jump up as high as you can."],
    "Using a box that's too high. Stop when your landings get sloppy."
  ),
  "Goblet Squats": g(
    "A squat holding a weight at your chest to build strong legs and good posture.",
    ["Hold a dumbbell at your chest with both hands.", "Squat down between your knees, keeping your chest tall.", "Drive through your heels to stand up."],
    "Letting the weight pull your chest forward.",
    { analyzer: "squat", query: "goblet squat form" }
  ),

  // ───────────── Soccer ─────────────
  "Static Ball Striking": g(
    "Strike a still ball cleanly to build good shooting technique.",
    ["Place the ball and take 2–3 steps back at a slight angle.", "Plant your standing foot next to the ball, pointing at the target.", "Strike the middle of the ball with your laces, ankle locked, and follow through."],
    "Leaning back or letting your ankle go loose."
  ),
  "First-Time Finishing": g(
    "Shoot the ball first time, without taking an extra touch.",
    ["Have a partner (or a wall) pass the ball to you.", "Get your body shape ready before the ball arrives.", "Strike it straight away toward the target."],
    "Taking an extra touch when you can shoot first time."
  ),
  "1v1 Finishing vs Keeper/Target": g(
    "Finish calmly when it's just you against the keeper.",
    ["Dribble toward goal at speed.", "Pick your corner early.", "Place the shot — accuracy first, power second."],
    "Blasting the ball without looking at your target."
  ),
  "Juggling": g(
    "Keep the ball in the air to improve touch and ball feel.",
    ["Drop the ball from your hands and kick it up softly.", "Use gentle touches to keep it low and close.", "Alternate feet when you can."],
    "Kicking the ball too high."
  ),
  "Wall Passing & First Touch": g(
    "Pass against a wall and control the rebound.",
    ["Stand 3–4 m from a wall and pass the ball against it.", "Control the ball with a soft first touch.", "Pass again, switching feet."],
    "A hard first touch that bounces away."
  ),
  "Receiving Under Pressure": g(
    "Control the ball with a defender close behind you.",
    ["Use a partner or a cone as a defender.", "Check your shoulder before the ball arrives.", "Take your first touch away from the pressure."],
    "Stopping the ball dead, which gives defenders time."
  ),
  "Cone Dribbling Circuit": g(
    "Dribble through cones to build close control at speed.",
    ["Set 6–8 cones in a line or zigzag.", "Dribble through with small touches, using both feet.", "Keep your head up and go faster each round."],
    "Big touches that let the ball run away."
  ),
  "1v1 Moves vs Mannequin/Cone": g(
    "Practice a move to beat a defender.",
    ["Approach the cone at speed.", "Use a move (step-over, scissors, feint) to fake it.", "Accelerate past and take your next touch away from it."],
    "Slowing down before the move."
  ),
  "Short Passing Accuracy": g(
    "Short, crisp passes that hit their target.",
    ["Set two cones or a target 5–10 m away.", "Pass with the inside of your foot, ankle locked.", "Follow through toward the target."],
    "Looking at the ball instead of the target at the last second."
  ),
  "Long Diagonal Switches": g(
    "Long passes that switch the play from one side to the other.",
    ["Open your body toward a target 25–35 m away.", "Strike under the middle of the ball with your laces.", "Follow through high and land on your kicking foot."],
    "Leaning back, which sends the ball too high."
  ),
  "10m Acceleration Sprints": g(
    "Short sprints that train an explosive first step.",
    ["Mark out 10 m with cones.", "Start from a low, leaning-forward stance.", "Drive your knees and arms hard for the first five steps."],
    "Standing up too early."
  ),
  "Repeated Sprint Shuttle": g(
    "Back-and-forth sprints like the ones you do in a match.",
    ["Set two cones 10–20 m apart.", "Sprint to one cone, touch the line and sprint back.", "Walk to recover between reps."],
    "Slowing down on the turn."
  ),
  "Interval Runs": g(
    "Alternate hard running with easy jogging to build endurance.",
    ["Run hard for the work interval, then jog easy for the rest.", "Pick a pace you can hold for the whole interval.", "Breathe steadily and finish strong."],
    "Sprinting the first interval and fading."
  ),
  "Small-Sided Game Simulation": g(
    "A small game (like 3v3) that builds match fitness with the ball.",
    ["Play in a limited area with a partner or friends.", "Keep moving and call for the ball.", "Play at match intensity for the full time."],
    "Standing still when you don't have the ball."
  ),

  // ───────────── Boxing ─────────────
  "Ladder/Shadow Footwork Drill": g(
    "Light, balanced footwork in your boxing stance.",
    ["Stand with feet shoulder-width, lead foot forward, knees bent.", "Move forward, back and side to side in small steps.", "Stay on the balls of your feet with your hands up."],
    "Crossing your feet or standing flat-footed."
  ),
  "Pivot & Angle Drills": g(
    "Turn off the line of attack to create angles.",
    ["Plant your lead foot and pivot on the ball of it.", "Turn your body about 45°.", "Reset your stance and guard every time."],
    "Lifting your pivot foot off the ground."
  ),
  "Shadow Boxing Rounds": g(
    "Throw punches at the air to groove your technique.",
    ["Start in your stance, chin tucked, hands up.", "Rotate your hips and snap each punch back to your chin.", "Move your feet between combinations and breathe out as you punch."],
    "Overextending your punches or dropping your guard."
  ),
  "Shadow Boxing with Visualization Rounds": g(
    "Shadow box against an imaginary opponent.",
    ["Picture an opponent in front of you.", "Throw a combo, then slip, block or move as if they hit back.", "Change angles and keep your hands up."],
    "Throwing punches without moving your feet."
  ),
  "Jab-Cross Bag Rounds": g(
    "Build power and timing on the two most important punches.",
    ["Stand an arm's length from the bag in your stance.", "Throw a straight jab, then a cross, rotating your back foot and hips.", "Snap each hand back to your chin."],
    "Pushing the bag instead of snapping the punch. Wrap your hands and wear bag gloves."
  ),
  "Combination Bag Rounds": g(
    "Chain punches together under fatigue.",
    ["Link 3–5 punches, like jab–cross–hook.", "Move your feet between combinations.", "Keep your hands up and punch with control."],
    "Dropping your guard when you get tired. Wrap your hands and wear bag gloves."
  ),
  "Slip Rope Drill": g(
    "Practice slipping punches by moving your head under a rope.",
    ["Stretch a rope at about shoulder height.", "Bend your knees and slip your head side to side under it.", "Keep your eyes forward and your hands up."],
    "Bending at the waist instead of the knees."
  ),
  "Reaction Ball / Partner Reflex Drill": g(
    "Sharpen your reflexes by reacting quickly.",
    ["Stand in a ready stance with soft knees.", "React to the ball or your partner's signal as fast as you can.", "Reset your stance after each rep."],
    "Anticipating instead of reacting."
  ),
  "Jump Rope Rounds": g(
    "Skipping rope builds footwork and endurance.",
    ["Hold the handles at hip height, elbows close to your body.", "Turn the rope with your wrists and jump just high enough to clear it.", "Land softly on the balls of your feet."],
    "Jumping too high or swinging your arms wide."
  ),
  "Round-Based Circuit (burpees/mitts/bag)": g(
    "A circuit that feels like fight rounds.",
    ["Work each station for the whole round (e.g. burpees, mitts, bag).", "Move quickly between stations.", "Rest in the break, then go again."],
    "Going so fast that your form falls apart."
  ),

  // ───────────── Tennis ─────────────
  "Serve Toss Repetitions": g(
    "Practice a consistent ball toss for a reliable serve.",
    ["Stand sideways to the net, feet shoulder-width.", "Lift the ball with a straight arm so it rises just in front of you.", "The toss should land in the same spot every time."],
    "Flicking the ball with your wrist."
  ),
  "Target Serving": g(
    "Serve to a target to improve placement.",
    ["Place a target in the service box.", "Use a relaxed toss and swing up to the ball.", "Aim for the target before adding power."],
    "Swinging as hard as possible and losing accuracy."
  ),
  "Cross-Court Forehand Rally": g(
    "Hit deep forehands cross-court to build consistency.",
    ["Split-step as your partner hits.", "Turn your shoulders early and swing low to high.", "Hit cross-court with depth and recover to the middle."],
    "Hitting late and off your back foot."
  ),
  "Cross-Court Backhand Rally": g(
    "Hit deep backhands cross-court to build consistency.",
    ["Split-step as your partner hits.", "Turn your shoulders early and swing low to high.", "Hit cross-court with depth and recover to the middle."],
    "Reaching for the ball instead of moving your feet."
  ),
  "Split-Step & Lateral Shuffle Drill": g(
    "Footwork for reacting quickly to the ball.",
    ["Do a small hop (split-step) as your opponent hits.", "Push off the outside foot to move sideways.", "Recover to the center after each shot."],
    "Crossing your feet when you move sideways."
  ),
  "Point Play to 11": g(
    "Play points to 11 to practice under pressure.",
    ["Play points to 11 with a partner.", "Use your best patterns: serve, rally, finish.", "Stay focused on every single point."],
    "Letting one bad point affect the next."
  ),

  // ───────────── Running ─────────────
  "Easy-Pace Run": g(
    "A relaxed run that builds your aerobic base.",
    ["Run at a pace where you can talk.", "Stand tall with relaxed shoulders and quick, light steps.", "Breathe smoothly."],
    "Running too fast on an easy day."
  ),
  "400m Repeats": g(
    "Fast, controlled 400 m efforts to build speed.",
    ["Warm up first, then run 400 m fast but controlled.", "Aim for the same pace on every repeat.", "Walk or jog slowly to recover."],
    "Going out too fast on the first one."
  ),
  "Hill Sprints": g(
    "Short uphill sprints that build power.",
    ["Find a hill with a moderate slope.", "Sprint up leaning slightly forward and driving your knees.", "Walk back down carefully."],
    "Running down the hill fast — walk it."
  ),
  "Tempo Run (comfortably hard)": g(
    "A steady run at a 'comfortably hard' pace to raise your endurance.",
    ["Start easy, then settle into a pace that feels comfortably hard.", "Stay steady for the whole time.", "Finish with an easy jog."],
    "Starting too fast."
  ),
  "Weekly Long Run": g(
    "Your longest run of the week to build endurance.",
    ["Start slowly.", "Keep a steady, easy pace the whole way.", "Slow down if you feel off, and drink water."],
    "Racing the long run."
  ),
  "Single-Leg Strength Circuit": g(
    "Single-leg exercises that make your running stronger and more stable.",
    ["Do step-ups, split squats and single-leg bridges.", "Control each rep and keep your hips level.", "Do equal reps on each leg."],
    "Letting your knee collapse inward."
  ),

  // ───────────── Strength ─────────────
  "Push-Ups": g(
    "A classic upper-body exercise for chest, shoulders, triceps and core.",
    [
      "Put your hands slightly wider than your shoulders, body in a straight line from head to heels.",
      "Lower your chest until your elbows are about 90°.",
      "Push the floor away until your arms are straight.",
    ],
    "Sagging hips or flaring your elbows out wide.",
    { analyzer: "pushup", query: "push up proper form" }
  ),
  "Bench Press": g(
    "The foundation exercise for upper-body pressing strength.",
    ["Lie on the bench with your feet flat and a spotter nearby.", "Lower the bar to mid-chest with control.", "Press it straight up until your arms are extended."],
    "Lifting without a spotter or bouncing the bar off your chest."
  ),
  "Overhead Press": g(
    "Press a weight overhead to build strong shoulders.",
    ["Hold the bar at shoulder height with your core tight.", "Press it straight up over your head.", "Lower it back under control."],
    "Arching your lower back."
  ),
  "Bodyweight Rows / Bent-Over Rows": g(
    "Pulling exercise for a strong back and good posture.",
    ["Hinge at your hips with a flat back (or hang under a sturdy bar or table).", "Pull your elbows back and squeeze your shoulder blades.", "Lower slowly."],
    "Rounding your back or jerking the weight.",
    { query: "bodyweight row and bent over row form" }
  ),
  "Pull-Ups": g(
    "Pull your chin over a bar to build upper-body pulling strength.",
    ["Hang from the bar with hands a little wider than your shoulders.", "Pull your chest toward the bar by driving your elbows down.", "Lower yourself slowly to a full hang."],
    "Swinging or kicking to get up."
  ),
  "Back Squat": g(
    "A barbell squat for maximum lower-body strength.",
    ["Rest the bar on your upper back, not on your neck.", "Sit down and back until your thighs are about parallel to the floor.", "Drive up through your whole foot."],
    "Rounding your back. Use a spotter or safety bars and start light.",
    { analyzer: "squat", query: "barbell back squat form" }
  ),
  "Romanian Deadlift": g(
    "Hip-hinge exercise for strong hamstrings and glutes.",
    ["Hold the bar at hip level with soft knees.", "Push your hips back, sliding the bar down your thighs until you feel a hamstring stretch.", "Squeeze your glutes to stand tall."],
    "Rounding your back."
  ),
  "Plank Series": g(
    "A hold that builds a strong, stable core.",
    [
      "Rest on your forearms with your elbows under your shoulders.",
      "Squeeze your abs and glutes so your body is a straight line from head to heels.",
      "Breathe steadily and hold for the full time.",
    ],
    "Sagging hips or lifting them too high.",
    { analyzer: "plank", query: "plank proper form" }
  ),
  "Hanging Leg Raises": g(
    "Raise your legs while hanging to build advanced core strength.",
    ["Hang from a bar with a firm grip.", "Lift your legs (bent or straight) toward your waist.", "Lower them slowly without swinging."],
    "Swinging your body to get momentum."
  ),
  "Kettlebell/Dumbbell Circuit": g(
    "A weighted circuit that builds work capacity.",
    ["Choose a weight you can control.", "Move through each exercise (e.g. goblet squats, rows, presses).", "Rest only when needed and keep your form tidy."],
    "Going too heavy and losing form."
  ),

  // ───────────── General ─────────────
  "Weighted Step-Ups": g(
    "Step up onto a box holding weights to build single-leg strength.",
    ["Place one foot fully on a sturdy box or step.", "Push through that heel to stand up tall.", "Step down slowly and switch legs."],
    "Pushing off the back foot instead of the front leg."
  ),
  "Sprint Intervals": g(
    "Short all-out sprints that build speed.",
    ["Warm up, then sprint hard for the set distance.", "Walk back to recover.", "Repeat with the same effort."],
    "Sprinting without a proper warm-up."
  ),
  "Agility Ladder / Cone Drill": g(
    "Fast feet and quick changes of direction.",
    ["Set a ladder or cones on the ground.", "Step quickly through using small, fast steps.", "Keep your head up and your arms moving."],
    "Looking down at your feet the whole time."
  ),
  "Interval Circuit": g(
    "A circuit of simple exercises to build work capacity.",
    ["Choose 4–6 simple exercises and do them one after another.", "Work hard for the set time, then rest briefly.", "Keep good form even when tired."],
    "Rushing through reps with poor form."
  ),
  "Full-Body Mobility Flow": g(
    "A slow flow that keeps your joints healthy and moving well.",
    ["Move slowly through neck, shoulders, hips and ankles.", "Breathe slowly and never force a stretch.", "Do both sides equally."],
    "Forcing a range of motion that hurts."
  ),
  "Technical Skill Practice": g(
    "Deliberate practice of one core skill in your sport.",
    ["Pick one technical skill.", "Do it slowly first, then add speed.", "Stop and reset when your form slips."],
    "Practicing fast with sloppy technique."
  ),
};

// Generic fallback so a drill with no guide yet still shows something useful.
function fallbackGuide(name, purpose) {
  return {
    summary: purpose || "Focus on smooth, controlled technique on every rep.",
    steps: [
      "Get into a balanced, athletic position.",
      "Move with control — quality before speed.",
      "Breathe steadily and stop if anything hurts.",
    ],
    avoid: "Rushing reps or letting your form get sloppy.",
    videoId: "",
    query: `${name} how to`,
  };
}

export function getExerciseGuide(name, purpose) {
  const g0 = EXERCISE_GUIDES[name];
  const base = g0 || fallbackGuide(name || "exercise", purpose);
  return {
    ...base,
    query: base.query || `${name} how to`,
    analyzer: base.analyzer || null,
  };
}

export function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
