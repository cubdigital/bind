import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { landmarkToVideoPx, mapPointCover } from "./map-keypoint-cover";

type Conn = { start: number; end: number };

const LINE = "hsla(354, 100%, 71%, 0.92)";
const JOINT = "hsla(30, 100%, 70%, 0.95)";
const CORE = "hsla(240, 9%, 11%, 0.55)";

export type LandmarkDrawStyle = "body" | "face" | "hands";

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

  const lineWidth = style === "body" ? 3 : 2;
  const outerR = style === "body" ? 6 : 4;
  const innerR = style === "body" ? 3.5 : 2.5;

  for (const landmarks of subjects) {
    if (!landmarks?.length) continue;

    const pts = landmarks.map((lm) => {
      const p = landmarkToVideoPx(lm, vw, vh);
      return mapPointCover(p, vw, vh, boxW, boxH);
    });

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = LINE;

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
      ctx.fillStyle = CORE;
      ctx.beginPath();
      ctx.arc(x, y, outerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = JOINT;
      ctx.beginPath();
      ctx.arc(x, y, innerR, 0, Math.PI * 2);
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
