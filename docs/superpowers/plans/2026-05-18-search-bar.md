# Search Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the decorative homepage search bar so submitting navigates to `/[city]/[category]/` (or `/[city]/` when no category matches).

**Architecture:** Extract the search bar from the server component `src/app/page.tsx` into a `'use client'` component `src/components/hero/SearchBar.tsx`. The component owns all state, the keyword→category map, and calls `useRouter().push()` on submit. No new DB queries, no API calls, no new CSS classes — it reuses the existing inline styles verbatim.

**Tech Stack:** Next.js 15 App Router, `'use client'`, `useRouter` from `next/navigation`, TypeScript, React controlled inputs.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/components/hero/SearchBar.tsx` | **Create** | Client component — state, keyword map, navigation |
| `src/app/page.tsx` | **Modify** (lines 201–280) | Replace decorative div block with `<SearchBar />` |

---

### Task 1: Create `SearchBar.tsx` client component

**Files:**
- Create: `src/components/hero/SearchBar.tsx`

The component replicates the existing search bar markup (preserving all inline styles verbatim) but wraps it in a `<form>` and uses controlled inputs.

- [ ] **Step 1: Create the file**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

function findCategory(query: string): string | null {
  const lower = query.toLowerCase()
  for (const [slug, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) return slug
  }
  return null
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('bangkok')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const category = findCategory(query)
    if (category) {
      router.push(`/${city}/${category}/`)
    } else {
      router.push(`/${city}/`)
    }
  }

  return (
    <div
      className="animate-fade-up delay-300"
      style={{
        display:      'flex',
        alignItems:   'center',
        maxWidth:     '620px',
        margin:       '0 auto',
        border:       '1px solid var(--border)',
        borderRadius: '6px',
        background:   'var(--white)',
        overflow:     'hidden',
        boxShadow:    '0 2px 24px rgba(26,71,49,0.06)',
        opacity:      0,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'contents' }}
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Physiotherapy, dental, wellness…"
          autoComplete="off"
          style={{
            flex:       1,
            padding:    '0 20px',
            height:     '54px',
            border:     'none',
            outline:    'none',
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:   '15px',
            color:      'var(--charcoal)',
            background: 'transparent',
            minWidth:   0,
          }}
        />
        <div style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          style={{
            padding:            '0 32px 0 16px',
            height:             '54px',
            border:             'none',
            outline:            'none',
            fontFamily:         "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:           '15px',
            color:              'var(--charcoal-soft)',
            background:         'transparent',
            cursor:             'pointer',
            appearance:         'none',
            WebkitAppearance:   'none',
            backgroundImage:    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8278' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat:   'no-repeat',
            backgroundPosition: 'right 12px center',
            flexShrink:         0,
          }}
        >
          <option value="bangkok">Bangkok</option>
          <option value="chiang-mai">Chiang Mai</option>
          <option value="phuket">Phuket</option>
          <option value="pattaya">Pattaya</option>
          <option value="koh-samui">Koh Samui</option>
        </select>
        <button
          type="submit"
          className="search-btn"
          style={{
            height:        '54px',
            padding:       '0 28px',
            background:    'var(--green)',
            color:         'var(--white)',
            border:        'none',
            fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:      '14px',
            fontWeight:    500,
            letterSpacing: '0.04em',
            cursor:        'pointer',
            flexShrink:    0,
            transition:    'background 0.2s',
          }}
        >
          Search
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors. If you see "display: 'contents' is not assignable", change the `form` style type to `style={{ display: 'contents' as const }}`.

- [ ] **Step 3: Commit**

```bash
git add src/components/hero/SearchBar.tsx
git commit -m "feat: add SearchBar client component with keyword-to-category routing"
```

---

### Task 2: Wire SearchBar into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

Replace the decorative search bar block (the `<div className="animate-fade-up delay-300">` wrapper that contains the static input/select/button) with the new `<SearchBar />` component.

- [ ] **Step 1: Add the import at the top of page.tsx**

Find the existing import block (top of file, after `'use server'` / imports). Add:

```tsx
import SearchBar from '@/components/hero/SearchBar'
```

- [ ] **Step 2: Replace the decorative block**

Find this block in page.tsx (starts at the `{/* Search bar */}` comment, ends at the closing `</div>` on the line after `Search</button>`):

```tsx
            {/* Search bar */}
            <div
              className="animate-fade-up delay-300"
              style={{
                display:      "flex",
                alignItems:   "center",
                maxWidth:     "620px",
                margin:       "0 auto",
                border:       "1px solid var(--border)",
                borderRadius: "6px",
                background:   "var(--white)",
                overflow:     "hidden",
                boxShadow:    "0 2px 24px rgba(26,71,49,0.06)",
                opacity:      0,
              }}
            >
              <input
                type="text"
                placeholder="Physiotherapy, dental, wellness…"
                autoComplete="off"
                style={{
                  flex:       1,
                  padding:    "0 20px",
                  height:     "54px",
                  border:     "none",
                  outline:    "none",
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:   "15px",
                  color:      "var(--charcoal)",
                  background: "transparent",
                  minWidth:   0,
                }}
              />
              <div style={{ width: "1px", height: "28px", background: "var(--border)", flexShrink: 0 }} />
              <select
                defaultValue="bangkok"
                style={{
                  padding:            "0 32px 0 16px",
                  height:             "54px",
                  border:             "none",
                  outline:            "none",
                  fontFamily:         "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:           "15px",
                  color:              "var(--charcoal-soft)",
                  background:         "transparent",
                  cursor:             "pointer",
                  appearance:         "none",
                  WebkitAppearance:   "none",
                  backgroundImage:    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8278' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat:   "no-repeat",
                  backgroundPosition: "right 12px center",
                  flexShrink:         0,
                }}
              >
                <option value="bangkok">Bangkok</option>
                <option value="chiang-mai">Chiang Mai</option>
                <option value="phuket">Phuket</option>
                <option value="pattaya">Pattaya</option>
                <option value="koh-samui">Koh Samui</option>
              </select>
              <button
                className="search-btn"
                style={{
                  height:        "54px",
                  padding:       "0 28px",
                  background:    "var(--green)",
                  color:         "var(--white)",
                  border:        "none",
                  fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:      "14px",
                  fontWeight:    500,
                  letterSpacing: "0.04em",
                  cursor:        "pointer",
                  flexShrink:    0,
                  transition:    "background 0.2s",
                }}
              >
                Search
              </button>
            </div>
```

Replace the entire block above with:

```tsx
            {/* Search bar */}
            <SearchBar />
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Build completes with no errors. Confirm `src/app/page.tsx` is still a server component (no `'use client'` at top) — the `SearchBar` import does not require the parent to be a client component.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev`
Open: `http://localhost:3000`

Test cases:
1. Type "physiotherapy" → select "Bangkok" → click Search → should navigate to `/bangkok/physiotherapy-clinics/`
2. Type "dental" → select "Phuket" → click Search → should navigate to `/phuket/dental-clinics/`
3. Type "botox" → select "Bangkok" → click Search → should navigate to `/bangkok/cosmetic-clinics/`
4. Type "yoga" → select "Chiang Mai" → click Search → should navigate to `/chiang-mai/wellness-clinics/`
5. Type "hospital" (no match) → select "Bangkok" → click Search → should navigate to `/bangkok/`
6. Leave input empty → click Search → should NOT navigate (stays on homepage)
7. Press Enter in the input → should trigger navigation same as clicking Search

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire SearchBar into homepage, replace decorative inputs"
```

---

## Self-Review

**Spec coverage:**
- ✅ `'use client'` component extracted to `src/components/hero/SearchBar.tsx`
- ✅ `useRouter().push()` navigation
- ✅ Keyword map — all 4 categories with correct keywords
- ✅ No match → `/[city]/`
- ✅ Empty query → no navigation
- ✅ City select with all 5 options, default "bangkok"
- ✅ Enter key triggers submit via `<form onSubmit>`
- ✅ Existing inline styles preserved verbatim
- ✅ Trailing slashes on all navigation URLs

**Placeholder scan:** None found.

**Type consistency:** `findCategory` returns `string | null` — used correctly in Task 1 Step 1.
