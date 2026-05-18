# Search Bar — Design Spec
**Date:** 2026-05-18
**Status:** Approved for implementation

---

## Goal

Wire up the currently decorative search bar on the homepage so users can type a keyword, select a city, and navigate to the correct listing page.

---

## Approach

**Client component + router.push**

Extract the search bar into `src/components/hero/SearchBar.tsx` as a `'use client'` component. On submit, match the text input against a static keyword map to find the closest category, then `router.push('/[city]/[category]/')`. No match → navigate to `/[city]/`.

No server round-trip. No DB query. Instant client-side navigation.

---

## File Changes

- **Create:** `src/components/hero/SearchBar.tsx` — `'use client'` component with all search logic
- **Modify:** `src/app/page.tsx` — replace decorative search bar JSX with `<SearchBar />`

---

## Component API

```tsx
// No props needed — self-contained
export default function SearchBar() { ... }
```

The component owns:
- Text input state
- City select state (default: "bangkok")
- Form submit handler
- Keyword map (static const)

---

## Keyword Map

Static const inside the component file. Keys are category slugs, values are arrays of lowercase match strings.

```ts
const KEYWORD_MAP: Record<string, string[]> = {
  'physiotherapy-clinics': [
    'physio', 'therapy', 'rehab', 'sport', 'injury',
    'back', 'pain', 'shoulder', 'knee', 'spine', 'massage',
  ],
  'dental-clinics': [
    'dental', 'dentist', 'teeth', 'tooth', 'brace',
    'orthodont', 'implant', 'whitening',
  ],
  'cosmetic-clinics': [
    'cosmetic', 'botox', 'filler', 'laser', 'skin',
    'beauty', 'aesthetic', 'face', 'lip',
  ],
  'wellness-clinics': [
    'wellness', 'yoga', 'spa', 'meditation',
    'mental', 'stress', 'holistic',
  ],
}
```

---

## Match Logic

```
function findCategory(query: string): string | null {
  const lower = query.toLowerCase()
  for (const [slug, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) return slug
  }
  return null
}
```

- Iterate KEYWORD_MAP in insertion order (physio first → most common use case wins on ambiguous input)
- `String.includes` match — partial word match (e.g. "physiotherapist" hits "physio")
- First match wins — no scoring

---

## Navigation Logic

```
const category = findCategory(query)
if (category) {
  router.push(`/${city}/${category}/`)
} else {
  router.push(`/${city}/`)
}
```

- Empty query → do nothing (no navigation)
- All routes have trailing slash (canonical URL format)

---

## City Options

Same options as the current decorative select:

| Value | Label |
|---|---|
| `bangkok` | Bangkok |
| `chiang-mai` | Chiang Mai |
| `phuket` | Phuket |
| `pattaya` | Pattaya |
| `koh-samui` | Koh Samui |

Default: `bangkok`

---

## HTML Structure

Preserve the existing search bar markup and classes exactly — only convert to controlled inputs.

```tsx
<form onSubmit={handleSubmit} className="hero-search-bar">
  <input
    type="text"
    value={query}
    onChange={e => setQuery(e.target.value)}
    placeholder="Physiotherapy, dental, wellness…"
    autoComplete="off"
    className="hero-search-input"
  />
  <select
    value={city}
    onChange={e => setCity(e.target.value)}
    className="hero-search-city"
  >
    <option value="bangkok">Bangkok</option>
    <option value="chiang-mai">Chiang Mai</option>
    <option value="phuket">Phuket</option>
    <option value="pattaya">Pattaya</option>
    <option value="koh-samui">Koh Samui</option>
  </select>
  <button type="submit" className="search-btn">Search</button>
</form>
```

Use `<form>` with `onSubmit` so Enter key also triggers search — no separate `onClick` on the button.

---

## page.tsx Change

Replace the entire decorative search bar block:
```tsx
// BEFORE — decorative div block with static input/select/button
<div className="hero-search-bar">
  <input type="text" placeholder="..." autoComplete="off" />
  <select defaultValue="bangkok">...</select>
  <button className="search-btn">Search</button>
</div>
```

With:
```tsx
// AFTER — single import, single component
<SearchBar />
```

The `SearchBar` component renders the identical HTML structure with `<form>` wrapping and controlled state. No CSS changes needed — existing `.hero-search-bar`, `.search-btn` classes carry over.

---

## Out of Scope

- Autocomplete / typeahead suggestions
- Search results page
- Analytics / tracking on search events
- Fuzzy scoring (first-match-wins is sufficient)
- Koh Samui city pages (link present but city page may not exist yet — navigation will 404 gracefully)
