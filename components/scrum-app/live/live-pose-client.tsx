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
  Video,
} from "lucide-react";
import { useMobileViewport } from "@/hooks/use-mobile-viewport";
import { createVisionLandmarker } from "./create-vision-landmarker";
import type { JointAngleRow } from "./scrum-joint-angles";
import { DesktopLiveGate, HydratingGate } from "./live-gates";
import {
  detectAndDrawLandmarks,
  type BlendInsightRow,
} from "./live-landmarker-tick";
import type { VisionLandmarkerHandle } from "./create-vision-landmarker";
import { LIVE_TRACK_MODES, type LiveTrackMode } from "./live-track-mode";
import { LiveResultsPanel } from "./live-results-panel";
import { LiveTrackPicker } from "./live-track-picker";

const POSE_MODEL_LOAD_MS = 180_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e instanceof Error ? e : new Error(String(e)));
      },
    );
  });
}

export function LivePoseClient() {
  const mobile = useMobileViewport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lmHandleRef = useRef<VisionLandmarkerHandle | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const angleThrottleRef = useRef(0);
  const loadGenRef = useRef(0);
  const trackModeRef = useRef<LiveTrackMode>("body");

  const [trackMode, setTrackMode] = useState<LiveTrackMode>("body");

  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [poseLoading, setPoseLoading] = useState(false);
  const [poseError, setPoseError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [angles, setAngles] = useState<JointAngleRow[]>([]);
  const [blendRows, setBlendRows] = useState<BlendInsightRow[]>([]);
  const [handLines, setHandLines] = useState<string[]>([]);

  useEffect(() => {
    trackModeRef.current = trackMode;
  }, [trackMode]);

  const stopCamera = useCallback(() => {
    loadGenRef.current += 1;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (lmHandleRef.current) {
      void lmHandleRef.current.landmarker.close();
      lmHandleRef.current = null;
    }
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
    setBlendRows([]);
    setHandLines([]);
    setRunning(false);
    setPoseLoading(false);
    setPoseError(null);
  }, []);

  const runTickRef = useRef<() => Promise<void>>(async () => {});

  const tick = useCallback(async () => {
    const handle = lmHandleRef.current;
    if (!handle) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;

    if (
      !video ||
      !canvas ||
      !wrap ||
      video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      rafRef.current = requestAnimationFrame(() => {
        void runTickRef.current();
      });
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

        if (!lmHandleRef.current) return;

        detectAndDrawLandmarks(handle, video, ctx, bw, bh, vw, vh, {
          throttleRef: angleThrottleRef,
          setAngles,
          setBlendRows,
          setHandLines,
        });
      }
    }

    if (!lmHandleRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      void runTickRef.current();
    });
  }, []);

  useEffect(() => {
    runTickRef.current = tick;
  }, [tick]);

  const startLandmarkerSession = useCallback(async (stream: MediaStream) => {
    const gen = ++loadGenRef.current;
    setPoseError(null);
    setPoseLoading(true);
    setAngles([]);
    setBlendRows([]);
    setHandLines([]);

    if (lmHandleRef.current) {
      void lmHandleRef.current.landmarker.close();
      lmHandleRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;

    try {
      const mode = trackModeRef.current;
      const handle = await withTimeout(
        createVisionLandmarker(mode),
        POSE_MODEL_LOAD_MS,
        "Model is taking too long. Check your connection, or tap Stop camera and try again.",
      );
      if (gen !== loadGenRef.current) {
        void handle.landmarker.close();
        return;
      }
      if (!streamRef.current || videoRef.current?.srcObject !== stream) {
        void handle.landmarker.close();
        return;
      }
      lmHandleRef.current = handle;
      angleThrottleRef.current = 0;
      rafRef.current = requestAnimationFrame(() => {
        void runTickRef.current();
      });
    } catch (e) {
      if (gen === loadGenRef.current) {
        setPoseError(
          e instanceof Error
            ? e.message
            : "Could not load tracking model in this browser.",
        );
      }
    } finally {
      if (gen === loadGenRef.current) {
        setPoseLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const stream = streamRef.current;
    if (!stream) return;
    void startLandmarkerSession(stream);
  }, [running, trackMode, startLandmarkerSession]);

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

      setLoading(false);
      setPoseError(null);
      setRunning(true);
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
  }, [stopCamera]);

  useEffect(() => {
    if (!running) return;
    const v = videoRef.current;
    if (!v?.srcObject) return;
    void v.play().catch(() => undefined);
  }, [running]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  if (mobile === null) {
    return <HydratingGate />;
  }
  if (!mobile) {
    return <DesktopLiveGate />;
  }

  const hint = LIVE_TRACK_MODES.find((m) => m.id === trackMode)?.hint ?? "";

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
            MediaPipe in-browser — {hint}
          </p>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col">
        <div
          ref={wrapRef}
          className={
            running
              ? "relative min-h-[45vh] w-full flex-1 bg-black"
              : "pointer-events-none fixed left-0 top-0 -z-10 max-h-[3px] max-w-[3px] overflow-hidden opacity-0"
          }
          aria-hidden={!running}
        >
          {running && poseLoading ? (
            <div className="absolute inset-x-0 top-11 z-20 flex justify-center px-4">
              <p className="max-w-sm rounded-lg bg-background/90 px-3 py-2 text-center text-foreground text-xs shadow-lg backdrop-blur-sm">
                Loading tracking model… first time per mode can take a minute on
                mobile data. The camera preview should stay visible.
              </p>
            </div>
          ) : null}
          {running && poseError ? (
            <div className="absolute inset-x-0 top-11 z-20 flex justify-center px-4">
              <p className="max-w-sm rounded-lg bg-destructive/15 px-3 py-2 text-center text-accent text-xs shadow-lg backdrop-blur-sm">
                {poseError} Try another mode or stop and start again.
              </p>
            </div>
          ) : null}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={
              running
                ? "absolute inset-0 z-0 size-full object-cover"
                : "block h-px w-px"
            }
          />
          <canvas
            ref={canvasRef}
            className={`pointer-events-none absolute inset-0 z-10 size-full object-cover ${
              running ? "" : "hidden"
            }`}
          />
        </div>

        {!running ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-14">
            <Video className="size-14 text-muted-foreground" />
            <LiveTrackPicker
              value={trackMode}
              onChange={setTrackMode}
              disabled={loading}
            />
            <p className="max-w-xs text-center text-muted-foreground text-sm leading-relaxed">
              Choose full body, face, or hands, then start. Each mode downloads
              its own model the first time. Nothing leaves this device.
            </p>
            <p className="max-w-[18rem] text-center text-muted-foreground text-[11px] leading-relaxed opacity-90">
              Wi‑Fi recommended for first open. You can switch modes after the
              camera is running.
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
          <>
            <div className="border-border border-b bg-card/80 px-3 py-2 backdrop-blur-sm">
              <LiveTrackPicker
                value={trackMode}
                onChange={setTrackMode}
                disabled={poseLoading}
              />
            </div>
            <LiveResultsPanel
              trackMode={trackMode}
              angles={angles}
              blendRows={blendRows}
              handLines={handLines}
              onStop={stopCamera}
            />
          </>
        )}
      </div>
    </div>
  );
}
