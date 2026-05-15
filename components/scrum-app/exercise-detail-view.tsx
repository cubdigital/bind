"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  History,
  MoreHorizontal,
  Play,
  RefreshCcw,
} from "lucide-react";
import type { RoutedExercise } from "@/lib/scrum/types";
import { SetTracker } from "@/components/scrum-app/set-tracker";
import { parseSetRepDefaults } from "@/components/scrum-app/exercise-prescription-utils";
import { getExerciseHeroMedia } from "@/lib/scrum/exercise-hero-media";

type Props = {
  routed: RoutedExercise;
};

export function ExerciseDetailView({ routed }: Props) {
  const router = useRouter();
  const exercise = routed.exercise;
  const hero = getExerciseHeroMedia(exercise.name);
  const heroIsGif = hero?.imageUrl.toLowerCase().endsWith(".gif");
  const { sets: defaultSets, reps: defaultReps } = parseSetRepDefaults(
    exercise.prescription,
  );
  const hasPrescription =
    !!exercise.prescription && Object.keys(exercise.prescription).length > 0;

  const extraRx =
    exercise.prescription &&
    Object.entries(exercise.prescription).filter(
      ([key]) => key !== "sets" && key !== "reps",
    );

  function scrollToLog() {
    const el = document.getElementById("log-sets");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-background/90 px-4 py-4 backdrop-blur-md">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.back()}
          className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
        >
          <ChevronLeft className="size-6" />
        </button>
        <div className="flex gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
            <History className="size-5" aria-hidden />
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
            <RefreshCcw className="size-5" aria-hidden />
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
            <MoreHorizontal className="size-5" aria-hidden />
          </span>
        </div>
      </div>

      <div className="space-y-4 px-4 py-6">
        <div className="inline-block rounded-full bg-primary/20 px-3 py-1 font-bold text-primary text-xs uppercase tracking-wider">
          {routed.categoryName}
        </div>
        <h1 className="font-bold text-4xl text-foreground leading-tight">
          {exercise.name}
        </h1>

        {hero ? (
          <div className="space-y-2 pt-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
              <Image
                src={hero.imageUrl}
                alt={hero.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
                unoptimized={heroIsGif}
                priority
              />
            </div>
            <p className="text-center text-muted-foreground text-[11px] leading-snug">
              {hero.commonsTitle}. {hero.sourceNote}
            </p>
            <p className="text-foreground/90 text-sm leading-relaxed">
              {hero.movementDescription}
            </p>
          </div>
        ) : null}

        {exercise.purpose && exercise.purpose.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {exercise.purpose.map((p) => (
              <span
                key={p}
                className="rounded-full border border-border bg-secondary px-3 py-1.5 text-foreground text-sm"
              >
                {p}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 px-4">
        <div className="mb-6 flex border-border border-b">
          <span className="border-primary border-b-2 px-4 py-3 font-semibold text-primary">
            Overview
          </span>
          <span className="cursor-not-allowed px-4 py-3 font-semibold text-muted-foreground">
            History
          </span>
          <span className="cursor-not-allowed px-4 py-3 font-semibold text-muted-foreground">
            Records
          </span>
        </div>

        <div className="space-y-8">
          {hasDirections(exercise.directions) ? (
            <section className="space-y-4">
              <h2 className="font-bold text-xl">Directions</h2>
              {Array.isArray(exercise.directions) ? (
                <ul className="space-y-2">
                  {exercise.directions.map((d) => (
                    <li key={d} className="text-muted-foreground text-sm">
                      • {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {Number(exercise.directions)} directions in the prescription.
                </p>
              )}
            </section>
          ) : null}

          {extraRx && extraRx.length > 0 ? (
            <section className="space-y-3">
              <h2 className="font-bold text-xl">Prescription detail</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {extraRx.map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg bg-card px-3 py-2 text-sm ring-1 ring-border"
                  >
                    <span className="text-muted-foreground capitalize">
                      {k}:{" "}
                    </span>
                    <span className="font-medium text-foreground">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {exercise.coachingPoints?.length ? (
            <section className="space-y-4">
              <h2 className="font-bold text-xl">Coaching points</h2>
              <ul className="space-y-3">
                {exercise.coachingPoints.map((point, i) => (
                  <li
                    key={point}
                    className="flex gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-primary text-sm">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {exercise.benefits?.length ? (
            <section className="space-y-3">
              <h2 className="font-bold text-xl">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {exercise.benefits.map((b) => (
                  <span
                    key={b}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-foreground text-sm"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {exercise.variations?.length ? (
            <section className="space-y-3">
              <h2 className="font-bold text-xl">Variations</h2>
              <div className="flex flex-wrap gap-2">
                {exercise.variations.map((v) => (
                  <span
                    key={v}
                    className="rounded-full border border-border bg-secondary px-3 py-1 text-sm"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {exercise.methods?.length || exercise.notes?.length ? (
            <section className="space-y-3">
              <h2 className="font-bold text-xl">Notes and methods</h2>
              <div className="space-y-2 rounded-xl border border-border bg-card p-4 text-muted-foreground text-sm">
                {exercise.methods?.map((m) => (
                  <div key={m}>• {m}</div>
                ))}
                {exercise.notes?.map((n) => (
                  <div key={n}>• {n}</div>
                ))}
              </div>
            </section>
          ) : null}

          {hasPrescription ? (
            <section
              id="log-sets"
              className="scroll-mt-24 space-y-4 border-border border-t pt-4"
            >
              <h2 className="font-bold text-xl">Log sets</h2>
              <SetTracker sets={defaultSets} reps={defaultReps} />
            </section>
          ) : null}
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={scrollToLog}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-lg text-primary-foreground shadow-xl"
        >
          <Play className="size-5 fill-current" />
          Start session
        </motion.button>
      </div>

      <div className="h-20 shrink-0" aria-hidden />
    </div>
  );
}

function hasDirections(
  d?: string[] | number,
): d is string[] | number {
  if (d === undefined) return false;
  if (typeof d === "number") return true;
  return d.length > 0;
}
