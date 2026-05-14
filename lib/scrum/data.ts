import raw from "@/data/scrum-strength-framework.json";
import { slugify } from "./slug";
import type {
  RoutedExercise,
  StrengthFrameworkFile,
} from "./types";

const data = raw as StrengthFrameworkFile;

export function getStrengthFramework(): StrengthFrameworkFile {
  return data;
}

export function buildExerciseId(
  categoryIndex: number,
  exerciseIndex: number,
  exerciseName: string,
): string {
  return `c${categoryIndex}-e${exerciseIndex}-${slugify(exerciseName)}`;
}

function flattenRouted(): RoutedExercise[] {
  const out: RoutedExercise[] = [];
  data.categories.forEach((cat, catIndex) => {
    cat.exercises.forEach((ex, exIndex) => {
      out.push({
        id: buildExerciseId(catIndex, exIndex, ex.name),
        categoryName: cat.name,
        categoryDescription: cat.description,
        exercise: ex,
      });
    });
  });
  return out;
}

let cache: RoutedExercise[] | null = null;

export function getAllRoutedExercises(): RoutedExercise[] {
  if (!cache) cache = flattenRouted();
  return cache;
}

export function getExerciseById(id: string): RoutedExercise | undefined {
  return getAllRoutedExercises().find((r) => r.id === id);
}

export function getExerciseIds(): string[] {
  return getAllRoutedExercises().map((r) => r.id);
}

/** Card rows for Exercise list UI (purpose + prescription strings) */
export type ExerciseListEntry = {
  id: string;
  name: string;
  purpose: string[];
  prescription?: Record<string, string>;
};

export type ExerciseListCategory = {
  name: string;
  exercises: ExerciseListEntry[];
};

function prescriptionStrings(
  p?: RoutedExercise["exercise"]["prescription"],
): Record<string, string> | undefined {
  if (!p || Object.keys(p).length === 0) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(p)) {
    out[k] = typeof v === "number" ? String(v) : v;
  }
  return out;
}

export function getExerciseListCategories(): ExerciseListCategory[] {
  return data.categories.map((cat, catIndex) => ({
    name: cat.name,
    exercises: cat.exercises.map((ex, exIndex) => ({
      id: buildExerciseId(catIndex, exIndex, ex.name),
      name: ex.name,
      purpose: ex.purpose ?? [],
      prescription: prescriptionStrings(ex.prescription),
    })),
  }));
}
