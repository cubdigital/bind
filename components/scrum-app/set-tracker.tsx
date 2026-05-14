"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Props = {
  sets: number;
  reps: number | string;
};

export function SetTracker({ sets, reps }: Props) {
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  const toggleSet = (index: number) => {
    setCompletedSets((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const repsDisplay = typeof reps === "number" ? String(reps) : reps;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
        <span>SET</span>
        <div className="mr-12 flex gap-16">
          <span>KGS</span>
          <span>REPS</span>
        </div>
      </div>

      <div className="relative space-y-4">
        <div className="absolute top-4 bottom-4 left-4 -z-10 w-px bg-border" />

        {Array.from({ length: sets }).map((_, i) => {
          const done = completedSets.includes(i);
          return (
            <div key={`set-${sets}-${i}`} className="relative flex items-center gap-4">
              <button
                type="button"
                data-testid={`btn-complete-set-${i}`}
                onClick={() => toggleSet(i)}
                className={`z-10 flex size-8 shrink-0 items-center justify-center rounded text-sm font-bold transition-colors ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </button>

              <div
                className={`flex flex-1 items-center justify-end gap-4 transition-opacity ${
                  done ? "opacity-50" : ""
                }`}
              >
                <input
                  type="text"
                  placeholder="-"
                  className="w-20 rounded-md border border-transparent bg-secondary py-2 text-center font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  defaultValue={repsDisplay}
                  className="w-20 rounded-md border border-transparent bg-secondary py-2 text-center font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
