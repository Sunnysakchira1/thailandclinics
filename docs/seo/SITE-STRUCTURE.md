# Site Structure — ThailandClinics.com
*Generated: 2026-05-08*

## URL Hierarchy (locked — do not change)

```
/                                           Priority 1.0 — Homepage
├── /bangkok/                               Priority 0.9 — City landing
│   ├── /bangkok/physiotherapy-clinics/     Priority 0.9 — Category listing (PILLAR)
│   │   └── /bangkok/physiotherapy-clinics/[slug]/   Priority 0.8 — Clinic profile
│   ├── /bangkok/dental-clinics/            Priority 0.9
│   ├── /bangkok/cosmetic-clinics/          Priority 0.9
│   └── /bangkok/wellness-clinics/          Priority 0.9
├── /phuket/                                Priority 0.9
├── /chiang-mai/                            Priority 0.9
├── /pattaya/                               Priority 0.9
├── /physiotherapy-clinics/                 Category landing (national)
├── /dental-clinics/                        Category landing (national)
├── /cosmetic-clinics/                      Category landing (national)
├── /wellness-clinics/                      Category landing (national)
├── /blog/                                  Priority 0.7
│   └── /blog/[slug]/                       Priority 0.7
├── /about/
├── /how-we-rank/
├── /list-your-clinic/
├── /privacy/
└── /terms/
```

**Max depth rule:** Never exceed 3 levels from homepage to any indexed page.
**No guides/ URL:** The `/guides/` segment was planned but never built. Pillar content lives on the category listing pages, not separate URLs.

## Pillar Page Model (category listing pages)

The `/[city]/[category]/` pages serve a dual role:
1. **Directory function** — filterable, sortable list of all clinics
2. **Pillar content function** — editorial intro, FAQs, pricing context, related links

Page anatomy (top to bottom):
```
[Breadcrumb]
[H1: Category in City]
[Eyebrow stat: "329 verified clinics"]
──────────────────────
[PILLAR INTRO — 150–200 words, answers query immediately]
[Quick stats bar: avg rating, English-speaking count, price range]
──────────────────────
[Sort bar + filters + clinic list] ← existing ListingsClient
──────────────────────
[FAQ BLOCK — 5 questions, FAQPage schema]
[Related categories + cities internal links]
```

This structure lets Google read pillar content without JS rendering (SSG), while users
get the interactive list they need.

## Internal Linking Map

```
Homepage → 4 city pages, 4 category pages, latest blog post
City page → 4 category pages for that city, top 5 clinics by reviews
Category listing → top 5 clinic profiles, 2 related categories, city page, blog posts
Clinic profile → city page, category page, 3 nearby clinics
Blog post → 2–3 clinic profiles, category page, city page
```

## Schema per Page Type

| Page | Schema Types |
|---|---|
| Homepage | WebSite + SearchAction, Organization |
| City landing | CollectionPage, BreadcrumbList |
| Category listing | ItemList, FAQPage, BreadcrumbList |
| Clinic profile | LocalBusiness + MedicalClinic, AggregateRating, BreadcrumbList |
| Blog post | Article, FAQPage (if has FAQ section), BreadcrumbList |
| About | Organization, AboutPage |

## Page Count Projections

| Stage | Pages |
|---|---|
| Now (Bangkok physio only) | 1 homepage + 329 profiles + 8 listing/landing pages + 5 static = ~343 |
| After Bangkok dental+cosmetic+wellness | +600–800 profiles = ~1,100 |
| After 4-city data import | +2,000–3,000 profiles = ~3,500 |
| After 24 blog posts | +24 = ~3,524 |

At 3,500 pages, the sitemap needs splitting by city to stay under 50,000 URL limit per sitemap file.
