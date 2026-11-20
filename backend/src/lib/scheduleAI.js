// Recommends a wake time, sleep time, and training time slot so the
// generated daily routine never collides with work/school, and the
// athlete gets an age-appropriate amount of sleep around training.

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(mins) {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function roundTo15(mins) {
  return Math.round(mins / 15) * 15;
}

function sleepHoursForAge(age) {
  if (!age) return 8;
  if (age < 13) return 10;
  if (age < 18) return 9.25;
  if (age < 26) return 8.25;
  return 7.75;
}

export function computeSchedule(profile) {
  const sleepHours = sleepHoursForAge(profile.age);
  const busy = profile.hasBusyBlock ? profile.busyBlocks?.[0] : null;
  const sessionMin = Number(profile.sessionMinutes) || 45;

  let wakeMin, trainStartMin, sleepMin;

  if (busy) {
    const busyStart = toMinutes(busy.start);
    const busyEnd = toMinutes(busy.end);

    // Wake up with enough buffer to get ready before work/school.
    wakeMin = roundTo15(Math.max(300, busyStart - 75)); // at least 5:00, 75 min before

    // Prefer training after work/school with a short recovery buffer,
    // unless that pushes bedtime too late — then train before, early.
    const afterSlot = busyEnd + 60;
    const eveningFinish = afterSlot + sessionMin + 90; // wind-down after training
    if (eveningFinish <= 22 * 60 + 30) {
      trainStartMin = roundTo15(afterSlot);
    } else {
      // Evening is too tight — train in the morning before the busy block instead.
      trainStartMin = roundTo15(Math.max(wakeMin + 30, busyStart - sessionMin - 45));
      wakeMin = Math.min(wakeMin, trainStartMin - 30);
    }
  } else {
    // No fixed work/school constraint — use a balanced default day.
    wakeMin = 7 * 60;
    trainStartMin = 17 * 60;
  }

  const trainEndMin = trainStartMin + sessionMin;
  const windDownMin = trainEndMin + 90;
  sleepMin = roundTo15(Math.max(wakeMin + sleepHours * 60, windDownMin));
  // Keep bedtime within a sane window; if it drifts past 00:30, pull it back
  // and accept a slightly shorter night rather than an unrealistic schedule.
  if (sleepMin > 24 * 60 + 30) sleepMin = 24 * 60 + 30;

  return {
    wakeTime: toHHMM(wakeMin),
    sleepTime: toHHMM(sleepMin),
    trainingTime: toHHMM(trainStartMin),
  };
}
