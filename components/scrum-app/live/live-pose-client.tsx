"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CircleOff,
  Video,
} from "lucide-react";
import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
import { computeScrumAnglesMp, type JointAngleRow } from "./scrum-joint-angles";
import { DesktopLiveGate, HydratingGate } from "./live-gates";
import { drawMpPoseFrame } from "./draw-skeleton-frame";

const TASKS_VERSION = "0.10.21";
const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;
const MODEL_LITE =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

const VIS = 0.32;

type PoseLandmarkerInstance = Awaited<
  ReturnType<typeof PoseLandmarker.createFromOptions>
>;

async function createLandmarker(): Promise<PoseLandmarkerInstance> {
  const wasm = await FilesetResolver.forVisionTasks(WASM_ROOT);

  async function attempt(delegate: "GPU" | "CPU") {
    return PoseLandmarker.createFromOptions(wasm, {
      baseOptions: {
        modelAssetPath: MODEL_LITE,
        delegate,
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.35,
      minPosePresenceConfidence: 0.35,
      minTrackingConfidence: 0.35,
    });
  }

  try {
    return await attempt("GPU");
  } catch {
    return await attempt("CPU");
  }
}

export function LivePoseClient() {
  const mobile = useMobileViewport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lmRef = useRef<PoseLandmarkerInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const angleThrottleRef = useRef(0);

  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [angles, setAngles] = useState<JointAngleRow[]>([]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void lmRef.current?.close();
    lmRef.current = null;
    const vid = videoRef.current;
    if (vid) {
      vid.srcObject = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    }
    setAngles([]);
    setRunning(false);
  }, []);

  const tick = useCallback(async () => {
    if (!lmRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const landmarker = lmRef.current;

    if (
      !video ||
      !canvas ||
      !wrap ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      rafRef.current = requestAnimationFrame(() => void tick());
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const bw = rect.width;
    const bh = rect.height;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    if (bw > 0 && bh > 0 && vw && vh) {
      const wPx = Math.floor(bw * dpr);
      const hPx = Math.floor(bh * dpr);
      if (canvas.width !== wPx || canvas.height !== hPx) {
        canvas.width = wPx;
        canvas.height = hPx;
        canvas.style.width = `${bw}px`;
        canvas.style.height = `${bh}px`;
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const t =
          typeof performance !== "undefined" ? performance.now() : Date.now();
        const result = landmarker.detectForVideo(video, t);
        if (!lmRef.current) return;

        const poseLm = result.landmarks?.[0];
        if (poseLm?.length) {
          drawMpPoseFrame(
            ctx,
            poseLm,
            vw,
            vh,
            bw,
            bh,
            PoseLandmarker.POSE_CONNECTIONS,
            VIS,
          );
          const now =
            typeof performance !== "undefined" ? performance.now() : Date.now();
          if (now - angleThrottleRef.current > 240) {
            angleThrottleRef.current = now;
            setAngles(
              computeScrumAnglesMp(poseLm, vw, vh, VIS + 0.03),
            );
          }
        } else {
          ctx.clearRect(0, 0, bw, bh);
        }
      }
    }

    if (!lmRef.current) return;
    rafRef.current = requestAnimationFrame(() => void tick());
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopCamera();
        setLoading(false);
        setError("Could not attach camera preview. Try again.");
        return;
      }
      video.srcObject = stream;
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          resolve();
          return;
        }
        let settled = false;
        const cleanup = () => {
          clearTimeout(timeoutId);
          video.removeEventListener("loadeddata", onOk);
          video.removeEventListener("canplay", onOk);
          video.removeEventListener("error", onErr);
        };
        const finish = (fn: () => void) => {
          if (settled) return;
          settled = true;
          cleanup();
          fn();
        };
        const onOk = () => finish(() => resolve());
        const onErr = () =>
          finish(() => reject(new Error("Video failed to load")));
        const timeoutId = window.setTimeout(
          () => finish(() => reject(new Error("Camera preview timed out"))),
          25_000,
        );
        video.addEventListener("loadeddata", onOk);
        video.addEventListener("canplay", onOk);
        video.addEventListener("error", onErr);
      });
      try {
        await video.play();
      } catch (playErr) {
        throw playErr instanceof Error
          ? playErr
          : new Error("Could not play camera preview");
      }

      const landmarker = await createLandmarker();
      lmRef.current = landmarker;
      setRunning(true);
      setLoading(false);
      angleThrottleRef.current = 0;
      rafRef.current = requestAnimationFrame(() => void tick());
    } catch (e) {
      setLoading(false);
      stopCamera();
      const msg =
        e instanceof Error
          ? e.message
          : "Could not start camera or load pose model.";
      setError(
        msg.includes("Permission") ||
          msg.includes("NotAllowed") ||
          msg.includes("blocked")
          ? "Camera permission was blocked. Allow camera access for this site in your browser settings, then retry."
          : msg,
      );
    }
  }, [stopCamera, tick]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  if (mobile === null) {
    return <HydratingGate />;
  }
  if (!mobile) {
    return <DesktopLiveGate />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-border border-b bg-background/95 px-4 py-3 backdrop-blur-md">
        <Link
          href="/"
          className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground"
          aria-label="Back to exercises"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="font-bold text-foreground text-lg">Live pose</h1>
          <p className="text-muted-foreground text-xs">
            MediaPipe lite — skeleton and angles in-browser only
          </p>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col">
        {/* Keep video in the document before "running" so refs exist when starting the camera */}
        <div
          ref={wrapRef}
          className={
            running
              ? "relative min-h-[45vh] w-full flex-1"
              : "pointer-events-none fixed left-0 top-0 -z-10 max-h-[3px] max-w-[3px] overflow-hidden opacity-0"
          }
          aria-hidden={!running}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            className={
              running
                ? "absolute inset-0 size-full object-cover"
                : "block h-px w-px"
            }
          />
          <canvas
            ref={canvasRef}
            className={`pointer-events-none absolute inset-0 size-full object-cover ${
              running ? "" : "hidden"
            }`}
          />
        </div>

        {!running ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-14">
            <Video className="size-14 text-muted-foreground" />
            <p className="max-w-xs text-center text-muted-foreground text-sm leading-relaxed">
              Uses your front camera. The lite model overlays a skeleton and
              approximates hinge angles for coaching cues. Nothing leaves this
              device.
            </p>
            <p className="max-w-[18rem] text-center text-muted-foreground text-[11px] leading-relaxed opacity-90">
              First open downloads the WASM runtime and pose model (~few MB).
              Use Wi‑Fi if you are cautious about mobile data.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => void startCamera()}
              className="rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Starting…" : "Start camera"}
            </button>
            {error ? (
              <p className="max-w-xs text-center text-accent text-xs leading-relaxed">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="border-border border-t bg-card px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-foreground text-sm">
                Joint angles
              </h2>
              <button
                type="button"
                onClick={stopCamera}
                className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 font-medium text-muted-foreground text-xs"
              >
                <CircleOff className="size-4" />
                Stop camera
              </button>
            </div>
            {angles.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                Step back so your full torso and limbs are visible. Readings
                appear as confidence improves.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {angles.map((row) => (
                  <li
                    key={row.label}
                    className="flex justify-between rounded-lg bg-secondary px-2 py-1.5 tabular-nums"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold text-foreground">
                      {row.degrees}°
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
