# Indexation rules

Last reviewed: 2026-09-26. Owner: whoever changes routing, metadata or the sitemap.

The site is a static export (`output: "export"`) on Cloudflare Pages. Every URL
that can be indexed exists as a built `index.html`. No server-side route turns
query strings into new pages, so faceted indexation risk is structurally low.
The rules below keep it that way.

## 1. URL format

| Rule | Enforced by |
|---|---|
| One format: lowercase, trailing slash (`/bangkok/physiotherapy-clinics/`) | `trailingSlash: true` in `next.config.ts` |
| Slashless form 308s to the slash form | Cloudflare Pages (verified live 2026-09-26) |
| `/index.html` forms 308 to the clean URL | Cloudflare Pages |
| `http://` and `www.` 301 to `https://thailand-clinics.com/` | Cloudflare (verified live 2026-09-26) |
| Canonical, internal links, schema `url`/`item`, sitemap all use the slash form | Build scan: 0 violations across 890 pages, 2026-09-26 |
| `*.pages.dev` mirrors send `X-Robots-Tag: noindex` | `public/_headers` |
| Renamed slugs 301 in both slash and slashless source forms | `public/_redirects` |

Never change an indexed slug without adding both forms to `_redirects`.

## 2. What is indexable

A page is indexable only if it is an **intentionally created landing page**:

| Page type | Indexable when |
|---|---|
| Homepage, static pages (about, how-we-rank, privacy, terms, list-your-clinic, browse) | Always |
| Category landing (`/physiotherapy-clinics/`) | Always |
| City hub (`/bangkok/`) | City lists ≥ `MIN_INDEXABLE_CLINICS` (3) clinics |
| City + category listing (`/bangkok/dental-clinics/`) | Combo lists ≥ 3 clinics |
| Clinic profile, brand hub, branch profile | Always (a DB row exists) |
| Blog post, guide | Always (a file or config entry exists) |
| `/brand-guidelines/` | Never (internal) |

Below the threshold, a listing stays live as `noindex, follow`, so nav links keep
working and link equity still flows through. It flips back to indexable on the
next build once inventory is imported. No code change is needed. Logic: `src/lib/indexation.ts`.

On 2026-09-26 that put 15 pages on noindex: all Chiang Mai and Pattaya pages
(0 clinics each), plus Phuket cosmetic, dental and fertility. None of them had a
click in the previous 90 days of GSC data.

## 3. Parameters, filters, sorting, search

- Filters and sorting on listing pages are client-side state. They never write to the URL.
- Any `?query` URL (e.g. from outbound tracking or external links) serves the
  same static file, and its canonical points at the clean URL.
- There is no search results page. The homepage WebSite schema has no
  SearchAction, because one would point at a 404.
- No pagination. Listings render in full.
- **Do not** add `Disallow: /*?` to robots.txt. Google would then be unable to
  see the canonical on parameter URLs.

If a future feature puts state in the URL (e.g. `?district=asok`), it must either
stay canonicalised to the parent or be built as a real static landing page that
passes the demand/inventory/SERP gate in the 90-day plan. Never both.

## 4. Sitemap

`scripts/build-sitemap.mjs` runs as `postbuild`. It reads the built HTML and lists
only pages with a self-referencing canonical and no noindex. Whatever the page
metadata decides is therefore what the sitemap says. There is no separate exclude
list to drift out of date.

Segments: `sitemap-core.xml` (home, city hubs, category landings, static),
`sitemap-listings.xml` (city+category), `sitemap-clinics.xml` (profiles, brand
hubs, branches), `sitemap-editorial.xml` (blog, guides). Add `sitemap-treatments.xml`
when treatment pages ship.

`lastmod` comes from real content dates only:
- clinics: `updated_at` / `review_summary_updated_at`
- listings: the max over the clinics they list
- editorial: Article `dateModified`

Pages with no real date get no lastmod. Guide copy dates come from
`GUIDES_UPDATED_AT` in `src/lib/guides.ts`. Bump it when you edit guide copy.

## 5. Not ours

`thailandclinics.co` (the old domain) currently serves a separate WordPress site
("Find Clinics in Thailand Near You") with its own self-canonical. It does not
redirect here. See the open item in the session report.
