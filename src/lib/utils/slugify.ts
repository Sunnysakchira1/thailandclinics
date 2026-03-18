// eslint-disable-next-line @typescript-eslint/no-require-imports
const transliterate = require("transliterate") as (s: string) => string;

const THAI_CHAR = /[\u0E00-\u0E7F]/;

/**
 * Extract an English name from a mixed Thai/English Outscraper name field.
 * Follows the 4-pattern decision tree from CLAUDE.md.
 */
export function extractEnglishName(raw: string): string | null {
  const s = raw.trim();

  // Pattern 1 — English text inside the first set of parentheses
  // e.g. "บ้านใจอารีย์ (JR Physio Clinic - China Town)" → "JR Physio Clinic China Town"
  const bracketMatch = s.match(/\(([^)]+)\)/);
  if (bracketMatch) {
    const inner = bracketMatch[1].trim();
    if (!THAI_CHAR.test(inner) && inner.length > 3) {
      return inner.replace(/[-–]/g, " ").replace(/\s+/g, " ").trim();
    }
  }

  // Pattern 2 — Latin text before ":" or "|"
  // e.g. "Greenbell Medical Clinic : คลินิกกายภาพบำบัด" → "Greenbell Medical Clinic"
  const colonMatch = s.match(/^([^:|]+)[:|]/);
  if (colonMatch) {
    const before = colonMatch[1].trim();
    if (!THAI_CHAR.test(before) && before.length > 3) {
      return before;
    }
  }

  // Pattern 3 — Leading Latin characters before Thai starts
  // e.g. "FRESH คลินิกกายภาพบำบัด" → "FRESH"
  const leadingLatin = s.match(/^([A-Za-z0-9 .''&+@-]+)/);
  if (leadingLatin) {
    const latin = leadingLatin[1].trim();
    if (latin.length > 3) {
      return latin;
    }
  }

  // Pattern 4 — Fully Thai, no Latin → null (will transliterate for slug only)
  return null;
}

/**
 * Generate a URL-safe slug following CLAUDE.md rules.
 * Decision tree:
 *   1. name_en exists → slugify it
 *   2. contains Thai → transliterate → slugify
 *   3. neither       → slugify directly
 *
 * Fallback: if slug < 4 chars → "clinic-" + last 6 of placeId
 */
export function generateSlug(
  name: string,
  nameEn: string | null,
  placeId: string
): string {
  let base: string;

  if (nameEn) {
    base = slugifyString(nameEn);
  } else if (THAI_CHAR.test(name)) {
    const transliterated = transliterate(name);
    base = slugifyString(transliterated);
  } else {
    base = slugifyString(name);
  }

  // Fallback for very short slugs
  if (base.length < 4) {
    base = "clinic-" + placeId.slice(-6).toLowerCase();
  }

  return base;
}

function slugifyString(s: string): string {
  return s
    .toLowerCase()
    // Replacements before stripping
    .replace(/&/g, "and")
    .replace(/\+/g, "and")
    .replace(/@/g, "at")
    // Remove unwanted chars
    .replace(/['"()/.,']/g, "")
    // Spaces and remaining separators → hyphens
    .replace(/[\s_]+/g, "-")
    // Remove any leftover non-ASCII (Thai after transliterate edge cases)
    .replace(/[^\x00-\x7F]/g, "")
    // Collapse double hyphens
    .replace(/-{2,}/g, "-")
    // Trim hyphens
    .replace(/^-+|-+$/g, "")
    // Max 60 chars — truncate at last complete word
    .slice(0, 60)
    .replace(/-[^-]*$/, (m, offset, str) =>
      offset + m.length === str.length && str.length > 60 ? "" : m
    );
}

/**
 * Resolve slug collisions.
 * Pass the set of already-used slugs; returns a unique slug.
 */
export function deduplicateSlug(
  slug: string,
  used: Set<string>,
  citySlug: string
): string {
  if (!used.has(slug)) return slug;

  const withCity = `${slug}-${citySlug}`;
  if (!used.has(withCity)) return withCity;

  let n = 2;
  while (used.has(`${withCity}-${n}`)) n++;
  return `${withCity}-${n}`;
}
