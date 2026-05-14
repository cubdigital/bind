/** Types for `data/scrum-strength-framework.json` */

export type PrescriptionFields = Record<string, string | number>;

export type FrameworkExercise = {
  name: string;
  purpose?: string[];
  benefits?: string[];
  coachingPoints?: string[];
  prescription?: PrescriptionFields;
  variations?: string[];
  methods?: string[];
  notes?: string[];
  /** Banded neck work lists directions; some session rows use a count */
  directions?: string[] | number;
};

export type FrameworkCategory = {
  name: string;
  description?: string;
  exercises: FrameworkExercise[];
};

export type ExampleSessionExercise = Record<string, unknown>;

export type ExampleSession = {
  name: string;
  exercises: ExampleSessionExercise[];
};

export type PositionBlock = {
  priorities: string[];
  recommendedExercises: string[];
};

export type StrengthFrameworkFile = {
  title: string;
  overview: {
    focusAreas: string[];
    trainingGoals: string[];
  };
  categories: FrameworkCategory[];
  positionSpecificRecommendations: {
    frontRow: PositionBlock;
    locks: PositionBlock;
    looseForwards: PositionBlock;
  };
  injuryPrevention: {
    focusAreas: string[];
    weeklyExercises: string[];
  };
  exampleSessions: ExampleSession[];
  coachingPrinciples: { title: string; description: string }[];
  advancedMethods: string[];
};

/** One exercise with stable route id and source category */
export type RoutedExercise = {
  id: string;
  categoryName: string;
  categoryDescription?: string;
  exercise: FrameworkExercise;
};
