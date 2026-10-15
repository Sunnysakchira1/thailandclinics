# Homepage search, city photos and plan tiers: design

Date: 2026-10-15 · Status: approved direction (mockup signed off 2026-10-15)

## Why

The partner proposal deck (sent to CLASS CLINIC and Ovio on 2026-10-15) sells three plans: Basic (free), Pro (฿4,900/mo) and Premium (฿9,900/mo). The site has to show what the deck promises before a clinic checks. The homepage also has two visible problems:

- Search is a keyword-to-category redirect. Clinic names, treatments (Ulthera, Invisalign) and areas (Asok) all dump the user on the city page.
- The city tiles are flat gradients with no photos.

## Decisions (from Sunny)

| Topic | Decision |
|---|---|
| Paid badge wording | **"Premium"**. Not "Premium partner". |
| Top rated | Our editors' pick — never sold. A manual editorial flag (`top_rated` on clinics and brands, default off), set by hand per clinic or brand, on any plan. Branches inherit their brand's flag. (Changed 2026-10-15: was rating ≥ 4.8 and reviews ≥ 50.) |
| Pro label | Green **"Featured"**, category page only |
| Premium clinics at launch | Form Recovery Asoke + Thonglor (clinics). The Cosmo Clinic and Genesis Fertility Center (brands). |
| Doctors | Premium only, up to 3 per clinic |
| City photos | Wikimedia Commons, CC licensed, credited on the page |
| Search scope | Clinics + treatments + categories + areas, type-ahead |
| Out of scope | Backlinks and sponsored articles. These are service delivery, not site features. |

## 1. Data model

Add to `clinics` **and** `brands`:

- `tier TEXT NOT NULL DEFAULT 'basic'`. The value is `'basic' | 'pro' | 'premium'`.
- Keep `featured_position`. It orders paid entries within the same tier (lower number comes first).
- `featured` becomes derived. It is kept only for old code paths during migration, and is set to `tier != 'basic'`. After the cut-over, no code reads it.

New table `clinic_doctors`:

| column | type |
|---|---|
| id | integer pk |
| clinic_id | FK → clinics.id (a brand's doctors attach to each branch clinic) |
| name | text, required |
| role | text, e.g. "Lead physiotherapist" |
| credentials | text, e.g. "BSc Physical Therapy (Mahidol)" |
| licence | text, nullable, e.g. "Thai PT Council no. 1234" |
| photo_url | text, nullable |
| sort_order | integer |

Rendering caps doctors at 3 and only renders them for Premium clinics, or for branches whose brand is Premium. The data can exist for any clinic. The display rule is the gate.

Migration: `scripts/migrate-tiers.ts`. It uses raw `ALTER TABLE` / `CREATE TABLE` (the same pattern as `enrich-about.ts`), is idempotent, and sets the four launch Premium entries. The Drizzle schema in `src/lib/db/schema.ts` is updated to match.

One helper in `src/lib/tiers.ts`:

- `type Tier = 'basic'|'pro'|'premium'`
- `effectiveTier(clinic, brand?)`: the brand tier wins for branches.
- `isTopRated(clinicFlag, brandFlag?)`: true when either flag is 1/true. Never derived from tier or ratings.
- `tierRank(t)`: premium 2, pro 1, basic 0.

## 2. Badges

`src/components/ui/PlanBadges.tsx` renders `◆ Premium` (gold: bg `#fbf4e2`, border `#c9a84c`, text `#7a5d17`), `Featured` (bg `var(--green)`, white text) and `★ Top rated` (green-pale). It has a `size="sm"` variant. Gold is new. It's added as CSS vars `--gold`, `--gold-pale` and `--gold-ink` in globals.css. It's used **only** for Premium.

`Featured` renders only on the category listing (Pro). `Premium` renders everywhere a Premium clinic appears. This replaces the hardcoded "Top Rated" pill on homepage card `i === 0` (src/app/page.tsx:367) and the featured-means-"Top Rated" pill in `ListingsClient.tsx:779`.

## 3. Placement by page

| Page | Change |
|---|---|
| Homepage "Highly rated in Bangkok" | Premium Bangkok clinics/brands first (gold frame), then organic by weighted rating. Card links go through the clinic's real city/category, not the hardcoded `/bangkok/physiotherapy-clinics/`. Max 3 cards. |
| City page (`[city]/page.tsx`) | Premium entries in that city are pinned at the top of the clinic rows, with the badge. Then organic. |
| Category listing (`ListingsClient`) | Default sort: Premium (by position), then Pro (by position), then organic weighted rating. Premium rows get the gold frame and badge. Pro rows get the green edge and "Featured". Under the "reviews" and "name" sorts, the paid order is not applied, but the badges remain. |
| Category landing "Top Rated {cat}" | Unchanged: organic only. A paid clinic must not sit under a heading that says "Top Rated" unless it earns it. |
| Clinic profile | Badges above the H1. The "Our doctors" section (Premium only, max 3) goes after the editorial block. The physio-specific Editor's Pick fallback copy (ClinicProfileView.tsx:806) no longer fires for clinics that have no `editorsNote`. |
| Brand hub + branch | Use the brand tier. Badges on the hub header and each branch. |
| Guides (MDX) | New `<PremiumBox slug="...">` MDX component. It wraps an entry, adds the Premium badge (plus Top rated if the editors have flagged it), and puts a disclosure line under it: "Premium: this clinic pays for a labelled placement. Our rankings are editorial and not for sale." with a link to /how-we-rank/. It's added by hand to the guides that mention Form, Cosmo and Genesis. |
| /list-your-clinic/ | `INCLUDES` is rewritten as the three plans with prices. FAQ "How much does it cost?" and "Can I pay to rank higher?" are rewritten to match the deck. The FAQPage schema follows automatically. |
| /how-we-rank/ | The paragraph on paid placement is updated: Premium, Featured, and Top rated as our editors' pick — never sold. |

## 4. Search

The homepage `SearchBar` becomes a type-ahead combobox. There's still no `/search/` route and no `SearchAction` schema.

**Index.** `scripts/build-search-index.ts` runs before `next build` (`prebuild`). It writes `public/search-index.json`, about 20–25 KB gzipped. Each entry is `{id, name, url, city, category, district, rating, reviews, tier, topRated, photo, tokens}`.
- `tokens` include the English name, Thai name, district, brand name, and service tags from `clinics.services`, mapped to labels (e.g. `dry-needling` becomes "dry needling").
- A static `TREATMENTS` table maps treatment names and synonyms to a category, e.g. Ulthera/HIFU/ultherapy → cosmetic, Invisalign/aligners/braces → dental, NAD+/IV drip → wellness, ACL/sports injury → physio.
- An `AREAS` alias table covers districts and BTS areas: Asok/Asoke, Thonglor/Thong Lo, Phrom Phong, Sathorn/Sathon, Silom, Ari, On Nut, Patong, Kata, Phuket Town.

**Loading.** The index is fetched lazily on first focus of the input, so it adds nothing to the initial page load.

**Matching.** Better than the mockup.
1. Normalise: lowercase, strip diacritics and punctuation, `&` → "and", collapse spaces.
2. Word-prefix match on tokens. "form" matches "Form Recovery" but not "Perform…".
3. Typo tolerance: one edit for tokens of 5+ characters ("ultera" → Ulthera, "invisaline" → Invisalign).
4. Multi-word queries: every word must match some token ("dental asok" → dental clinics in the Asok area).
5. Thai input matches `name_th`.

**Ranking within Clinics.** Exact name match, then name-prefix, then token match. Within each band: tier (Premium first), then weighted rating. Show at most 6 clinics, 3 treatments, 2 categories and 2 areas.

**Results UI.** It matches the mockup: grouped results with photo thumbnails, badges, and a "district, city · ★ rating (reviews)" line. Keyboard: ↑/↓, Enter, Esc. ARIA combobox/listbox. Enter with nothing highlighted opens the top result. The empty state suggests a treatment or area. The city select lists only live cities (Bangkok, Phuket) plus "All cities". It's driven from the DB, so new cities appear automatically.

**Mobile.** The city select is hidden under 900px, so "All cities" is the default. The dropdown is full width.

## 5. City tiles

- Photos go in `public/cities/{bangkok,phuket,chiang-mai,pattaya}.webp`, cropped to 3:4 at 600×800. Sources:
  - Bangkok: skytrain sunset, Diliff, CC BY-SA 3.0
  - Phuket: Thalang Road, Christophe95, CC BY-SA 4.0
  - Chiang Mai: Doi Suthep, Jakub Hałun, CC BY-SA 4.0
  - Pattaya: pier skyline, iMahesh, CC BY-SA 4.0
- Keep the existing overlay gradient and the scale(1.04) hover. City gradients stay as the background colour behind the image, as a loading fallback.
- Counts come from the DB (the hardcoded "477+" and "46" are removed). Cities with no clinics show a "Coming soon" chip.
- A credit line under the grid names the author and licence, with a link to each Commons page. CC BY-SA needs attribution, and the site's own pages aren't affected by the share-alike clause beyond the photos themselves.
- `alt` text describes the scene, e.g. "Bangkok BTS skytrain at sunset".

## 6. Testing

There's no test framework yet. Add **vitest** (dev only) with unit tests for:
- `isTopRated` and `effectiveTier`
- search `normalise`, word-prefix matching, typo tolerance, multi-word AND, and the ranking order (Premium before organic within the same match band)

Then run `next build` (static export) and a browser check on localhost covering: search queries (form, asok, ulthera, ultera, implant, dental asok, xyz); homepage cards; the Bangkok city page; the physio category page; Form's profile; a Cosmo branch; a guide with a PremiumBox; /list-your-clinic/. The Pre-Deploy SEO Checklist in CLAUDE.md applies: titles, canonicals and schema unchanged; FAQPage schema validated after the FAQ edits.

## 7. Rollout order

1. Tiers data + `tiers.ts` + `PlanBadges`
2. Category listing + profile + brand hub (what a clinic checks first)
3. Homepage: search, city tiles, featured cards
4. City page
5. Guides `PremiumBox`
6. /list-your-clinic/ + /how-we-rank/ copy
7. Doctors table + section (renders nothing until doctor data arrives)

Each step is a separate commit. Unrelated working-tree changes (`src/app/get-matched/page.tsx`, `src/lib/forms.ts`, `.env.example`) stay out of these commits.

## Open items

- Doctor details for Form, Cosmo and Genesis: Sunny to collect from the clinics. The section is hidden until the data exists.
- The deck PDFs say "Premium partner". The local copies in `docs/sales/` will be updated to "Premium". The PDFs already sent to CLASS CLINIC and Ovio stay as they are.
