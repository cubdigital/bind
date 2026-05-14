import {
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { VisionLandmarkerHandle } from "./create-vision-landmarker";
import { drawLandmarkSubjects, drawMpPoseFrame } from "./draw-skeleton-frame";
import { drawPoseAngleLabels } from "./draw-pose-angle-labels";
import { FACE_DRAW_CONNECTIONS } from "./face-draw-connections";
import {
  computeScrumPoseAngles,
  type JointAngleRow,
} from "./scrum-joint-angles";
import { withSuppressedTfLiteConsole } from "./suppress-tflite-console-noise";

const VIS = 0.32;
const INSIGHT_INTERVAL_MS = 240;

export type BlendInsightRow = { label: string; score: number };

type InsightSink = {
  throttleRef: { current: number };
  setAngles: (rows: JointAngleRow[]) => void;
  setBlendRows: (rows: BlendInsightRow[]) => void;
  setHandLines: (lines: string[]) => void;
};

export function detectAndDrawLandmarks(
  handle: VisionLandmarkerHandle,
  video: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  bw: number,
  bh: number,
  vw: number,
  vh: number,
  sink: InsightSink,
): void {
  withSuppressedTfLiteConsole(() => {
  const t =
    typeof performance !== "undefined" ? performance.now() : Date.now();
  const now =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  switch (handle.mode) {
    case "body": {
      try {
      const result = handle.landmarker.detectForVideo(video, t);
      const poseLm = result.landmarks?.[0];
      if (poseLm?.length) {
        const minVis = VIS + 0.03;
        const { rows, overlays } = computeScrumPoseAngles(
          poseLm,
          vw,
          vh,
          bw,
          bh,
          minVis,
        );
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
        drawPoseAngleLabels(ctx, overlays);
        if (now - sink.throttleRef.current > INSIGHT_INTERVAL_MS) {
          sink.throttleRef.current = now;
          sink.setAngles(rows);
        }
      } else {
        ctx.clearRect(0, 0, bw, bh);
      }
      } catch {
        ctx.clearRect(0, 0, bw, bh);
      }
      break;
    }
    case "face": {
      try {
      const result = handle.landmarker.detectForVideo(video, t);
      const faces = result.faceLandmarks?.filter((f) => f?.length) ?? [];
      if (faces.length) {
        drawLandmarkSubjects(
          ctx,
          faces,
          bw,
          bh,
          vw,
          vh,
          FACE_DRAW_CONNECTIONS,
          "face",
        );
      } else {
        ctx.clearRect(0, 0, bw, bh);
      }
      if (now - sink.throttleRef.current > INSIGHT_INTERVAL_MS) {
        sink.throttleRef.current = now;
        const cats = result.faceBlendshapes?.[0]?.categories;
        if (cats?.length) {
          const sorted = [...cats]
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map((c) => ({
              label: c.displayName || c.categoryName,
              score: c.score,
            }));
          sink.setBlendRows(sorted);
        } else {
          sink.setBlendRows([]);
        }
      }
      } catch {
        ctx.clearRect(0, 0, bw, bh);
      }
      break;
    }
    case "hands": {
      try {
      const result = handle.landmarker.detectForVideo(video, t);
      const hands = result.landmarks?.filter((h) => h?.length) ?? [];
      if (hands.length) {
        drawLandmarkSubjects(
          ctx,
          hands,
          bw,
          bh,
          vw,
          vh,
          HandLandmarker.HAND_CONNECTIONS,
          "hands",
        );
      } else {
        ctx.clearRect(0, 0, bw, bh);
      }
      if (now - sink.throttleRef.current > INSIGHT_INTERVAL_MS) {
        sink.throttleRef.current = now;
        const lines: string[] = [];
        hands.forEach((lm, i) => {
          const cat = result.handedness[i]?.[0];
          const side =
            cat?.displayName || cat?.categoryName || `Hand ${i + 1}`;
          lines.push(`${side} · ${lm.length} points`);
        });
        sink.setHandLines(lines);
      }
      } catch {
        ctx.clearRect(0, 0, bw, bh);
      }
      break;
    }
  }
  });
}
