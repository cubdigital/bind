import raw from "@/data/scrum-exercise-hero-media.json";

export type ExerciseHeroMedia = {
  imageUrl: string;
  commonsTitle: string;
  alt: string;
  movementDescription: string;
  sourceNote: string;
};

const byName = raw as Record<string, ExerciseHeroMedia>;

export function getExerciseHeroMedia(
  exerciseName: string,
): ExerciseHeroMedia | undefined {
  return byName[exerciseName];
}
