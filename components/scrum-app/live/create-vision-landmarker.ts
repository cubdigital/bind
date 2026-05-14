import {
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { LiveTrackMode } from "./live-track-mode";

export const TASKS_VERSION = "0.10.21";

export const WASM_ROOT = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;

const MODEL_PATH: Record<LiveTrackMode, string> = {
  body:
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  face:
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  hands:
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
};

export type VisionLandmarkerHandle =
  | { mode: "body"; landmarker: PoseLandmarker }
  | { mode: "face"; landmarker: FaceLandmarker }
  | { mode: "hands"; landmarker: HandLandmarker };

async function tryGpuCpu<T>(create: (delegate: "GPU" | "CPU") => Promise<T>): Promise<T> {
  try {
    return await create("GPU");
  } catch {
    return await create("CPU");
  }
}

export async function createVisionLandmarker(
  mode: LiveTrackMode,
): Promise<VisionLandmarkerHandle> {
  const wasm = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const modelAssetPath = MODEL_PATH[mode];

  switch (mode) {
    case "body": {
      const landmarker = await tryGpuCpu((delegate) =>
        PoseLandmarker.createFromOptions(wasm, {
          baseOptions: { modelAssetPath, delegate },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.35,
          minPosePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
        }),
      );
      return { mode: "body", landmarker };
    }
    case "face": {
      const landmarker = await tryGpuCpu((delegate) =>
        FaceLandmarker.createFromOptions(wasm, {
          baseOptions: { modelAssetPath, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.35,
          minFacePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
          outputFaceBlendshapes: true,
        }),
      );
      return { mode: "face", landmarker };
    }
    case "hands": {
      const landmarker = await tryGpuCpu((delegate) =>
        HandLandmarker.createFromOptions(wasm, {
          baseOptions: { modelAssetPath, delegate },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.35,
          minHandPresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
        }),
      );
      return { mode: "hands", landmarker };
    }
  }
}
