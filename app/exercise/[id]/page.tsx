import { ExerciseDetailView } from "@/components/scrum-app/exercise-detail-view";
import { BottomNav } from "@/components/scrum-app/bottom-nav";
import {
  getExerciseById,
  getExerciseIds,
} from "@/lib/scrum/data";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getExerciseIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const routed = getExerciseById(id);
  if (!routed)
    return { title: "Exercise" };
  const line =
    routed.exercise.purpose?.[0] ?? routed.categoryName ?? "";
  return {
    title: routed.exercise.name,
    description: line,
  };
}

export default async function ExercisePage({ params }: PageProps) {
  const { id } = await params;
  const routed = getExerciseById(id);
  if (!routed) notFound();

  return (
    <>
      <ExerciseDetailView routed={routed} />
      <BottomNav />
    </>
  );
}
