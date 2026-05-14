/** URL-safe slug from display text */
export function slugify(s: string): string {
  const out = s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return out || "item";
}
