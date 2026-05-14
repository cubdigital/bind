/** Pull first integer from prescription strings such as `"4-6"` or `"3-5"` */
export function parseSetRepDefaults(prescription?: Record<
  string,
  string | number
>): { sets: number; reps: number | string } {
  const setsStr =
    prescription?.sets != null ? String(prescription.sets) : undefined;
  const repsStr =
    prescription?.reps != null ? String(prescription.reps) : undefined;

  const setsMatch = setsStr?.match(/(\d+)/);
  const repsMatch = repsStr?.match(/(\d+)/);

  return {
    sets: setsMatch ? Number.parseInt(setsMatch[1], 10) : 4,
    reps: repsMatch ? Number.parseInt(repsMatch[1], 10) : (repsStr ?? 5),
  };
}
