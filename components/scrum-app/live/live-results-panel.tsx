"use client";

import { CircleOff } from "lucide-react";
import type { JointAngleRow } from "./scrum-joint-angles";
import type { BlendInsightRow } from "./live-landmarker-tick";
import type { LiveTrackMode } from "./live-track-mode";

type Props = {
  trackMode: LiveTrackMode;
  angles: JointAngleRow[];
  blendRows: BlendInsightRow[];
  handLines: string[];
  onStop: () => void;
};

export function LiveResultsPanel({
  trackMode,
  angles,
  blendRows,
  handLines,
  onStop,
}: Props) {
  return (
    <div className="border-border border-t bg-card px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-foreground text-sm">
          {trackMode === "body"
            ? "Joint angles"
            : trackMode === "face"
              ? "Face cues"
              : "Hands"}
        </h2>
        <button
          type="button"
          onClick={onStop}
          className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 font-medium text-muted-foreground text-xs"
        >
          <CircleOff className="size-4" />
          Stop camera
        </button>
      </div>

      {trackMode === "body" ? (
        angles.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Step back so your full torso and limbs are visible. Readings appear
            as confidence improves.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {angles.map((row) => (
              <li
                key={row.label}
                className="flex justify-between rounded-lg bg-secondary px-2 py-1.5 tabular-nums"
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-foreground">
                  {row.degrees}°
                </span>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {trackMode === "face" ? (
        blendRows.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Centre your face. Blendshape scores appear when the model locks on.
          </p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {blendRows.map((row) => (
              <li
                key={row.label}
                className="flex justify-between gap-3 rounded-lg bg-secondary px-2 py-1.5 tabular-nums"
              >
                <span className="truncate text-muted-foreground">
                  {row.label.replaceAll("_", " ")}
                </span>
                <span className="shrink-0 font-semibold text-foreground">
                  {(row.score * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {trackMode === "hands" ? (
        handLines.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Raise one or both hands into the frame. Palm toward the camera
            often tracks best.
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {handLines.map((line) => (
              <li
                key={line}
                className="rounded-lg bg-secondary px-2 py-1.5 text-foreground"
              >
                {line}
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
