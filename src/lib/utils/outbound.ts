/**
 * Append UTM tracking params to an outbound URL so destination sites
 * see ThailandClinics as the referrer in their analytics.
 * Preserves existing query params; never overwrites a UTM the URL already has.
 * Returns the original string untouched if it isn't a parseable http(s) URL.
 */
const UTM_PARAMS: Record<string, string> = {
  utm_source: "thailand-clinics.com",
  utm_medium: "referral",
};

export function withUtm(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return url;
    for (const [key, value] of Object.entries(UTM_PARAMS)) {
      if (!parsed.searchParams.has(key)) parsed.searchParams.set(key, value);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
