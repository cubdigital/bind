import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type ScreenPoint = { x: number; y: number };

/** Landmark in video pixel coordinates (aspect-correct before object-fit cover). */
export function landmarkToVideoPx(
  lm: NormalizedLandmark,
  vw: number,
  vh: number,
): ScreenPoint {
  return { x: lm.x * vw, y: lm.y * vh };
}

/** Map video pixel coords into layout box mirroring CSS `object-fit: cover`. */
export function mapPointCover(
  p: ScreenPoint,
  vw: number,
  vh: number,
  boxW: number,
  boxH: number,
): ScreenPoint {
  if (!vw || !vh || !boxW || !boxH) return { x: 0, y: 0 };
  const scale = Math.max(boxW / vw, boxH / vh);
  const drawW = vw * scale;
  const drawH = vh * scale;
  const ox = (boxW - drawW) / 2;
  const oy = (boxH - drawH) / 2;
  return {
    x: p.x * scale + ox,
    y: p.y * scale + oy,
  };
}
