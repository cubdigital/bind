import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { landmarkToVideoPx, mapPointCover } from "./map-keypoint-cover";

type Conn = { start: number; end: number };

const LINE = "hsla(354, 100%, 71%, 0.92)";
const JOINT = "hsla(30, 100%, 70%, 0.95)";
const CORE = "hsla(240, 9%, 11%, 0.55)";

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
  ctx.clearRect(0, 0, boxW, boxH);

  const pts = landmarks.map((lm) => {
    const p = landmarkToVideoPx(lm, vw, vh);
    return mapPointCover(p, vw, vh, boxW, boxH);
  });

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = LINE;

  for (const { start: ia, end: ib } of connections) {
    const a = landmarks[ia];
    const b = landmarks[ib];
    if (
      !a ||
      !b ||
      (a.visibility ?? 0) < minVis ||
      (b.visibility ?? 0) < minVis
    ) {
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
    if (!k || (k.visibility ?? 0) < minVis) continue;
    const { x, y } = pts[i];
    ctx.fillStyle = CORE;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = JOINT;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
