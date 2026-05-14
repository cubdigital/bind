"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, Dumbbell, Play } from "lucide-react";
import { useState } from "react";
import type { ExampleSession } from "@/lib/scrum/types";

type Props = {
  sessions: ExampleSession[];
};

export function SessionsView({ sessions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 px-4 pt-12 pb-6 backdrop-blur-lg">
        <h1 className="font-bold text-3xl text-foreground">Sessions</h1>
        <p className="mt-1 text-muted-foreground">Structured training days</p>
      </div>

      <div className="space-y-4 px-4">
        {sessions.map((session, index) => {
          const open = expanded === session.name;
          const short = session.name.split(" - ")[0] ?? session.name;

          return (
            <motion.div
              key={session.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setExpanded(open ? null : session.name)}
              >
                <div>
                  <h2 className="font-bold text-foreground text-xl">
                    {session.name}
                  </h2>
                  <div className="mt-2 flex gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="size-4" />
                      {session.exercises.length} exercises
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />~60 min
                    </span>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex size-8 items-center justify-center rounded-full bg-secondary"
                >
                  <ChevronDown className="size-5 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    key={session.name}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-border border-t"
                  >
                    <div className="space-y-4 p-5">
                      {session.exercises.map((ex, i) => (
                        <div key={`${session.name}-${i}`} className="flex items-start gap-4">
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded bg-secondary font-bold text-primary text-sm">
                            {i + 1}
                          </div>
                          <SessionRow exercise={ex} />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-primary-foreground"
                      >
                        <Play className="size-4 fill-current" />
                        Start {short}
                      </button>
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

function SessionRow({
  exercise,
}: {
  exercise: Record<string, unknown>;
}) {
  const name =
    typeof exercise.exercise === "string" ? exercise.exercise : "Block";

  const parts: string[] = [];
  if (typeof exercise.sets === "number") parts.push(`${exercise.sets} sets`);
  if (typeof exercise.reps === "number") parts.push(`${exercise.reps} reps`);
  if (typeof exercise.distance === "string")
    parts.push(exercise.distance);
  if (typeof exercise.duration === "string")
    parts.push(exercise.duration);
  if (typeof exercise.directions === "number")
    parts.push(`${exercise.directions} directions`);

  return (
    <div>
      <div className="font-semibold text-foreground">{name}</div>
      {parts.length > 0 ? (
        <div className="text-muted-foreground text-sm">{parts.join(" • ")}</div>
      ) : null}
    </div>
  );
}
