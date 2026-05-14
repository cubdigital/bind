import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { landmarkToVideoPx } from "./map-keypoint-cover";

/** BlazePose / pose landmarker lite indices */
const B = {
  Ls: 11,
  Rs: 12,
  Le: 13,
  Re: 14,
  Lw: 15,
  Rw: 16,
  Lh: 23,
  Rh: 24,
  Lk: 25,
  Rk: 26,
  La: 27,
  Ra: 28,
} as const;

export type JointAngleRow = {
  label: string;
  degrees: number;
};

type XY = { x: number; y: number };

function usable(lm: NormalizedLandmark | undefined, minVis: number): boolean {
  return !!(lm && (lm.visibility ?? 0) >= minVis);
}

/** Interior angle at `vertex` between segments to prev and next (image plane). */
function angleAt(prev: XY, vertex: XY, next: XY): number {
  const v1 = { x: prev.x - vertex.x, y: prev.y - vertex.y };
  const v2 = { x: next.x - vertex.x, y: next.y - vertex.y };
  const cross = Math.abs(v1.x * v2.y - v1.y * v2.x);
  const dot = v1.x * v2.x + v1.y * v2.y;
  return (Math.atan2(cross, dot) * 180) / Math.PI;
}

function tiltDeg(ls: XY, rs: XY): number {
  const dx = rs.x - ls.x;
  const dy = rs.y - ls.y;
  return (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
}

function px(
  lms: NormalizedLandmark[],
  i: number,
  vw: number,
  vh: number,
  minVis: number,
): XY | undefined {
  const lm = lms[i];
  if (!usable(lm, minVis)) return undefined;
  return landmarkToVideoPx(lm, vw, vh);
}

export function computeScrumAnglesMp(
  lms: NormalizedLandmark[],
  vw: number,
  vh: number,
  minVis = 0.35,
): JointAngleRow[] {
  const rows: JointAngleRow[] = [];

  const ls = px(lms, B.Ls, vw, vh, minVis);
  const rs = px(lms, B.Rs, vw, vh, minVis);
  if (ls && rs) {
    rows.push({
      label: "Shoulder line tilt",
      degrees: Math.round(tiltDeg(ls, rs)),
    });
  }

  const triples: [number, number, number, string][] = [
    [B.Ls, B.Le, B.Lw, "Left elbow"],
    [B.Rs, B.Re, B.Rw, "Right elbow"],
    [B.Lh, B.Lk, B.La, "Left knee"],
    [B.Rh, B.Rk, B.Ra, "Right knee"],
    [B.Ls, B.Lh, B.Lk, "Left hip hinge"],
    [B.Rs, B.Rh, B.Rk, "Right hip hinge"],
  ];

  for (const [ia, iv, ib, label] of triples) {
    const a = px(lms, ia, vw, vh, minVis);
    const v = px(lms, iv, vw, vh, minVis);
    const b = px(lms, ib, vw, vh, minVis);
    if (a && v && b) {
      rows.push({ label, degrees: Math.round(angleAt(a, v, b)) });
    }
  }

  return rows;
}
