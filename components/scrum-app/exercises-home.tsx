"use client";

import type { ExerciseListCategory } from "@/lib/scrum/data";
import { ExerciseCard } from "@/components/scrum-app/exercise-card";

type Injury = {
  focusAreas: string[];
  weeklyExercises: string[];
};

type Props = {
  categories: ExerciseListCategory[];
  injuryPrevention: Injury;
};

export function ExercisesHome({ categories, injuryPrevention }: Props) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 px-4 pt-12 pb-6 backdrop-blur-lg">
        <h1 className="font-bold text-3xl text-foreground">Exercises</h1>
        <p className="mt-1 text-muted-foreground">Exercise library</p>
      </div>

      <div className="space-y-8 px-4">
        {categories.map((category) => (
          <div key={category.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg uppercase tracking-wider">
                {category.name}
              </h2>
              <span className="rounded-full bg-secondary px-2 py-1 font-semibold text-primary text-xs">
                {category.exercises.length}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {category.exercises.map((row, idx) => (
                <ExerciseCard
                  key={row.id}
                  id={row.id}
                  index={idx}
                  name={row.name}
                  purpose={row.purpose}
                  prescription={row.prescription}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 space-y-3 border-border border-t pt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground text-lg uppercase tracking-wider">
              Injury prevention
            </h2>
            <span className="rounded-full bg-secondary px-2 py-1 font-semibold text-accent text-xs">
              Recovery
            </span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 font-semibold">Focus areas</h3>
            <div className="mb-4 flex flex-wrap gap-2">
              {injuryPrevention.focusAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-border bg-secondary px-2.5 py-1 text-muted-foreground text-xs"
                >
                  {area}
                </span>
              ))}
            </div>
            <h3 className="mb-2 font-semibold text-muted-foreground text-sm">
              Weekly exercises
            </h3>
            <ul className="space-y-2">
              {injuryPrevention.weeklyExercises.map((ex) => (
                <li key={ex} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
