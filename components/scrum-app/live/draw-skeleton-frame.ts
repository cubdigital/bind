import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { landmarkToVideoPx, mapPointCover } from "./map-keypoint-cover";

type Conn = { start: number; end: number };

export type LandmarkDrawStyle = "body" | "face" | "hands";

type DrawPalette = {
  line: string;
  joint: string;
  core: string;
  lineWidth: number;
  outerR: number;
  innerR: number;
};

/** Body: soft pink/cream. Hands: saturated red / yellow, thicker strokes. Face: medium. */
const PALETTE: Record<LandmarkDrawStyle, DrawPalette> = {
  body: {
    line: "hsla(354, 100%, 71%, 0.92)",
    joint: "hsla(30, 100%, 70%, 0.95)",
    core: "hsla(240, 9%, 11%, 0.55)",
    lineWidth: 3,
    outerR: 6,
    innerR: 3.5,
  },
  face: {
    line: "hsla(354, 100%, 68%, 0.9)",
    joint: "hsla(48, 100%, 58%, 0.95)",
    core: "hsla(240, 12%, 14%, 0.6)",
    lineWidth: 2,
    outerR: 4,
    innerR: 2.5,
  },
  hands: {
    line: "hsla(0, 92%, 52%, 0.98)",
    joint: "hsla(51, 100%, 48%, 0.98)",
    core: "hsla(0, 70%, 18%, 0.92)",
    lineWidth: 5,
    outerR: 6.5,
    innerR: 4,
  },
};

/** Hand and face tasks often report visibility as 0 or omit it — still draw those landmarks. */
function passesVisibility(
  lm: NormalizedLandmark | undefined,
  style: LandmarkDrawStyle,
  minVis: number,
): boolean {
  if (!lm) return false;
  if (style !== "body") return true;
  return (lm.visibility ?? 0) >= minVis;
}

export function drawLandmarkSubjects(
  ctx: CanvasRenderingContext2D,
  subjects: NormalizedLandmark[][],
  boxW: number,
  boxH: number,
  vw: number,
  vh: number,
  connections: readonly Conn[],
  style: LandmarkDrawStyle,
  minVis = style === "face" ? 0.12 : 0.32,
): void {
  ctx.clearRect(0, 0, boxW, boxH);

  const p = PALETTE[style];

  for (const landmarks of subjects) {
    if (!landmarks?.length) continue;

    const pts = landmarks.map((lm) => {
      const pix = landmarkToVideoPx(lm, vw, vh);
      return mapPointCover(pix, vw, vh, boxW, boxH);
    });

    ctx.lineWidth = p.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = p.line;

    for (const { start: ia, end: ib } of connections) {
      const a = landmarks[ia];
      const b = landmarks[ib];
      if (!passesVisibility(a, style, minVis) || !passesVisibility(b, style, minVis)) {
        continue;
      }
      const p1 = pts[ia];
      const p2 = pts[ib];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i++) {
      const k = landmarks[i];
      if (!passesVisibility(k, style, minVis)) continue;
      const { x, y } = pts[i];
      ctx.fillStyle = p.core;
      ctx.beginPath();
      ctx.arc(x, y, p.outerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = p.joint;
      ctx.beginPath();
      ctx.arc(x, y, p.innerR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawMpPoseFrame(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  vw: number,
  vh: number,
  boxW: number,
  boxH: number,
  connections: readonly Conn[],
  minVis = 0.35,
): void {
  drawLandmarkSubjects(
    ctx,
    [landmarks],
    boxW,
    boxH,
    vw,
    vh,
    connections,
    "body",
    minVis,
  );
}
