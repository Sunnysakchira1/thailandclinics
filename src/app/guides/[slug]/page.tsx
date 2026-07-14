import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import { getGuideCombos, getGuideShortlist, getClinicCount, getCategoryDistricts } from "@/lib/db/queries";
import { GUIDE_CITIES, GUIDE_CATEGORIES, guideSlug, parseGuideSlug, fillGuide } from "@/lib/guides";

export const dynamicParams = false;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";

export async function generateStaticParams() {
  const combos = await getGuideCombos();
  return combos
    .filter((c) => GUIDE_CATEGORIES[c.categorySlug] && GUIDE_CITIES[c.citySlug] && c.count >= 5)
    .map((c) => ({ slug: guideSlug(c.citySlug, c.categorySlug) }));
}

type Props = { params: Promise<{ slug: string }> };

async function resolve(slug: string) {
  const parsed = parseGuideSlug(slug);
  if (!parsed) return null;
  const city = GUIDE_CITIES[parsed.citySlug];
  const cat = GUIDE_CATEGORIES[parsed.categorySlug];
  if (!city || !cat) return null;
  return { city, cat, ...parsed };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await resolve(slug);
  if (!r) return {};
  const title = `How to Choose a ${r.cat.short} Clinic in ${r.city.name} (${new Date().getFullYear()}) | ThailandClinics`;
  const description = `The complete guide to choosing a ${r.cat.noun} in ${r.city.name}: criteria that matter, treatments, real costs, where to find them, red flags and verified top clinics.`.slice(0, 158);
  return { title, description, alternates: { canonical: `/guides/${slug}/` }, openGraph: { title, description } };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const r = await resolve(slug);
  if (!r) notFound();
  const { city, cat } = r;

  const [shortlist, count, combos, districts] = await Promise.all([
    getGuideShortlist(r.citySlug, r.categorySlug, 8),
    getClinicCount(r.citySlug, r.categorySlug),
    getGuideCombos(),
    getCategoryDistricts(r.citySlug, r.categorySlug, 8),
  ]);

  const listingUrl = `/${r.citySlug}/${r.categorySlug}/`;
  const guideUrl = `${siteUrl}/guides/${slug}/`;
  const updated = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const fill = (t: string) => fillGuide(t, city);
  const answer = fill(cat.answer);

  const related = combos
    .filter((co) => co.citySlug === city.slug && co.categorySlug !== cat.slug && GUIDE_CATEGORIES[co.categorySlug] && co.count >= 5)
    .map((co) => ({ label: `How to choose a ${GUIDE_CATEGORIES[co.categorySlug].noun} in ${city.name}`, href: `/guides/${guideSlug(city.slug, co.categorySlug)}/` }));

  // Table of contents — id must match each Section's id
  const toc = [
    { id: "why", label: `Why ${city.name}` },
    { id: "criteria", label: "What to look for" },
    { id: "treatments", label: "Treatments & what to expect" },
    { id: "costs", label: "What it costs" },
    { id: "who", label: "Which patient are you?" },
    ...(districts.length ? [{ id: "areas", label: `Where in ${city.name}` }] : []),
    { id: "process", label: "How to book" },
    { id: "questions", label: "Questions to ask" },
    { id: "redflags", label: "Red flags" },
    { id: "shortlist", label: "Top clinics" },
    { id: "faq", label: "FAQ" },
    ...(cat.sources.length ? [{ id: "sources", label: "Sources" }] : []),
  ];

  const schema = [
    { "@context": "https://schema.org", "@type": "Article",
      headline: `How to Choose a ${cat.short} Clinic in ${city.name}`, description: answer,
      datePublished: "2026-01-01", dateModified: new Date().toISOString().slice(0, 10),
      author: { "@type": "Organization", name: "ThailandClinics" },
      publisher: { "@type": "Organization", name: "ThailandClinics", url: siteUrl },
      mainEntityOfPage: guideUrl },
    { "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: cat.faq.map((f) => ({ "@type": "Question", name: fill(f.q), acceptedAnswer: { "@type": "Answer", text: fill(f.a) } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/guides/` },
        { "@type": "ListItem", position: 3, name: `Choosing a ${cat.short} clinic in ${city.name}`, item: guideUrl },
      ] },
    { "@context": "https://schema.org", "@type": "ItemList", name: `Top ${cat.nounPlural} in ${city.name}`,
      itemListElement: shortlist.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: `${siteUrl}${s.href}` })) },
  ];

  return (
    <>
      <StructuredData data={schema} />
      <Nav />
      <main style={{ backgroundColor: "var(--linen)" }}>
        <article style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 88px" }}>

          <nav style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12.5px", color: "var(--muted)", marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Link href="/" style={crumbLink}>Home</Link><span>›</span>
            <Link href="/guides/" style={crumbLink}>Guides</Link><span>›</span>
            <span style={{ color: "var(--charcoal-soft)" }}>Choosing a {cat.short.toLowerCase()} clinic in {city.name}</span>
          </nav>

          <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--terracotta)", marginBottom: "14px" }}>
            The complete guide · Updated {updated}
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "clamp(32px,5vw,46px)", fontWeight: 400, lineHeight: 1.12, color: "var(--charcoal)", marginBottom: "20px" }}>
            How to choose a {cat.noun} in <em style={{ fontStyle: "italic", color: "var(--green)" }}>{city.name}</em>
          </h1>

          {/* Direct answer — extractable AIO citation block */}
          <div style={{ background: "var(--green-pale)", borderLeft: "3px solid var(--green)", borderRadius: "6px", padding: "20px 24px", marginBottom: "32px" }}>
            <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "16px", lineHeight: 1.7, color: "var(--charcoal)", margin: 0 }}>{answer}</p>
          </div>

          <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", color: "var(--charcoal-soft)", lineHeight: 1.75, marginBottom: "32px" }}>
            {city.tourismLine} This guide covers everything you need to choose a {cat.noun} in {city.name} with confidence — the criteria that matter, treatments and what they involve, what care really costs, where the best clinics are, the questions to ask and the red flags to avoid — plus a shortlist of {count} verified, top-rated clinics.
          </p>

          <Cta href={listingUrl} label={`View verified ${cat.nounPlural} in ${city.name}`} sub={`${count} clinics, ranked and reviewed`} />

          {/* Table of contents */}
          <div style={{ border: "1px solid var(--border-soft)", borderRadius: "6px", background: "var(--white)", padding: "20px 24px", marginBottom: "48px" }}>
            <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "14px" }}>In this guide</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }} className="guide-toc">
              {toc.map((t, i) => (
                <a key={t.id} href={`#${t.id}`} style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", color: "var(--green)", textDecoration: "none" }}>
                  {String(i + 1).padStart(2, "0")}. {t.label}
                </a>
              ))}
            </div>
          </div>

          <Section id="why" title={`Why ${city.name} for ${cat.noun} treatment`}>
            <Para>{fill(cat.whyCity)}</Para>
          </Section>

          <Section id="criteria" title={`What to look for in a ${cat.noun}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {cat.criteria.map((c, i) => (
                <div key={c.title} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: "0 14px" }}>
                  <span style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "22px", color: "var(--green)", lineHeight: 1 }}>{i + 1}</span>
                  <div>
                    <h3 style={h3}>{c.title}</h3>
                    <Para>{fill(c.body)}</Para>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="treatments" title="Treatments and what to expect">
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {cat.treatments.map((t) => (
                <div key={t.name}>
                  <h3 style={h3}>{t.name}</h3>
                  <Para>{fill(t.body)}</Para>
                </div>
              ))}
            </div>
          </Section>

          <Section id="costs" title={`What ${cat.noun} treatment costs in ${city.name}`}>
            <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", background: "var(--white)", marginBottom: "14px" }}>
              <div className="price-table-row" style={{ background: "var(--linen)", borderBottom: "1px solid var(--border)" }}>
                <span style={priceHead}>Treatment</span><span style={{ ...priceHead, color: "var(--green)", fontWeight: 600 }}>Thailand</span><span style={priceHead}>UK / US / AU</span>
              </div>
              {cat.costs.map((row, i) => (
                <div key={row.label} className="price-table-row" style={{ borderBottom: i < cat.costs.length - 1 ? "1px solid var(--border-soft)" : "none" }}>
                  <span style={priceCell}>{row.label}</span>
                  <span style={{ ...priceCell, color: "var(--green)", fontWeight: 600 }}>{row.th}</span>
                  <span style={{ ...priceCell, color: "var(--muted)" }}>{row.west}</span>
                </div>
              ))}
            </div>
            <Para>{fill(cat.costsNote)}</Para>
          </Section>

          <Cta href={listingUrl} label={`Compare ${cat.nounPlural} in ${city.name} by price & rating`} sub="Filter by English-speaking, BTS/MRT access and more" />

          <Section id="who" title="Which type of patient are you?">
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {cat.audiences.map((a) => (
                <div key={a.who}>
                  <h3 style={h3}>{a.who}</h3>
                  <Para>{fill(a.body)}</Para>
                </div>
              ))}
            </div>
          </Section>

          {districts.length > 0 && (
            <Section id="areas" title={`Where to find ${cat.nounPlural} in ${city.name}`}>
              <Para>{cat.nounPlural[0].toUpperCase() + cat.nounPlural.slice(1)} in {city.name} cluster in a handful of areas — useful if you want one near your accommodation or a specific {city.transit}. These districts have the most verified clinics:</Para>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
                {districts.map((d) => (
                  <span key={d.district} style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--charcoal)", background: "var(--white)", border: "1px solid var(--border-soft)", borderRadius: "100px", padding: "6px 14px" }}>
                    {d.district} <span style={{ color: "var(--muted)" }}>· {d.count}</span>
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section id="process" title="How to book and what to expect">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {cat.process.map((p, i) => (
                <div key={p.step} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: "0 14px", alignItems: "start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--green)", color: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", fontWeight: 600 }}>{i + 1}</div>
                  <div style={{ paddingTop: "4px" }}><h3 style={h3}>{p.step}</h3><Para>{fill(p.body)}</Para></div>
                </div>
              ))}
            </div>
          </Section>

          <Section id="questions" title="Questions to ask before you commit">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {cat.questions.map((q) => (
                <div key={q} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: "0 12px", alignItems: "start" }}>
                  <span style={{ color: "var(--green)", fontWeight: 600, paddingTop: "1px" }}>?</span>
                  <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", color: "var(--charcoal)", lineHeight: 1.6 }}>{fill(q)}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="redflags" title="Red flags to avoid">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {cat.redFlags.map((f) => (
                <div key={f} style={{ display: "grid", gridTemplateColumns: "18px 1fr", gap: "0 12px", alignItems: "start" }}>
                  <span style={{ color: "var(--terracotta)", fontWeight: 700, paddingTop: "1px" }}>!</span>
                  <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", color: "var(--charcoal)", lineHeight: 1.6 }}>{fill(f)}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section id="shortlist" title={`Verified top ${cat.nounPlural} in ${city.name}`}>
            <Para>Ranked by a review-weighted score across {count} verified clinics — each checked against its public record.</Para>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "18px" }}>
              {shortlist.map((s, i) => (
                <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
                  <div style={{ border: "1px solid var(--border-soft)", borderRadius: "6px", background: "var(--white)", padding: "16px 18px", display: "grid", gridTemplateColumns: "28px 1fr auto", gap: "0 14px", alignItems: "center" }} className="guide-clinic-row">
                    <span style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "20px", color: "var(--muted)" }}>{i + 1}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "19px", fontWeight: 500, color: "var(--charcoal)", lineHeight: 1.2 }}>
                        {s.name}{s.isBrand && s.branchCount ? <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "11px", color: "var(--green)", marginLeft: "8px", verticalAlign: "middle" }}>{s.branchCount} locations</span> : null}
                      </div>
                      {s.snippet ? <div style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--muted)", lineHeight: 1.5, marginTop: "3px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>{s.snippet}</div> : (s.district ? <div style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "13px", color: "var(--muted)", marginTop: "3px" }}>{s.district}</div> : null)}
                    </div>
                    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      {s.googleRating != null && <div style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", fontWeight: 600, color: "var(--charcoal)" }}>{s.googleRating.toFixed(1)}★</div>}
                      {s.googleReviewsCount != null && <div style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "11.5px", color: "var(--muted)" }}>{s.googleReviewsCount.toLocaleString()} reviews</div>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href={listingUrl} style={{ display: "inline-block", marginTop: "20px", fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", fontWeight: 500, color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)", paddingBottom: "2px" }}>
              See all {count} {cat.nounPlural} in {city.name} →
            </Link>
          </Section>

          <Section id="faq" title={`${cat.short} clinics in ${city.name} — frequently asked questions`}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {cat.faq.map((f) => (
                <details key={f.q} style={{ borderBottom: "1px solid var(--border-soft)" }} className="faq-item">
                  <summary style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 500, color: "var(--charcoal)", padding: "18px 0", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                    {fill(f.q)}<span className="faq-chevron" style={{ flexShrink: 0, color: "var(--muted)", fontSize: "18px", lineHeight: 1, userSelect: "none" }} />
                  </summary>
                  <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", lineHeight: 1.7, color: "var(--charcoal-soft)", paddingBottom: "18px", margin: 0 }}>{fill(f.a)}</p>
                </details>
              ))}
            </div>
          </Section>

          {cat.sources.length > 0 && (
            <Section id="sources" title="Sources & further reading">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {cat.sources.map((s) => (
                  <div key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", fontWeight: 500, color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)" }}>
                      {s.label} ↗
                    </a>
                    <span style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", color: "var(--charcoal-soft)" }}>{" — "}{s.note}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Closing CTA */}
          <Cta href={listingUrl} label={`View all ${count} ${cat.nounPlural} in ${city.name}`} sub="Verified, ranked by review-weighted score, updated regularly" />

          {related.length > 0 && (
            <Section id="related" title="Related guides">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {related.map((rg) => (
                  <Link key={rg.href} href={rg.href} style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", color: "var(--green)", textDecoration: "none" }}>{rg.label} →</Link>
                ))}
              </div>
            </Section>
          )}

        </article>
      </main>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: "48px", scrollMarginTop: "80px" }}>
      <h2 style={{ fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)", fontSize: "28px", fontWeight: 400, color: "var(--charcoal)", lineHeight: 1.2, marginBottom: "20px" }}>{title}</h2>
      {children}
    </section>
  );
}
function Para({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15px", color: "var(--charcoal-soft)", lineHeight: 1.75, margin: 0 }}>{children}</p>;
}
function Cta({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <div style={{ textAlign: "center", margin: "8px 0 48px" }}>
      <Link href={href} className="guide-cta" style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: "var(--green)", color: "var(--white)", borderRadius: "100px",
        padding: "14px 30px", textDecoration: "none",
        fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14.5px", fontWeight: 600, letterSpacing: "0.01em",
      }}>
        {label} <span aria-hidden style={{ fontSize: "15px" }}>→</span>
      </Link>
      {sub && <div style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12.5px", color: "var(--muted)", marginTop: "10px" }}>{sub}</div>}
    </div>
  );
}

const crumbLink: React.CSSProperties = { color: "var(--muted)", textDecoration: "none" };
const h3: React.CSSProperties = { fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "15.5px", fontWeight: 600, color: "var(--charcoal)", margin: "0 0 4px" };
const priceHead: React.CSSProperties = { fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" };
const priceCell: React.CSSProperties = { fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", color: "var(--charcoal)" };
