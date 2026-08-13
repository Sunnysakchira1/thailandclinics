# Paid featured listings — design

**Date:** 2026-08-13
**Status:** Approved for planning
**Reference:** lymphaticdrainagefinder.com (`/pricing`, city pages)

---

## Why

ThailandClinics has 804 clinics, ~36,000 monthly impressions and ~330 monthly
organic clicks (GSC, 30 days to 2026-08-09). Impressions have grown roughly 30×
since mid-May. The directory has no revenue model. This adds one.

The reference site sells three tiers of paid placement per city. We are adapting
that model, at prices matched to our actual traffic rather than theirs.

### The constraint that shapes everything

**Our clicks land on clinic profile pages, not on listing pages.** The top pages
by clicks are individual profiles reached through branded searches; the best
listing page is `/phuket/physiotherapy-clinics` at 8 clicks/month. The reference
site sells "top of your city page," which on our site is currently worth very
little.

Consequences:

- Prices are founding-tier and locked, not market-rate. A clinic paying ฿3,800
  for a handful of visits churns in two months and tells other clinics.
- The offer leads with what a slot *becomes*, backed by honest current numbers.
- Renewal depends on being able to report referrals per clinic. Instrumentation
  is a v1 requirement, not a nice-to-have.

---

## What is sold

Two tiers, both founding-priced and **locked for 12 months from purchase**.

### Founding Featured — ฿1,490/month, ฿14,900/year

Five slots per **city + category** (not per city — our URLs are city × category,
so Bangkok physiotherapy and Bangkok cosmetic are separate inventory).

- Featured badge on the listing card
- Placement in a labelled block above the organic list
- Highlighted card treatment
- Custom photo the clinic provides
- Extended description, up to 300 words
- Instagram and Facebook links
- Direct dofollow link to their website
- No commission

### Spotlight — ฿3,900/month, ฿39,000/year

One slot per city + category, **in addition to** the five Featured slots — a
city+category can hold 1 Spotlight and 5 Featured, six paid clinics in total.
Everything in Featured, plus:

- Clinic logo on their listing
- Cover image, 1200×400
- Hero box at the top of their city+category listing page
- Homepage rotation

Annual is priced at ten months, i.e. two months free, matching the reference
site's convention.

---

## Honesty guardrails

Non-negotiable. This is a YMYL healthcare directory whose entire product is
independence, and it already ranks an agency client first in three editorial
guides.

1. **Paid placement never reorders the organic list.** Featured and Spotlight
   clinics appear in a labelled block *above* the organic list. The organic list
   remains ordered purely by the existing rating-based algorithm. No paid signal
   enters it.
2. **Every paid placement is visibly labelled** — "Featured" or "Spotlight" — on
   every card, on every page, including the homepage rotation.
3. **`/how-we-rank/` gains one paragraph** stating that featured placements are
   paid, labelled, and do not affect organic order. The page already promises
   this; it must remain true.
4. **Paid placement never enters editorial.** The ranked guides
   (`best-botox-clinics-bangkok`, `best-dermal-filler-clinics-bangkok`,
   `best-ulthera-prime-clinics-bangkok`, and any future ones) must not consider
   tier. Editorial rankings are not purchasable. This is the line that keeps the
   existing client-at-#1 situation defensible rather than sold.
5. **The `/for-clinics/` page states current traffic honestly** — real clicks and
   impressions, not vanity figures. Under-promising is what makes renewals
   possible.

---

## Data model

### Migration required

`clinics.featured` and `clinics.featured_position` already exist.
`featured_position` is retained for ordering. `featured` becomes **deprecated**:
`tier` is the single source of truth, and no code reads `featured` after this
change. It is left in place rather than dropped, to avoid a destructive
migration.

New columns on `clinics`:

| Column | Type | Notes |
|---|---|---|
| `tier` | text, default `'free'` | `'free'` \| `'featured'` \| `'spotlight'` |
| `tier_expires_at` | text, nullable | ISO date `YYYY-MM-DD` |
| `custom_photo_url` | text, nullable | Path under `/clinic-assets/` |
| `extended_about` | text, nullable | Max 300 words; `set-tier.ts` rejects longer input |
| `logo_url` | text, nullable | Spotlight only |
| `cover_image_url` | text, nullable | Spotlight only, 1200×400 |
| `instagram_url` | text, nullable | |
| `facebook_url` | text, nullable | |

Derived in the query layer, not stored:

```
isPaid      = tier !== 'free' && (tier_expires_at === null || tier_expires_at >= today)
isSpotlight = isPaid && tier === 'spotlight'
```

Expiry is evaluated at **build time**, since the site is a static export. A
lapsed clinic drops to organic on the next deploy, not the instant it expires.
This is acceptable and must be stated in the runbook.

### Asset storage

Follows the existing pattern of `public/clinic-photos/<id>.jpg` (804 files
committed today). Clinic-supplied assets go to `public/clinic-assets/`:

- `<id>-photo.jpg`
- `<id>-logo.png`
- `<id>-cover.jpg`

Committed to the repo and served by Cloudflare's CDN. No object storage, no
upload flow — Sunny receives assets by email and commits them.

---

## Pages and components

### New

| Item | Type | Purpose |
|---|---|---|
| `/for-clinics/` | Page | The offer. Not `/pricing/` — on a clinic directory that reads as treatment pricing |
| `OwnerCta` | Server component | Card at the foot of each city+category listing page |
| `FeaturedBar` | Client component | Dismissible sticky bar, dismissal stored in `localStorage` |
| `SpotlightHero` | Server component | Hero box above the listing on a city+category page |
| `scripts/set-tier.ts` | Script | Assign a tier by slug, with slot-limit checks |

`/for-clinics/` contains: the offer, honest current traffic figures, both tier
cards with monthly and annual pricing, current slot availability per
city+category, the enquiry form, the "this does not buy you a ranking" block,
and a short FAQ.

### Modified

| File | Change |
|---|---|
| `src/components/clinic/ListingsClient.tsx` | Read `tier` instead of `featured`; paid block above organic; richer card for paid tiers (photo, description, socials, logo) |
| `src/app/[city]/[category]/page.tsx` | Render `SpotlightHero` and `OwnerCta` |
| `src/app/page.tsx` | Homepage Spotlight rotation slot; footer "For clinics" link |
| `src/components/layout/Nav.tsx` | Plain "For clinics" text link. **Not** a third pill — the nav already carries two CTAs |
| `src/app/how-we-rank/page.tsx` | Disclosure paragraph |
| `src/app/list-your-clinic/page.tsx` | Replace `mailto:` with the Formspree endpoint, closing an open item from March |
| `src/lib/db/schema.ts`, `queries.ts` | New columns, derived `isPaid` / `isSpotlight` |

---

## Homepage rotation under static export

`next.config.js` sets `output: "export"`. There is no server, so rotation cannot
happen per request.

**Approach:** at build time, select Spotlight clinics ordered by
`(dayOfYear + clinicId) % spotlightCount`, giving a deterministic ordering that
changes between deploys. The site rebuilds on every content push and at least
weekly in practice.

Sold as **"homepage rotation, refreshed with each site update"** — accurate, and
it does not promise per-visitor rotation we cannot deliver.

---

## Enquiry and fulfilment

No Stripe in v1. Thai clinics commonly pay B2B by bank transfer or PromptPay,
and a manual step lets Sunny vet who appears on the directory.

**Form:** Formspree (or Web3Forms), posting from the static page. Fields: clinic
name, city, category, contact name, email, phone, website, tier of interest.
Also fixes `/list-your-clinic/`.

**Runbook** (`docs/runbooks/featured-listings.md`, written as part of this work):

1. Enquiry arrives by email.
2. Check slot availability for that city + category.
3. Confirm, invoice by bank transfer or PromptPay.
4. On payment, collect assets by email and commit them to `public/clinic-assets/`.
5. Run `scripts/set-tier.ts --slug <slug> --tier featured --expires YYYY-MM-DD`.
6. Deploy. Confirm live to the clinic.
7. Log the sale in the tracking sheet.

`set-tier.ts` refuses to exceed 5 Featured or 1 Spotlight per city+category, so
the inventory promise cannot be broken by hand.

---

## Renewal instrumentation

Outbound clinic website links already carry UTM tracking (commit `307206f`).
This work must **verify that outbound clicks are attributable to an individual
clinic**, and if they are not, make them so.

Without it there is no answer to "what did I get for ฿14,900," which makes both
renewal and any future price rise unarguable. This is a v1 requirement.

---

## Out of scope

Stripe and self-serve checkout. A Front Page tier. Code-enforced expiry at
runtime (build-time only). A clinic-facing portal or self-serve asset upload.
Automated invoicing or dunning. Any change to how organic rankings are computed.

---

## Success criteria

1. A clinic owner can find the offer from any listing page and submit an enquiry
   that reaches Sunny's inbox.
2. Setting a tier via `scripts/set-tier.ts` and deploying puts that clinic in a
   labelled paid block above the organic list, with its supplied assets.
3. Slot limits cannot be exceeded through the script.
4. The organic list order is byte-identical to today's for any clinic with
   `tier = 'free'`.
5. Every paid placement is labelled on every surface it appears.
6. Outbound clicks are attributable per clinic.
7. `/list-your-clinic/` no longer depends on `mailto:`.
