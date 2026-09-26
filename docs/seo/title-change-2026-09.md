# Clinic title change — 2026-09-26

**Change:** clinic profile, branch and brand-hub titles moved from
`[Name] — [Category] in [District], [City] | ThailandClinics` to
`[Name] [City] — Reviews, Treatments & Hours | ThailandClinics` (see `src/lib/seo/titles.ts`).
Rolled out to all 831 pages at once. There was no control group, by decision on 2026-09-26.

**Why:** GSC queries on high-impression, low-CTR clinic pages were mostly the clinic's
own name plus "reviews", "price list", "services" or "location". The old title said none of that.

**Baseline** (GSC, 2026-06-26 → 2026-09-24, clinic/branch/brand URLs, slash variants merged):

| Metric | Value |
|---|---|
| Pages with impressions | 824 |
| Clicks | 888 |
| Impressions | 90,840 |
| CTR | 0.98% |
| CTR at pos 6–10 | 1.0% |

**Read-out:** compare the 28 days from 2026-10-10 (after recrawl) with the same
position band. Brand-only queries ("aura clinic central world") are not expected to move.
The test is whether the "+ reviews / services / price" queries gain clicks. Seasonality and
ranking changes are not controlled for, so treat the result as directional.
