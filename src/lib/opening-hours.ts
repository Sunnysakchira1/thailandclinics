/** Parses Google-style opening hours as stored in clinics.opening_hours. */

export type HoursMap = Record<string, string>;
export type Clock = { day: string; minutes: number };
type Span = [number, number];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CLOCK_RE = /^(\d{1,2})(?::(\d{2}))?(AM|PM)?$/i;

function minutesOf(hour: number, min: number, meridiem: string): number {
  return ((hour % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0)) * 60 + min;
}

/** "10AM-8PM", "12-8PM", "5:30-8PM", "12PM-12AM". The start may omit AM/PM. */
function parseRange(raw: string): Span | null {
  const parts = raw.split(/[-–—]/);
  if (parts.length !== 2) return null;
  const a = parts[0].match(CLOCK_RE);
  const b = parts[1].match(CLOCK_RE);
  if (!a || !b || !b[3]) return null;
  const end = minutesOf(+b[1], +(b[2] ?? 0), b[3]);
  let start: number;
  if (a[3]) {
    start = minutesOf(+a[1], +(a[2] ?? 0), a[3]);
  } else {
    // No AM/PM on the start: assume the end's, unless that would put it after the end.
    start = minutesOf(+a[1], +(a[2] ?? 0), b[3]);
    if (start >= end) start = minutesOf(+a[1], +(a[2] ?? 0), b[3].toUpperCase() === 'PM' ? 'AM' : 'PM');
  }
  return [start, end <= start ? end + 1440 : end];
}

export function parseDay(raw: string | null | undefined): Span[] {
  if (!raw) return [];
  const text = raw.replace(/\s+/g, '');
  if (/closed/i.test(text)) return [];
  if (/24hours/i.test(text)) return [[0, 1440]];
  return text.split(',').map(parseRange).filter((s): s is Span => s !== null);
}

export function parseHours(json: string | null | undefined): HoursMap | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as HoursMap) : null;
  } catch {
    return null;
  }
}

/** The current day and minute in Bangkok (UTC+7, no DST). */
export function bangkokClock(date: Date): Clock {
  const bkk = new Date(date.getTime() + 7 * 3_600_000);
  return { day: DAYS[bkk.getUTCDay()], minutes: bkk.getUTCHours() * 60 + bkk.getUTCMinutes() };
}

export function isOpenAt(hours: HoursMap | null, at: Clock): boolean {
  if (!hours) return false;
  if (parseDay(hours[at.day]).some(([s, e]) => at.minutes >= s && at.minutes < e)) return true;
  // A shift from yesterday that runs past midnight.
  const yesterday = DAYS[(DAYS.indexOf(at.day) + 6) % 7];
  return parseDay(hours[yesterday]).some(([, e]) => e > 1440 && at.minutes + 1440 < e);
}

export function isOpenOnDay(hours: HoursMap | null, day: string): boolean {
  return !!hours && parseDay(hours[day]).length > 0;
}
