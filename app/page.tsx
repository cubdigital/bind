import { BottomNav } from "@/components/scrum-app/bottom-nav";
import { ExercisesHome } from "@/components/scrum-app/exercises-home";
import {
  getExerciseListCategories,
  getStrengthFramework,
} from "@/lib/scrum/data";

export default function HomePage() {
  const framework = getStrengthFramework();
  const categories = getExerciseListCategories();

  return (
    <>
      <ExercisesHome
        categories={categories}
        injuryPrevention={framework.injuryPrevention}
      />
      <BottomNav />
    </>
  );
}
