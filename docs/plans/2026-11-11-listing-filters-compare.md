# Listing filters + clinic compare — implementation plan

**Goal:** Ship the approved mockup (https://claude.ai/artifact/CFa8GdhJbmxW922Pt1yVvp) on `/[city]/[category]/`.
**Architecture:** Pure logic in `src/lib` (hours, filters, compare), unit-tested. The listing payload gains stations, hours and derived amenities. All filter and compare state is client-side; no URL params.
**Spec:** the mockup, plus the decisions below.

## Decisions
- Compare: max 3, standalone clinics and branches only, same category only, stored in localStorage for 7 days.
- `/compare/`: noindex, follow. Self canonical. Linked only from client-rendered UI, so crawlers don't see a sitewide link.
- Filters: stations and neighbourhoods are OR within their group; everything else is AND.
- Brands: rating, reviews and Top rated apply to the brand. Other filters match if one branch meets them all, and counts sum matching branches.
- Sort: Recommended (existing paid-then-weighted order), Highest rated (organic), Most reviewed, A–Z.
- Near BTS/MRT flags stay at 500 m and are labelled as such. Moving them to 1 km is a separate live-data change awaiting Sunny's call (127 clinics).

## Tasks
1. `src/lib/opening-hours.ts` + tests: parse every format in the data; OpenStatus uses it.
2. `src/lib/service-taxonomy.ts`: moved out of ListingsClient.
3. `src/lib/listing-filters.ts` + tests: state, matching, contextual counts, option building.
4. `src/lib/compare.ts` + tests: list rules, storage, hook.
5. `queries.ts`: stations, hours, free parking, LGBTQ+, branch facets on `ListingEntry`.
6. UI: `ListingFilterSidebar`, `ListingToolbar`, `CompareTray`, ListingsClient rewiring, globals.css.
7. `/compare/` page + `CompareClient`; conditional Nav link.
8. Verify: vitest, tsc, full build (sitemap excludes /compare/), browser check at desktop and mobile.

## Review focus
- Overnight and split-shift hours; `12-8PM` style ranges.
- Listings with no stations (all non-Bangkok cities) hide that section.
- Brand cards under attribute filters: count matches branches.
- Storage blocked or corrupt: page still works.
- Compare checkbox must not trigger the card link.
