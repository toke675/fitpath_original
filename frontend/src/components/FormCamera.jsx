import React, { useEffect, useRef, useState } from "react";
import { FormAnalyzer, ANALYZERS, POSE_CONNECTIONS, gradeLabel } from "../lib/poseAnalysis.js";

// MediaPipe Pose runs fully in the browser (WebAssembly/WebGL). The video never
// leaves the device. The wasm runtime comes from jsDelivr and the model file
// from Google's public MediaPipe bucket; both are downloaded once and cached.
// (Keep MP_VERSION equal to the installed @mediapipe/tasks-vision version.)
const MP_VERSION = "0.10.21";
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

const COUNTDOWN_SEC = 5;
const JOINT_IDS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

// The model is heavy, so it is created once and reused between drills.
let landmarkerPromise = null;
function loadLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const make = (delegate) =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      try {
        return await make("GPU");
      } catch {
        return await make("CPU");
      }
    })().catch((e) => {
      landmarkerPromise = null; // allow "Try again"
      throw e;
    });
  }
  return landmarkerPromise;
}

const TONE_TEXT = {
  good: "text-green-300",
  warn: "text-amber-300",
  info: "text-white",
};

export default function FormCamera({
  type, // "squat" | "pushup" | "plank"
  targetReps,
  targetSec,
  paused = false,
  pausedLabel = "Camera paused",
  resetKey = 0,
  onSnapshot,
  onTargetReached,
  onClose,
}) {
  const meta = ANALYZERS[type];
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const landmarkerRef = useRef(null);
  const analyzerRef = useRef(null);
  const armedAtRef = useRef(0);
  const reachedRef = useRef(false);
  const sigRef = useRef("");
  const lastVideoTimeRef = useRef(-1);
  const countRef = useRef(COUNTDOWN_SEC);
  const seeRef = useRef(false);
  const armingRef = useRef(true);
  const cbRef = useRef({});
  const pausedRef = useRef(paused);

  const [status, setStatus] = useState("loading"); // loading | running | error
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [facing, setFacing] = useState("user");
  const [aspect, setAspect] = useState(4 / 3);
  const [snap, setSnap] = useState(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [canSee, setCanSee] = useState(false);
  const [arming, setArming] = useState(true);

  // Always call the newest callbacks/targets from inside the video loop.
  cbRef.current = { onSnapshot, onTargetReached, targetReps, targetSec };
  pausedRef.current = paused;

  const arm = () => {
    armedAtRef.current = performance.now() + COUNTDOWN_SEC * 1000;
    countRef.current = COUNTDOWN_SEC;
    armingRef.current = true;
    setCountdown(COUNTDOWN_SEC);
    setArming(true);
  };

  // New drill type → fresh analyzer.
  useEffect(() => {
    analyzerRef.current = new FormAnalyzer(type);
    reachedRef.current = false;
    sigRef.current = "";
    setSnap(null);
    arm();
  }, [type]);

  // New set → counters back to zero + "get in position" countdown.
  useEffect(() => {
    if (!analyzerRef.current) return;
    analyzerRef.current.reset();
    reachedRef.current = false;
    sigRef.current = "";
    setSnap(null);
    arm();
  }, [resetKey]);

  // Coming back from a rest period → countdown again.
  useEffect(() => {
    if (!paused) arm();
  }, [paused]);

  // Camera + model lifecycle.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError("");

    const draw = (pts, s, dim) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (!pts) return;
      const color = dim ? "#ffffff" : s.tone === "good" ? "#22c55e" : s.tone === "warn" ? "#f59e0b" : "#ffffff";
      ctx.lineWidth = Math.max(3, w / 160);
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      for (const [a, b] of POSE_CONNECTIONS) {
        const pa = pts[a];
        const pb = pts[b];
        if (!pa || !pb || (pa.visibility ?? 1) < 0.4 || (pb.visibility ?? 1) < 0.4) continue;
        ctx.beginPath();
        ctx.moveTo(pa.x * w, pa.y * h);
        ctx.lineTo(pb.x * w, pb.y * h);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      for (const i of JOINT_IDS) {
        const p = pts[i];
        if (!p || (p.visibility ?? 1) < 0.4) continue;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, Math.max(4, w / 120), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const video = videoRef.current;
      const lmk = landmarkerRef.current;
      const analyzer = analyzerRef.current;
      if (!video || !lmk || !analyzer || video.readyState < 2) return;
      if (video.currentTime === lastVideoTimeRef.current) return;
      lastVideoTimeRef.current = video.currentTime;

      const now = performance.now();
      let result;
      try {
        result = lmk.detectForVideo(video, now);
      } catch {
        return;
      }
      const pts = result?.landmarks?.[0] || null;
      const inCountdown = now < armedAtRef.current;
      if (!inCountdown && armingRef.current) {
        armingRef.current = false;
        setArming(false);
      }
      const active = !pausedRef.current && !inCountdown;

      let s;
      if (active) {
        s = pts
          ? analyzer.update(pts, { w: video.videoWidth, h: video.videoHeight }, now)
          : analyzer.noPerson(now);
      } else {
        s = analyzer.snapshot(now);
        const see = analyzer.canSee(pts);
        if (see !== seeRef.current) {
          seeRef.current = see;
          setCanSee(see);
        }
        if (inCountdown) {
          const left = Math.max(1, Math.ceil((armedAtRef.current - now) / 1000));
          if (left !== countRef.current) {
            countRef.current = left;
            setCountdown(left);
          }
        }
      }

      draw(pts, s, !active);

      // Only re-render the HUD when something visible changed.
      const sig = [s.reps, s.heldSec, s.feedback, s.avgScore, Math.round((s.liveScore ?? -10) / 10), s.visible, s.inPosition, active].join("|");
      if (sig !== sigRef.current) {
        sigRef.current = sig;
        setSnap(s);
        cbRef.current.onSnapshot?.(s);
      }

      if (active) {
        const { targetReps: tr, targetSec: ts } = cbRef.current;
        const reached = meta.mode === "reps" ? !!tr && s.reps >= tr : !!ts && s.heldSec >= ts;
        if (reached && !reachedRef.current) {
          reachedRef.current = true;
          setSnap(s);
          cbRef.current.onSnapshot?.(s);
          cbRef.current.onTargetReached?.(s);
        }
      }
    };

    (async () => {
      let step = "camera";
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("no-media"), { name: "NoMedia" });

        const streamP = navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        const modelP = loadLandmarker();
        modelP.catch(() => {}); // handled below; avoids an unhandled-rejection warning

        const stream = await streamP;
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        step = "model";
        const lmk = await modelP;
        if (cancelled) return;
        landmarkerRef.current = lmk;

        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = true;
        await video.play();
        if (cancelled) return;

        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        if (canvasRef.current) {
          canvasRef.current.width = vw;
          canvasRef.current.height = vh;
        }
        setAspect(vw / vh);
        arm();
        setStatus("running");
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        if (cancelled) return;
        let msg;
        if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
          msg = "Camera access was blocked. Allow the camera for this site in your browser settings, then try again.";
        } else if (e?.name === "NotFoundError" || e?.name === "OverconstrainedError") {
          msg = "No camera was found on this device.";
        } else if (e?.name === "NoMedia") {
          msg = "The camera only works on a secure page (https:// or localhost).";
        } else if (step === "model") {
          msg = "Couldn't load the AI model. Check your internet connection and try again.";
        } else {
          msg = "Couldn't start the camera. Close other apps that might be using it and try again.";
        }
        setError(msg);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      lastVideoTimeRef.current = -1;
      landmarkerRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [facing, attempt]);

  const isReps = meta.mode === "reps";
  const progressText = isReps
    ? `${snap?.reps ?? 0}${targetReps ? ` / ${targetReps}` : ""}`
    : `${snap?.heldSec ?? 0}${targetSec ? ` / ${targetSec}s` : "s"}`;
  const score = snap?.avgScore;
  const mirror = facing === "user";
  const boxWidth = `min(100%, ${(60 * aspect).toFixed(1)}vh)`;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-mist leading-relaxed">
          <span className="font-semibold text-bone">{meta.label} camera setup:</span> {meta.setup}
        </p>
        <button type="button" className="btn-ghost text-xs text-mist hover:text-bone shrink-0" onClick={onClose}>
          Stop camera ✕
        </button>
      </div>

      {status === "error" ? (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-sm">
          <p className="text-bone mb-3">{error}</p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary text-xs py-2 px-4" onClick={() => setAttempt((a) => a + 1)}>
              Try again
            </button>
            <button type="button" className="btn-secondary text-xs py-2 px-4" onClick={onClose}>
              Continue without camera
            </button>
          </div>
        </div>
      ) : (
        <div
          className="relative mx-auto overflow-hidden rounded-2xl bg-black border border-line"
          style={{ aspectRatio: String(aspect), width: boxWidth }}
        >
          <div className="absolute inset-0" style={mirror ? { transform: "scaleX(-1)" } : undefined}>
            <video ref={videoRef} className="w-full h-full" style={{ objectFit: "fill" }} playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>

          {status === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4 bg-black/70">
              <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <p className="text-white text-sm font-medium">Starting camera & loading the AI model…</p>
              <p className="text-white/60 text-xs">The first time can take a few seconds.</p>
            </div>
          )}

          {status === "running" && (
            <>
              <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
                <div className="px-3 py-1.5 rounded-xl bg-black/65 text-white">
                  <div className="text-[10px] uppercase tracking-wider text-white/70">{isReps ? "Reps" : "Hold"}</div>
                  <div className="font-mono text-2xl font-bold leading-none">{progressText}</div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-black/65 text-white text-right">
                  <div className="text-[10px] uppercase tracking-wider text-white/70">AI form score</div>
                  <div className="font-mono text-2xl font-bold leading-none">{score ?? "—"}</div>
                  {score != null && <div className="text-[10px] text-white/70">{gradeLabel(score)}</div>}
                </div>
              </div>

              {paused ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                  <p className="text-white font-semibold text-center px-4">{pausedLabel}</p>
                </div>
              ) : arming ? (
                <CountdownOverlay countdown={countdown} canSee={canSee} />
              ) : null}

              {!paused && !arming && snap && (
                <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
                  <div className={`px-3 py-2 rounded-xl bg-black/70 text-center text-sm font-semibold ${TONE_TEXT[snap.tone] || "text-white"}`}>
                    {snap.feedback || "Looking good"}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {status === "running" && (
        <div className="flex items-center justify-between gap-3 text-[11px] text-mist">
          <span>🔒 Video stays on your device — nothing is recorded or uploaded.</span>
          <button type="button" className="underline hover:text-bone shrink-0" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}>
            Flip camera
          </button>
        </div>
      )}
    </div>
  );
}

function CountdownOverlay({ countdown, canSee }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 text-center p-4 pointer-events-none">
      <p className="text-white/80 text-xs uppercase tracking-wider">Get in position</p>
      <div className="font-mono text-6xl font-bold text-white">{countdown}</div>
      <p className={`text-sm font-semibold ${canSee ? "text-green-300" : "text-amber-300"}`}>
        {canSee ? "✓ I can see you" : "Step back until your whole body is visible"}
      </p>
    </div>
  );
}
