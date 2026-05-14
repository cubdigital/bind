"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

export type ExerciseCardPrescription = {
  sets?: string;
  reps?: string;
  distance?: string;
  rounds?: string;
  duration?: string;
  load?: string;
  intensity?: string;
  [key: string]: string | undefined;
};

type Props = {
  id: string;
  name: string;
  purpose: string[];
  prescription?: ExerciseCardPrescription;
  index: number;
};

export function ExerciseCard({
  id,
  name,
  purpose,
  prescription,
  index,
}: Props) {
  const prescriptionText = prescription
    ? [
        prescription.sets && prescription.reps
          ? `${prescription.sets} sets • ${prescription.reps} reps`
          : null,
        prescription.distance ? String(prescription.distance) : null,
        prescription.rounds ? `${prescription.rounds} rounds` : null,
        prescription.duration ? String(prescription.duration) : null,
        prescription.load ? String(prescription.load) : null,
        prescription.intensity ? String(prescription.intensity) : null,
      ]
        .filter(Boolean)
        .join(" • ")
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/exercise/${id}`}
        data-testid={`card-exercise-${name}`}
        className="block"
      >
        <div className="flex cursor-pointer items-center gap-4 border-border/50 border-b bg-card p-4 transition-colors first:rounded-t-xl last:rounded-b-xl last:border-b-0 hover:bg-secondary">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <div className="size-6 rounded-full border-2 border-muted-foreground/30" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">{name}</h3>
            {prescriptionText ? (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {prescriptionText}
              </p>
            ) : null}
            {!prescriptionText && purpose.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {purpose.slice(0, 2).map((p) => (
                  <span
                    key={p}
                    className="max-w-full truncate rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <ChevronRight
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </div>
      </Link>
    </motion.div>
  );
}
