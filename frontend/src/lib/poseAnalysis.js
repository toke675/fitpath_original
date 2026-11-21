// On-device exercise analysis from body-pose landmarks.
//
// The camera model (MediaPipe Pose, see components/FormCamera.jsx) gives us 33
// body landmarks per video frame. This file turns those points into:
//   • rep counting (squat, push-up) or hold timing (plank)
//   • a 0–100 form score per rep, plus short coaching feedback
//
// It is pure JavaScript with no browser APIs, so it can be unit-tested with
// fake landmarks. Everything runs on the athlete's device — no video is sent
// anywhere.
//
// IMPORTANT camera note: angles are measured in the 2D picture, so the
// athlete must stand/lie SIDE-ON to the camera with the whole body visible.

export const LM = {
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
};

// Lines drawn for the skeleton overlay.
export const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];

// mode: "reps" counts repetitions, "hold" counts seconds in a good position.
export const ANALYZERS = {
  squat: {
    label: "Squat",
    mode: "reps",
    setup: "Stand sideways to the camera, about 2 m away, so your whole body is in the picture.",
  },
  pushup: {
    label: "Push-up",
    mode: "reps",
    setup: "Put your phone/laptop on the floor, side-on to you, so your whole body is visible from head to feet.",
  },
  plank: {
    label: "Plank",
    mode: "hold",
    setup: "Put your phone/laptop on the floor, side-on to you, so your whole body is visible from head to feet.",
  },
};

const SIDE_JOINTS = {
  L: { shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27 },
  R: { shoulder: 12, elbow: 14, wrist: 16, hip: 24, knee: 26, ankle: 28 },
};

const REQUIRED = {
  squat: ["shoulder", "hip", "knee", "ankle"],
  pushup: ["shoulder", "elbow", "wrist", "hip", "ankle"],
  plank: ["shoulder", "hip", "ankle"],
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const vis = (p) => (p ? (p.visibility ?? 1) : 0);

/** Angle in degrees at point b, formed by a–b–c. */
export function angleDeg(a, b, c) {
  const v1x = a.x - b.x, v1y = a.y - b.y;
  const v2x = c.x - b.x, v2y = c.y - b.y;
  const m = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (m === 0) return 180;
  const cos = clamp((v1x * v2x + v1y * v2y) / m, -1, 1);
  return (Math.acos(cos) * 180) / Math.PI;
}

/** How far the hip→shoulder line leans from vertical, in degrees (0 = upright). */
export function torsoLean(shoulder, hip) {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  return (Math.atan2(Math.abs(dx), -dy) * 180) / Math.PI;
}

/**
 * Body-line check for push-up / plank (side view).
 * Returns whether the body is roughly horizontal and how far the hip sits
 * above/below the straight shoulder→ankle line (as a fraction of body length).
 * d > 0 means the hips sag, d < 0 means the hips are too high.
 */
export function bodyLine(J) {
  const dx = J.ankle.x - J.shoulder.x;
  const dy = J.ankle.y - J.shoulder.y;
  const len = Math.hypot(dx, dy) || 1;
  const horizontal = Math.abs(dx) > Math.abs(dy) * 1.3;
  if (Math.abs(dx) < 1e-6) return { horizontal: false, d: 0, len };
  const lineY = J.shoulder.y + ((J.hip.x - J.shoulder.x) * dy) / dx;
  return { horizontal, d: (J.hip.y - lineY) / len, len };
}

export function lineScore(absDev) {
  if (absDev <= 0.04) return 100;
  return clamp(100 - (absDev - 0.04) * 700, 0, 100);
}

export function gradeLabel(score) {
  if (score == null) return "—";
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Okay";
  return "Needs work";
}

export class FormAnalyzer {
  constructor(type) {
    if (!ANALYZERS[type]) throw new Error(`Unknown analyzer: ${type}`);
    this.type = type;
    this.mode = ANALYZERS[type].mode;
    this.reset();
  }

  reset() {
    this.reps = 0;
    this.heldSec = 0;
    this.repScores = [];
    this.alignSum = 0;
    this.alignTime = 0;
    this.phase = "top"; // "top" (start/finish position) | "moving"
    this.mv = null; // data for the rep in progress
    this.ema = {};
    this.lastT = null;
    this.lastRep = null;
    this.sticky = null; // short-lived message (e.g. result of the last rep)
    this.live = { text: "", tone: "info" };
    this.visible = false;
    this.inPosition = false;
    this.liveScore = null;
  }

  /** True when enough of the body is visible to analyse (used for the pre-set countdown hint). */
  canSee(lm) {
    return !!lm && !!this._pickSide(lm);
  }

  /** Called when no person was detected in the frame. */
  noPerson(tMs) {
    this.lastT = tMs;
    this.visible = false;
    this.inPosition = false;
    this.phase = "top";
    this.mv = null;
    this.live = { text: "I can't see you — step into the picture", tone: "warn" };
    return this.snapshot(tMs);
  }

  /**
   * @param lm    array of landmarks ({x, y, visibility}) with x/y in 0..1
   * @param frame { w, h } video size in pixels (so angles aren't distorted)
   * @param tMs   timestamp in milliseconds (monotonic)
   */
  update(lm, frame, tMs) {
    if (!lm) return this.noPerson(tMs);
    const dt = this.lastT == null ? 0 : clamp((tMs - this.lastT) / 1000, 0, 0.25);
    this.lastT = tMs;

    const picked = this._pickSide(lm);
    if (!picked) {
      this.visible = false;
      this.inPosition = false;
      this.phase = "top";
      this.mv = null;
      this.live = { text: "Step back so your whole body is in the picture", tone: "warn" };
      return this.snapshot(tMs);
    }
    this.visible = true;
    this.side = picked.side;

    const J = {};
    for (const [name, idx] of Object.entries(SIDE_JOINTS[picked.side])) {
      J[name] = { x: lm[idx].x * frame.w, y: lm[idx].y * frame.h };
    }

    if (this.type === "squat") this._squat(J, tMs);
    else if (this.type === "pushup") this._pushup(J, tMs);
    else this._plank(J, dt, tMs);

    return this.snapshot(tMs);
  }

  snapshot(tMs = 0) {
    // Warnings about visibility/position always win over a lingering rep message.
    const stickyOk = this.visible && this.inPosition && this.sticky && this.sticky.until > tMs;
    const msg = stickyOk ? this.sticky : this.live;
    const avg =
      this.mode === "hold"
        ? this.alignTime > 0.5 ? Math.round(this.alignSum / this.alignTime) : null
        : this.repScores.length
        ? Math.round(this.repScores.reduce((a, b) => a + b, 0) / this.repScores.length)
        : null;
    return {
      type: this.type,
      mode: this.mode,
      visible: this.visible,
      inPosition: this.inPosition,
      phase: this.phase,
      reps: this.reps,
      heldSec: Math.floor(this.heldSec),
      avgScore: avg,
      liveScore: this.liveScore,
      lastRep: this.lastRep,
      repScores: [...this.repScores],
      feedback: msg.text,
      tone: msg.tone,
    };
  }

  summary() {
    const s = this.snapshot(this.lastT ?? 0);
    return { reps: s.reps, heldSec: s.heldSec, avgScore: s.avgScore, repScores: s.repScores };
  }

  // ───────── internals ─────────

  _pickSide(lm) {
    const need = REQUIRED[this.type];
    let best = null;
    for (const side of ["L", "R"]) {
      const vals = need.map((n) => vis(lm[SIDE_JOINTS[side][n]]));
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const min = Math.min(...vals);
      if (!best || mean > best.mean) best = { side, mean, min };
    }
    if (!best || best.mean < 0.5 || best.min < 0.25) return null;
    return best;
  }

  _smooth(key, value, alpha = 0.45) {
    const k = `${this.side}:${key}`;
    const prev = this.ema[k];
    const next = prev == null ? value : prev + alpha * (value - prev);
    this.ema[k] = next;
    return next;
  }

  _say(text, tone, tMs, holdMs = 2200) {
    this.sticky = { text, tone, until: tMs + holdMs };
  }

  _finishRep(score, issues, tMs) {
    this.reps += 1;
    this.repScores.push(score);
    this.lastRep = { n: this.reps, score, issues };
    const tone = score >= 75 ? "good" : "warn";
    const msg = issues.length ? issues[0] : "Great rep!";
    this._say(`Rep ${this.reps} · ${score} — ${msg}`, tone, tMs);
  }

  _squat(J, tMs) {
    const knee = this._smooth("knee", angleDeg(J.hip, J.knee, J.ankle));
    const lean = this._smooth("lean", torsoLean(J.shoulder, J.hip));
    const TOP = 155, START = 145, MIN_DEPTH = 120;
    this.inPosition = true;

    if (this.phase === "top") {
      this.live = { text: "Ready — squat down", tone: "info" };
      this.liveScore = null;
      if (knee < START) {
        this.phase = "moving";
        this.mv = { t0: tMs, min: knee, maxLean: lean };
      }
      return;
    }

    this.mv.min = Math.min(this.mv.min, knee);
    this.mv.maxLean = Math.max(this.mv.maxLean, lean);

    if (knee > TOP) {
      const dur = tMs - this.mv.t0;
      if (this.mv.min <= MIN_DEPTH && dur >= 500) {
        const depth = clamp(100 - Math.max(0, this.mv.min - 100) * 2, 0, 100);
        const posture = clamp(100 - Math.max(0, this.mv.maxLean - 50) * 2.5, 0, 100);
        const tempo = dur < 700 ? 70 : 100;
        const score = Math.round(depth * 0.5 + posture * 0.3 + tempo * 0.2);
        const issues = [];
        if (depth < 75) issues.push("Go deeper next time");
        if (posture < 75) issues.push("Keep your chest up");
        if (tempo < 100) issues.push("Slow down a little");
        this._finishRep(score, issues, tMs);
      } else if (dur >= 500) {
        this._say("Not deep enough — go lower (thighs near parallel)", "warn", tMs);
      }
      this.phase = "top";
      this.mv = null;
      return;
    }
    if (tMs - this.mv.t0 > 10000) {
      this.phase = "top";
      this.mv = null;
      return;
    }

    // live coaching while moving
    if (lean > 62) this.live = { text: "Chest up — don't fold forward", tone: "warn" };
    else if (knee <= MIN_DEPTH) this.live = { text: "Good depth — now stand up", tone: "good" };
    else this.live = { text: "Keep going down…", tone: "info" };
    this.liveScore = clamp(100 - Math.max(0, lean - 50) * 2.5, 0, 100);
  }

  _pushup(J, tMs) {
    const elbow = this._smooth("elbow", angleDeg(J.shoulder, J.elbow, J.wrist));
    const body = bodyLine(J);
    const dev = this._smooth("dev", body.d, 0.35);
    const TOP = 155, START = 145, MIN_DEPTH = 105;

    if (!body.horizontal) {
      this.inPosition = false;
      this.phase = "top";
      this.mv = null;
      this.live = { text: "Get into push-up position (side-on to the camera)", tone: "warn" };
      return;
    }
    this.inPosition = true;

    if (this.phase === "top") {
      this.live = { text: "Ready — lower your chest", tone: "info" };
      this.liveScore = lineScore(Math.abs(dev));
      if (elbow < START) {
        this.phase = "moving";
        this.mv = { t0: tMs, min: elbow, maxDev: Math.abs(dev), sag: dev > 0 };
      }
      return;
    }

    this.mv.min = Math.min(this.mv.min, elbow);
    if (Math.abs(dev) > this.mv.maxDev) {
      this.mv.maxDev = Math.abs(dev);
      this.mv.sag = dev > 0;
    }

    if (elbow > TOP) {
      const dur = tMs - this.mv.t0;
      if (this.mv.min <= MIN_DEPTH && dur >= 500) {
        const depth = this.mv.min <= 90 ? 100 : clamp(100 - (this.mv.min - 90) * 3, 0, 100);
        const line = lineScore(this.mv.maxDev);
        const tempo = dur < 700 ? 70 : 100;
        const score = Math.round(depth * 0.45 + line * 0.4 + tempo * 0.15);
        const issues = [];
        if (depth < 75) issues.push("Lower your chest more");
        if (line < 75) issues.push(this.mv.sag ? "Keep your hips up — straight body" : "Lower your hips — straight body");
        if (tempo < 100) issues.push("Slow down a little");
        this._finishRep(score, issues, tMs);
      } else if (dur >= 500) {
        this._say("Not low enough — bend your elbows to about 90°", "warn", tMs);
      }
      this.phase = "top";
      this.mv = null;
      return;
    }
    if (tMs - this.mv.t0 > 10000) {
      this.phase = "top";
      this.mv = null;
      return;
    }

    this.liveScore = lineScore(Math.abs(dev));
    if (dev > 0.07) this.live = { text: "Hips sagging — squeeze your abs and glutes", tone: "warn" };
    else if (dev < -0.09) this.live = { text: "Hips too high — straight line from head to heels", tone: "warn" };
    else if (elbow <= MIN_DEPTH) this.live = { text: "Good depth — push up!", tone: "good" };
    else this.live = { text: "Keep going down…", tone: "info" };
  }

  _plank(J, dt, tMs) {
    const body = bodyLine(J);
    const dev = this._smooth("dev", body.d, 0.35);
    const ad = Math.abs(dev);

    if (!body.horizontal) {
      this.inPosition = false;
      this.liveScore = null;
      this.live = { text: "Get into plank position (side-on to the camera)", tone: "warn" };
      return;
    }
    this.inPosition = true;
    this.liveScore = Math.round(lineScore(ad));
    this.alignSum += this.liveScore * dt;
    this.alignTime += dt;

    if (ad <= 0.09) {
      this.heldSec += dt;
      this.live = { text: ad <= 0.05 ? "Perfect line — keep holding!" : "Good — hold it steady", tone: "good" };
    } else if (dev > 0) {
      this.live = { text: "Hips sagging — lift them! (timer paused)", tone: "warn" };
    } else {
      this.live = { text: "Hips too high — lower them! (timer paused)", tone: "warn" };
    }
  }
}

export function createAnalyzer(type) {
  return new FormAnalyzer(type);
}
