import anyAscii from "any-ascii";

const THAI_CHAR = /[฀-๿]/;

/**
 * Extract an English name from a mixed Thai/English Outscraper name field.
 * Follows the 4-pattern decision tree from CLAUDE.md.
 */
export function extractEnglishName(raw: string): string | null {
  const s = raw.trim();

  // Pattern 0 — Latin name BEFORE a parenthesis (the paren is a branch/location
  // qualifier, not the name). Runs before Pattern 1 so we don't grab the qualifier.
  // e.g. "Bangkok New Smile Dental Clinic (Ratchadapisek) - คลินิก…" → "Bangkok New Smile Dental Clinic";
  // "DEEP & HARMONICARE IVF CENTER (THAILAND)" → "DEEP & HARMONICARE IVF CENTER".
  const parenIdx = s.indexOf("(");
  if (parenIdx > 0) {
    const before = s.slice(0, parenIdx).trim();
    if (!THAI_CHAR.test(before) && before.replace(/[^A-Za-z]/g, "").length > 3) {
      return before.replace(/\s+/g, " ").trim();
    }
  }

  // Pattern 1 — English text inside the first set of parentheses (when the text
  // before the paren is Thai/empty).
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

  // Pattern 3.5 — Longest Latin run anywhere in the name (additive fallback)
  // Handles "Thai…, English Name", "Thai… English Name" etc. that patterns 1-3 miss.
  // e.g. "อ้อม ฟิสิโอ … , Aom Physiotherapy Clinic" → "Aom Physiotherapy Clinic"
  const latinRuns = s.match(/[A-Za-z][A-Za-z0-9 .,&'’\-]*[A-Za-z]/g);
  if (latinRuns) {
    const best = latinRuns
      .map((r) => r.replace(/^[\s,.\-]+|[\s,.\-]+$/g, "").replace(/\s+/g, " ").trim())
      .sort((a, b) => b.length - a.length)[0];
    if (best && best.length > 5) {
      return best;
    }
  }

  // Pattern 4 — Fully Thai, no Latin → null (will transliterate for slug only)
  return null;
}

/**
 * Generate a URL-safe slug following CLAUDE.md rules.
 * Decision tree:
 *   1. name_en exists → slugify it
 *   2. contains Thai → anyAscii transliterate → slugify
 *   3. neither       → slugify directly
 *
 * Fallback: if slug < 4 chars → "clinic-" + sanitized last 6 of placeId
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
    const transliterated = anyAscii(name);
    base = slugifyString(transliterated);
  } else {
    base = slugifyString(name);
  }

  // Fallback for very short slugs — sanitize place_id chars before use
  if (base.length < 4) {
    const safeId = placeId.slice(-8).toLowerCase().replace(/[^a-z0-9]/g, "").slice(-6);
    base = "clinic-" + (safeId || placeId.slice(-6).replace(/[^a-z0-9]/g, ""));
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
    // Remove any leftover non-ASCII (edge cases)
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
