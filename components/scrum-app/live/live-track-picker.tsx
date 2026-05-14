"use client";

import type { LiveTrackMode } from "./live-track-mode";
import { LIVE_TRACK_MODES } from "./live-track-mode";

type Props = {
  value: LiveTrackMode;
  onChange: (mode: LiveTrackMode) => void;
  disabled?: boolean;
  className?: string;
};

export function LiveTrackPicker({
  value,
  onChange,
  disabled,
  className = "",
}: Props) {
  return (
    <div
      className={`flex flex-wrap justify-center gap-2 ${className}`}
      role="tablist"
      aria-label="Tracking mode"
    >
      {LIVE_TRACK_MODES.map(({ id, label }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`rounded-full px-3 py-1.5 font-medium text-xs transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            } ${disabled ? "opacity-50" : ""}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
