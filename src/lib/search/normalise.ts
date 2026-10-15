const PHRASES: [RegExp, string][] = [
  [/\bthong ?lo\b/g, "thonglor"], [/\bthong ?lor\b/g, "thonglor"],
  [/\basoke\b/g, "asok"], [/\bphrom ?phong\b/g, "phromphong"],
  [/\bsathon\b/g, "sathorn"], [/\bon ?nut\b/g, "onnut"], [/\bekkamai\b/g, "ekamai"],
  [/\bphuket town\b/g, "phukettown"], [/\bnad\+/g, "nad"],
];
const THAI = /[฀-๿]/;

export function isThai(s: string): boolean { return THAI.test(s); }

export function normalise(s: string): string {
  let x = s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  x = x.replace(/&/g, " and ").replace(/@/g, " at ");
  for (const [re, to] of PHRASES) x = x.replace(re, to);
  return x.replace(/[^\p{L}\p{M}\p{N}\s+]/gu, " ").replace(/\s+/g, " ").trim();
}

export function words(s: string): string[] { return normalise(s).split(" ").filter(Boolean); }
