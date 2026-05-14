"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ListChecks, Target } from "lucide-react";
import { useState } from "react";
import type { StrengthFrameworkFile } from "@/lib/scrum/types";

type PosMap = StrengthFrameworkFile["positionSpecificRecommendations"];

type Props = {
  positions: PosMap;
};

export function PositionsView({ positions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const entries = Object.entries(positions) as [keyof PosMap, PosMap[keyof PosMap]][];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 px-4 pt-12 pb-6 backdrop-blur-lg">
        <h1 className="font-bold text-3xl text-foreground">Positions</h1>
        <p className="mt-1 text-muted-foreground">Specific needs by group</p>
      </div>

      <div className="space-y-4 px-4">
        {entries.map(([key, data], index) => {
          const title = formatKey(String(key));
          const open = expanded === key;

          return (
            <motion.div
              key={String(key)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setExpanded(open ? null : String(key))}
              >
                <h2 className="font-bold text-2xl text-foreground">{title}</h2>
                <motion.div
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex size-8 items-center justify-center rounded-full bg-secondary"
                >
                  <ChevronDown className="size-5 text-primary" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    key={String(key)}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-secondary/30"
                  >
                    <div className="space-y-6 p-5">
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 font-bold text-accent text-lg">
                          <Target className="size-5" /> Priorities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {data.priorities.map((p) => (
                            <span
                              key={p}
                              className="rounded-full border border-border bg-secondary px-3 py-1.5 font-medium text-sm"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 font-bold text-lg text-primary">
                          <ListChecks className="size-5" /> Key exercises
                        </h3>
                        <ul className="space-y-2">
                          {data.recommendedExercises.map((ex) => (
                            <li
                              key={ex}
                              className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                            >
                              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                              <span className="font-medium">{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function formatKey(raw: string): string {
  return raw
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}
