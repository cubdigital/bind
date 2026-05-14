import { FaceLandmarker } from "@mediapipe/tasks-vision";

/** Dense face mesh plus the outer oval for clear silhouette */
export const FACE_DRAW_CONNECTIONS = [
  ...FaceLandmarker.FACE_LANDMARKS_TESSELATION,
  ...FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
];
