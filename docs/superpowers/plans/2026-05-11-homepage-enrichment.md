# Homepage Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 new sections to the homepage (Why Thailand, How It Works, Blog Posts, Editorial, FAQ) and update the Browse by City H2 — making the homepage substantive for "thailand clinics" SEO targeting.

**Architecture:** All new sections are added directly to `src/app/page.tsx` following the existing inline-section pattern. Blog post data is read at build time from MDX frontmatter via a new `lib/blog.ts` utility. FAQPage schema is appended to the existing StructuredData array. No new DB queries.

**Tech Stack:** Next.js 15 App Router (SSG), TypeScript, Tailwind CSS (via CSS variables), gray-matter (new), existing CSS variable design system.

---

## File Map

| Action | File | Purpose |
|---|---|---|
| Install | `package.json` | Add gray-matter dependency |
| Create | `lib/blog.ts` | Read + parse MDX frontmatter at build time |
| Modify | `src/app/page.tsx` | All section additions + H2 update + FAQ schema |

---

## Task 1: Install gray-matter

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install**

```bash
npm install gray-matter
```

Expected output: `added 1 package` (or similar — gray-matter has no peer deps).

- [ ] **Step 2: Verify TypeScript types are available**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: no errors (gray-matter ships its own types).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add gray-matter for MDX frontmatter parsing"
```

---

## Task 2: Create blog utility

**Files:**
- Create: `lib/blog.ts`

- [ ] **Step 1: Create `lib/blog.ts`**

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  category: string;
  city?: string;
}

export function getBlogPosts(limit?: number): BlogPost[] {
  const blogDir = path.join(process.cwd(), "content/blog");

  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename): BlogPost => {
    const slug = filename.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(blogDir, filename), "utf-8");
    const { data } = matter(raw);
    return {
      slug,
      title:       data.title       ?? "",
      description: data.description ?? "",
      publishedAt: data.publishedAt ?? "",
      category:    data.category    ?? "",
      city:        data.city,
    };
  });

  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return limit ? posts.slice(0, limit) : posts;
}
```

- [ ] **Step 2: Verify it type-checks**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/blog.ts
git commit -m "feat: blog utility — read MDX frontmatter at build time"
```

---

## Task 3: Update Browse by City H2

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Find the H2 in the Browse by City section**

It is in the "SECTION 5 — BROWSE BY CITY" block, inside the `section-header` div. Current text:

```tsx
Find clinics <em style={{ fontStyle: "italic", color: "var(--green)" }}>near you</em>
```

- [ ] **Step 2: Replace the H2 text**

Replace the full `<h2>` element (keep all style props, only change the text):

```tsx
<h2 style={{
  fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
  fontSize:   "36px",
  fontWeight: 400,
  color:      "var(--charcoal)",
  lineHeight: 1.15,
}}>
  Choose your <em style={{ fontStyle: "italic", color: "var(--green)" }}>destination</em>
</h2>
```

- [ ] **Step 3: Build to verify**

```bash
npm run build 2>&1 | tail -10
```

Expected: build completes with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "fix: differentiate Browse by City H2 — 'Choose your destination'"
```

---

## Task 4: Add "Why Thailand?" section

**Files:**
- Modify: `src/app/page.tsx`

This section goes immediately after the closing `</section>` tag of "SECTION 5 — BROWSE BY CITY" and before "SECTION 6 — TRUST STRIP".

- [ ] **Step 1: Add the PRICE_ROWS constant near the top of the file** (after CITY_TILES):

```tsx
const PRICE_ROWS = [
  { treatment: "Physiotherapy session", th: "$25–40",  uk: "$80–120",   us: "$100–150" },
  { treatment: "Dental cleaning",       th: "$30–50",  uk: "$100–200",  us: "$150–300" },
  { treatment: "GP consultation",       th: "$20–35",  uk: "$60–120",   us: "$150–300" },
];

const WHY_STATS = [
  { value: "70%",   label: "Lower cost vs. UK & US" },
  { value: "500K+", label: "Medical tourists per year" },
  { value: "63",    label: "JCI-accredited hospitals" },
  { value: "4.8★",  label: "Average clinic rating" },
];
```

- [ ] **Step 2: Insert the "Why Thailand?" section JSX** after the Browse by City closing `</section>` and before the Trust Strip `<section>`:

```tsx
{/* ══════════════════════════════════════════════════════
    SECTION — WHY THAILAND?
══════════════════════════════════════════════════════ */}
<section>
  {/* Stats row — dark green */}
  <div style={{ background: "var(--green)" }}>
    <div className="r-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <p style={{
        fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize:      "11px",
        fontWeight:    500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color:         "rgba(255,255,255,0.5)",
        marginBottom:  "24px",
      }}>
        Why patients choose Thailand
      </p>
      <h2 style={{
        fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
        fontSize:     "36px",
        fontWeight:   400,
        color:        "var(--white)",
        lineHeight:   1.15,
        marginBottom: "40px",
      }}>
        Why patients choose{" "}
        <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.75)" }}>Thailand</em>
      </h2>
      <div className="why-stats-grid">
        {WHY_STATS.map(({ value, label }) => (
          <div key={label}>
            <div style={{
              fontFamily:    "var(--font-cormorant, 'Cormorant Garamond', serif)",
              fontSize:      "clamp(36px, 5vw, 52px)",
              fontWeight:    300,
              color:         "var(--white)",
              lineHeight:    1,
              marginBottom:  "8px",
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize:   "13px",
              color:      "rgba(255,255,255,0.6)",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Price table — linen dark */}
  <div style={{
    background:  "var(--linen-dark)",
    borderBottom: "1px solid var(--border-soft)",
  }}>
    <div className="r-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <p style={{
        fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize:      "11px",
        fontWeight:    500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color:         "var(--muted)",
        marginBottom:  "20px",
      }}>
        Typical treatment costs
      </p>
      <div style={{
        border:       "1px solid var(--border)",
        borderRadius: "6px",
        overflow:     "hidden",
        background:   "var(--white)",
        marginBottom: "20px",
      }}>
        {/* Table header */}
        <div className="price-table-row" style={{
          background:    "var(--linen)",
          borderBottom:  "1px solid var(--border)",
        }}>
          <span style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Treatment</span>
          <span style={{ color: "var(--green)", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Thailand</span>
          <span style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>UK</span>
          <span style={{ color: "var(--muted)", fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>USA</span>
        </div>
        {/* Table rows */}
        {PRICE_ROWS.map(({ treatment, th, uk, us }, i) => (
          <div
            key={treatment}
            className="price-table-row"
            style={{ borderBottom: i < PRICE_ROWS.length - 1 ? "1px solid var(--border-soft)" : "none" }}
          >
            <span style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "14px", color: "var(--charcoal)" }}>{treatment}</span>
            <span style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "14px", color: "var(--green)", fontWeight: 600 }}>{th}</span>
            <span style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "14px", color: "var(--muted)" }}>{uk}</span>
            <span style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "14px", color: "var(--muted)" }}>{us}</span>
          </div>
        ))}
      </div>
      <p style={{
        fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize:   "11.5px",
        color:      "var(--muted)",
        marginBottom: "4px",
      }}>
        Estimates based on 2025 private clinic pricing. Actual costs vary by clinic and treatment.{" "}
        <Link href="/how-we-rank/" style={{ color: "var(--green)", textDecoration: "none" }}>
          How we verify listings →
        </Link>
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add CSS for the why-stats-grid and price-table-row to `globals.css`**

Open `src/app/globals.css` and append at the end:

```css
/* Why Thailand section */
.why-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}
@media (max-width: 640px) {
  .why-stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

.price-table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 14px 20px;
  align-items: center;
}
@media (max-width: 480px) {
  .price-table-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 8px;
    padding: 12px 14px;
    font-size: 13px;
  }
}
```

- [ ] **Step 4: Build to verify**

```bash
npm run build 2>&1 | tail -10
```

Expected: build completes with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: add 'Why Thailand?' stats + price comparison section to homepage"
```

---

## Task 5: Add "How it works" section

**Files:**
- Modify: `src/app/page.tsx`

This section goes immediately after the closing `</section>` of "Why Thailand?" and before the Trust Strip.

- [ ] **Step 1: Add the HOW_IT_WORKS constant** after the WHY_STATS constant:

```tsx
const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Browse",
    desc:  "Filter by city, specialty, English-speaking staff, or BTS/MRT access.",
  },
  {
    step: 2,
    title: "Compare",
    desc:  "Read verified ratings, opening hours, and patient review summaries.",
  },
  {
    step: 3,
    title: "Contact directly",
    desc:  "Call or visit — no booking fees, no middlemen.",
  },
];
```

- [ ] **Step 2: Insert the "How it works" section JSX** after the Why Thailand closing `</section>`:

```tsx
{/* ══════════════════════════════════════════════════════
    SECTION — HOW IT WORKS
══════════════════════════════════════════════════════ */}
<section style={{
  background:  "var(--white)",
  borderTop:   "1px solid var(--border-soft)",
  borderBottom: "1px solid var(--border-soft)",
}}>
  <div className="r-section" style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
    <p style={{
      fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
      fontSize:      "11px",
      fontWeight:    500,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color:         "var(--muted)",
      marginBottom:  "16px",
    }}>
      How it works
    </p>
    <h2 style={{
      fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
      fontSize:     "36px",
      fontWeight:   400,
      color:        "var(--charcoal)",
      lineHeight:   1.15,
      marginBottom: "48px",
    }}>
      Find the right clinic in{" "}
      <em style={{ fontStyle: "italic", color: "var(--green)" }}>minutes</em>
    </h2>

    <div className="how-it-works-grid">
      {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
        <div key={step} className="how-it-works-step">
          {/* Connector line (hidden for last item) */}
          {i < HOW_IT_WORKS.length - 1 && (
            <div className="how-it-works-connector" />
          )}
          <div style={{
            width:          "44px",
            height:         "44px",
            borderRadius:   "50%",
            background:     "var(--green)",
            color:          "var(--white)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontFamily:     "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:       "15px",
            fontWeight:     500,
            margin:         "0 auto 16px",
            position:       "relative",
            zIndex:         1,
          }}>
            {step}
          </div>
          <div style={{
            fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
            fontSize:     "20px",
            fontWeight:   500,
            color:        "var(--charcoal)",
            marginBottom: "8px",
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:   "14px",
            color:      "var(--muted)",
            lineHeight: 1.6,
            maxWidth:   "220px",
            margin:     "0 auto",
          }}>
            {desc}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add CSS for the how-it-works layout to `globals.css`**

Append after the price table CSS added in Task 4:

```css
/* How it works section */
.how-it-works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  position: relative;
}
.how-it-works-step {
  position: relative;
  text-align: center;
  padding: 0 24px;
}
.how-it-works-connector {
  position: absolute;
  top: 22px;
  left: calc(50% + 22px);
  right: calc(-50% + 22px);
  height: 1px;
  background: var(--border);
  z-index: 0;
}
@media (max-width: 640px) {
  .how-it-works-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .how-it-works-connector {
    display: none;
  }
}
```

- [ ] **Step 4: Build to verify**

```bash
npm run build 2>&1 | tail -10
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: add 'How it works' 3-step section to homepage"
```

---

## Task 6: Add Blog Posts section

**Files:**
- Modify: `src/app/page.tsx`

This section goes immediately after "How it works" and before the Trust Strip.

- [ ] **Step 1: Import getBlogPosts at the top of `src/app/page.tsx`**

Add this import after the existing imports:

```tsx
import { getBlogPosts } from "@/lib/blog";
```

- [ ] **Step 2: Call getBlogPosts in the page component**

Inside `HomePage()`, after the existing `Promise.all` call, add:

```tsx
const blogPosts = getBlogPosts(3);
```

So the top of the component body looks like:

```tsx
export default async function HomePage() {
  const [physioCount, topClinics] = await Promise.all([
    getClinicCount("bangkok", "physiotherapy-clinics"),
    getTopClinicsByReviews("bangkok", "physiotherapy-clinics", 3),
  ]);
  const blogPosts = getBlogPosts(3);
  // ...
```

- [ ] **Step 3: Insert the Blog Posts section JSX** after the "How it works" closing `</section>`, only if `blogPosts.length > 0`:

```tsx
{/* ══════════════════════════════════════════════════════
    SECTION — BLOG POSTS
══════════════════════════════════════════════════════ */}
{blogPosts.length > 0 && (
  <section style={{
    background:  "var(--linen-dark)",
    borderTop:   "1px solid var(--border-soft)",
    borderBottom: "1px solid var(--border-soft)",
  }}>
    <div className="r-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div className="section-header" style={{ marginBottom: "36px" }}>
        <div>
          <p style={eyebrowStyle}>From the guide</p>
          <h2 style={{
            fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
            fontSize:   "36px",
            fontWeight: 400,
            color:      "var(--charcoal)",
            lineHeight: 1.15,
          }}>
            Guides for expats &amp;{" "}
            <em style={{ fontStyle: "italic", color: "var(--green)" }}>medical tourists</em>
          </h2>
        </div>
        <Link href="/blog/" style={sectionLinkStyle} className="section-link">
          View all guides →
        </Link>
      </div>

      <div className="blog-grid">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}/`}
            style={{ textDecoration: "none", display: "block" }}
          >
            <article style={{
              background:   "var(--white)",
              border:       "1px solid var(--border-soft)",
              borderRadius: "6px",
              padding:      "28px 28px 24px",
              height:       "100%",
              display:      "flex",
              flexDirection: "column",
              cursor:       "pointer",
              transition:   "box-shadow 0.2s, transform 0.2s",
            }}
            className="blog-card"
            >
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                {post.category && (
                  <span style={{
                    fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    fontSize:      "10.5px",
                    fontWeight:    500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color:         "var(--terracotta)",
                  }}>
                    {post.category}
                  </span>
                )}
                {post.city && (
                  <>
                    <span style={{ color: "var(--border)", fontSize: "10.5px" }}>·</span>
                    <span style={{
                      fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
                      fontSize:      "10.5px",
                      fontWeight:    500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color:         "var(--muted)",
                    }}>
                      {post.city}
                    </span>
                  </>
                )}
              </div>

              <h3 style={{
                fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
                fontSize:     "21px",
                fontWeight:   500,
                color:        "var(--charcoal)",
                lineHeight:   1.3,
                marginBottom: "10px",
                flex:         1,
              }}>
                {post.title}
              </h3>

              <p style={{
                fontFamily:  "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:    "13.5px",
                color:       "var(--muted)",
                lineHeight:  1.6,
                marginBottom: "16px",
                display:     "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow:    "hidden",
              }}>
                {post.description}
              </p>

              <div style={{
                marginTop:  "auto",
                paddingTop: "14px",
                borderTop:  "1px solid var(--border-soft)",
                display:    "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize:   "12px",
                color:      "var(--muted)",
              }}>
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                    : ""}
                </span>
                <span style={{ color: "var(--green)", fontWeight: 500 }}>Read →</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 4: Add CSS for blog grid and card hover to `globals.css`**

Append after the "How it works" CSS:

```css
/* Blog posts section */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 900px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 540px) {
  .blog-grid {
    grid-template-columns: 1fr;
  }
}
.blog-card:hover {
  box-shadow: 0 12px 32px rgba(26,26,26,0.08);
  transform: translateY(-2px);
}
```

- [ ] **Step 5: Build to verify**

```bash
npm run build 2>&1 | tail -10
```

Expected: no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/globals.css lib/blog.ts
git commit -m "feat: add blog posts section to homepage — reads MDX frontmatter at build time"
```

---

## Task 7: Add Editorial / About block

**Files:**
- Modify: `src/app/page.tsx`

This section goes after the Blog Posts section and before the Trust Strip.

- [ ] **Step 1: Insert the Editorial section JSX** after the Blog Posts closing `)}` and before the Trust Strip `<section>`:

```tsx
{/* ══════════════════════════════════════════════════════
    SECTION — EDITORIAL / ABOUT
══════════════════════════════════════════════════════ */}
<section style={{
  background: "var(--linen)",
  borderTop:  "1px solid var(--border-soft)",
}}>
  <div className="r-section" style={{ maxWidth: "720px", margin: "0 auto" }}>
    <h2 style={{
      fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
      fontSize:     "36px",
      fontWeight:   400,
      color:        "var(--charcoal)",
      lineHeight:   1.2,
      marginBottom: "28px",
    }}>
      Thailand&rsquo;s most trusted clinic directory
    </h2>

    <div style={{
      fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
      fontSize:   "15.5px",
      lineHeight: 1.75,
      color:      "var(--charcoal-soft)",
      display:    "flex",
      flexDirection: "column",
      gap:        "20px",
    }}>
      <p>
        ThailandClinics is an independent directory of verified physiotherapy, dental,
        cosmetic and wellness clinics across Bangkok, Chiang Mai, Phuket and Pattaya.
        Every listing is checked against Google data, cross-referenced for accuracy, and
        updated regularly — so the information you read reflects real opening hours, real
        ratings, and real contact details.
      </p>
      <p>
        We built this for the people who need it most: expats navigating a new healthcare
        system, medical tourists planning treatment around a trip, and English-speaking
        locals who want to compare options before committing. We flag English-speaking
        clinics, BTS and MRT proximity, and weekend availability — the details that matter
        when you&rsquo;re new to a city.
      </p>
      <p>
        ThailandClinics earns nothing from bookings or referrals. Clinics cannot pay for
        placement — rankings are based entirely on Google ratings, review volume, and our
        own verification checks. You contact clinics directly. We just make it easier to
        find the right one.
      </p>
    </div>

    <div style={{
      display:   "flex",
      gap:       "24px",
      marginTop: "28px",
      flexWrap:  "wrap",
    }}>
      <Link href="/how-we-rank/" style={{
        fontFamily:     "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize:       "13.5px",
        color:          "var(--green)",
        textDecoration: "none",
        fontWeight:     500,
        borderBottom:   "1px solid var(--green)",
        paddingBottom:  "2px",
      }}>
        How we rank clinics →
      </Link>
      <Link href="/about/" style={{
        fontFamily:     "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize:       "13.5px",
        color:          "var(--green)",
        textDecoration: "none",
        fontWeight:     500,
        borderBottom:   "1px solid var(--green)",
        paddingBottom:  "2px",
      }}>
        About ThailandClinics →
      </Link>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -10
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add editorial / about block to homepage for E-E-A-T"
```

---

## Task 8: Add FAQ section + FAQPage schema

**Files:**
- Modify: `src/app/page.tsx`

This section goes after the Editorial block and before the Trust Strip. The FAQPage schema is appended to the existing `StructuredData` call.

- [ ] **Step 1: Add the FAQ_ITEMS constant** near the top of the file, after HOW_IT_WORKS:

```tsx
const FAQ_ITEMS = [
  {
    q: "Are clinics in Thailand affordable?",
    a: "Yes. Physiotherapy sessions typically run $25–40 and dental cleanings $30–50 — 60–75% less than UK or US private rates. See the cost comparison above for a full breakdown by treatment type.",
  },
  {
    q: "Do Bangkok clinics have English-speaking staff?",
    a: "Many do. On any listing page, use the English-speaking filter to see only clinics that have confirmed English-speaking staff — flagged through our verification process.",
  },
  {
    q: "How do I find a physiotherapy clinic near a BTS station?",
    a: "Use the 'Near BTS' filter on the Bangkok physiotherapy listing page. Every clinic with confirmed BTS or MRT proximity is flagged in our directory.",
  },
  {
    q: "How does ThailandClinics verify listings?",
    a: "We cross-reference clinic data with Google Maps, check for operational status, verify contact details, and review English-language patient reviews. See our full ranking methodology for details.",
  },
  {
    q: "Can I book appointments through ThailandClinics?",
    a: "No. ThailandClinics is a discovery platform, not a booking service. Contact clinics directly by phone or through their website — you'll find those details on every clinic profile page.",
  },
  {
    q: "Which Thai cities are covered?",
    a: "Bangkok is fully indexed with 330+ clinics. Chiang Mai, Phuket, Pattaya and Koh Samui are being added in 2026.",
  },
  {
    q: "Is Thailand good for medical tourism?",
    a: "Thailand receives over 500,000 medical tourists annually and has 63 JCI-accredited hospitals — the international gold standard for quality. For most elective and specialist treatments, quality is high and wait times are short compared to Western countries.",
  },
];
```

- [ ] **Step 2: Add the faqSchema constant** after the existing `websiteSchema` constant:

```tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type":    "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name:    q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};
```

- [ ] **Step 3: Update the StructuredData call** to include faqSchema:

Find:
```tsx
<StructuredData data={[websiteSchema]} />
```

Replace with:
```tsx
<StructuredData data={[websiteSchema, faqSchema]} />
```

- [ ] **Step 4: Insert the FAQ section JSX** after the Editorial closing `</section>` and before the Trust Strip `<section>`:

```tsx
{/* ══════════════════════════════════════════════════════
    SECTION — FAQ
══════════════════════════════════════════════════════ */}
<section style={{
  background: "var(--white)",
  borderTop:  "1px solid var(--border-soft)",
}}>
  <div className="r-section" style={{ maxWidth: "800px", margin: "0 auto" }}>
    <p style={eyebrowStyle}>FAQ</p>
    <h2 style={{
      fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
      fontSize:     "36px",
      fontWeight:   400,
      color:        "var(--charcoal)",
      lineHeight:   1.15,
      marginBottom: "36px",
    }}>
      Common questions about{" "}
      <em style={{ fontStyle: "italic", color: "var(--green)" }}>Thailand clinics</em>
    </h2>

    <div style={{ display: "flex", flexDirection: "column" }}>
      {FAQ_ITEMS.map(({ q, a }) => (
        <details
          key={q}
          style={{ borderBottom: "1px solid var(--border-soft)" }}
          className="faq-item"
        >
          <summary style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:   "15px",
            fontWeight: 500,
            color:      "var(--charcoal)",
            padding:    "18px 0",
            cursor:     "pointer",
            listStyle:  "none",
            display:    "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap:        "16px",
          }}>
            {q}
            <span className="faq-chevron" style={{
              flexShrink:  0,
              color:       "var(--muted)",
              fontSize:    "18px",
              lineHeight:  1,
              userSelect:  "none",
            }}>
              +
            </span>
          </summary>
          <p style={{
            fontFamily:   "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:     "14px",
            lineHeight:   1.7,
            color:        "var(--charcoal-soft)",
            paddingBottom: "18px",
            margin:       0,
          }}>
            {a}
          </p>
        </details>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Add FAQ CSS to `globals.css`**

Append after the blog grid CSS:

```css
/* FAQ section */
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item[open] .faq-chevron::before { content: "−"; }
.faq-item:not([open]) .faq-chevron::before { content: "+"; }
.faq-item .faq-chevron { font-size: 20px; }
```

- [ ] **Step 6: Full build + verify**

```bash
npm run build 2>&1 | tail -15
```

Expected: build completes, no TypeScript errors, sitemap generates.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: add FAQ section with FAQPage schema to homepage"
```

---

## Self-Review

**Spec coverage check:**
- ✅ H2 updated to "Choose your destination" — Task 3
- ✅ Why Thailand? — dark green stats row + price table — Task 4
- ✅ How it works — numbered horizontal 3-step with connector line — Task 5
- ✅ Blog posts — reads MDX frontmatter, graceful if 0 posts, 3-col grid — Task 6
- ✅ Editorial / About — 3 paragraphs, 720px centred, two inline links — Task 7
- ✅ FAQ — 7 Q&As, `<details>` accordion, FAQPage schema appended — Task 8
- ✅ gray-matter install — Task 1
- ✅ Mobile responsive CSS for all new sections — Tasks 4, 5, 6, 8

**Placeholder scan:** No TBDs, TODOs, or vague steps found.

**Type consistency:**
- `BlogPost` interface defined in Task 2, used in Task 6 — consistent
- `getBlogPosts` defined in Task 2, imported in Task 6 — consistent
- `faqSchema` defined in Task 8, referenced in same task — consistent
- `FAQ_ITEMS`, `WHY_STATS`, `PRICE_ROWS`, `HOW_IT_WORKS` all defined before use
