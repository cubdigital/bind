export type LiveTrackMode = "body" | "face" | "hands";

export const LIVE_TRACK_MODES: {
  id: LiveTrackMode;
  label: string;
  hint: string;
}[] = [
  { id: "body", label: "Full body", hint: "Pose lite — coaching angles" },
  { id: "face", label: "Face", hint: "Mesh, eyes, blendshapes" },
  { id: "hands", label: "Hands", hint: "Up to two hands" },
];
