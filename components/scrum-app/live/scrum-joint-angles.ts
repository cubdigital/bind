import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { landmarkToVideoPx, mapPointCover } from "./map-keypoint-cover";

/** BlazePose / MediaPipe pose landmarker indices */
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
  Lfi: 31,
  Rfi: 32,
} as const;

export type JointAngleRow = {
  label: string;
  degrees: number;
};

export type ScrumAngleOverlay = {
  shortLabel: string;
  degrees: number;
  /** Label anchor in canvas/CSS pixels (same space as skeleton draw) */
  x: number;
  y: number;
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

function toVideoPx(
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

function toBox(
  p: XY | undefined,
  vw: number,
  vh: number,
  boxW: number,
  boxH: number,
): XY | undefined {
  if (!p) return undefined;
  return mapPointCover(p, vw, vh, boxW, boxH);
}

type AngleJob =
  | {
      kind: "tilt";
      label: string;
      short: string;
    }
  | {
      kind: "triple";
      ia: number;
      iv: number;
      ib: number;
      label: string;
      short: string;
    };

/** Order matches coaching priority for scrum: spine/hips, then knees/ankles, then arms */
const ANGLE_JOBS: AngleJob[] = [
  {
    kind: "tilt",
    label: "Shoulder line tilt",
    short: "Shldr",
  },
  { kind: "triple", ia: B.Ls, iv: B.Lh, ib: B.Lk, label: "Left hip hinge", short: "Hip L" },
  { kind: "triple", ia: B.Rs, iv: B.Rh, ib: B.Rk, label: "Right hip hinge", short: "Hip R" },
  { kind: "triple", ia: B.Lh, iv: B.Lk, ib: B.La, label: "Left knee", short: "Knee L" },
  { kind: "triple", ia: B.Rh, iv: B.Rk, ib: B.Ra, label: "Right knee", short: "Knee R" },
  { kind: "triple", ia: B.Lk, iv: B.La, ib: B.Lfi, label: "Left ankle", short: "Ank L" },
  { kind: "triple", ia: B.Rk, iv: B.Ra, ib: B.Rfi, label: "Right ankle", short: "Ank R" },
  { kind: "triple", ia: B.Ls, iv: B.Le, ib: B.Lw, label: "Left elbow", short: "Elb L" },
  { kind: "triple", ia: B.Rs, iv: B.Re, ib: B.Rw, label: "Right elbow", short: "Elb R" },
];

export function computeScrumPoseAngles(
  lms: NormalizedLandmark[],
  vw: number,
  vh: number,
  boxW: number,
  boxH: number,
  minVis = 0.35,
): { rows: JointAngleRow[]; overlays: ScrumAngleOverlay[] } {
  const rows: JointAngleRow[] = [];
  const overlays: ScrumAngleOverlay[] = [];

  for (const job of ANGLE_JOBS) {
    if (job.kind === "tilt") {
      const ls = toVideoPx(lms, B.Ls, vw, vh, minVis);
      const rs = toVideoPx(lms, B.Rs, vw, vh, minVis);
      if (!ls || !rs) continue;
      const deg = Math.round(tiltDeg(ls, rs));
      rows.push({ label: job.label, degrees: deg });
      const midV = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
      const midB = toBox(midV, vw, vh, boxW, boxH);
      if (midB) {
        overlays.push({
          shortLabel: job.short,
          degrees: deg,
          x: midB.x,
          y: midB.y,
        });
      }
      continue;
    }

    const a = toVideoPx(lms, job.ia, vw, vh, minVis);
    const v = toVideoPx(lms, job.iv, vw, vh, minVis);
    const b = toVideoPx(lms, job.ib, vw, vh, minVis);
    if (!a || !v || !b) continue;
    const deg = Math.round(angleAt(a, v, b));
    rows.push({ label: job.label, degrees: deg });
    const vb = toBox(v, vw, vh, boxW, boxH);
    if (vb) {
      overlays.push({
        shortLabel: job.short,
        degrees: deg,
        x: vb.x,
        y: vb.y,
      });
    }
  }

  return { rows, overlays };
}

/** Panel list only (throttled updates). */
export function computeScrumAnglesMp(
  lms: NormalizedLandmark[],
  vw: number,
  vh: number,
  minVis = 0.35,
): JointAngleRow[] {
  return computeScrumPoseAngles(lms, vw, vh, 1, 1, minVis).rows;
}
