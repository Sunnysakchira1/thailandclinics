import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import { mdxComponents } from "@/components/blog/MdxComponents";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  formatPostDateLong,
  formatPostDate,
  extractFAQs,
} from "@/lib/mdx";

/* ─── Static params ─────────────────────────────────────────────── */
export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

/* ─── Metadata ───────────────────────────────────────────────────── */
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title:       post.title,
    description: post.description,
    alternates:  { canonical: `/blog/${slug}/` },
    openGraph: { title: post.title, description: post.description },
  };
}

/* ─── Category display helpers ───────────────────────────────────── */
const CATEGORY_LABELS: Record<string, string> = {
  physiotherapy: "Physiotherapy",
  dental:        "Dental",
  cosmetic:      "Cosmetic",
  wellness:      "Wellness",
  "expat-guide": "Expat Guide",
};

const CATEGORY_COLORS: Record<string, string> = {
  physiotherapy: "var(--green)",
  dental:        "#2a5c8a",
  cosmetic:      "var(--terracotta)",
  wellness:      "#5c7a3a",
  "expat-guide": "#7a5c2a",
};

const CITY_CATEGORY_PATH: Record<string, string> = {
  physiotherapy: "physiotherapy-clinics",
  dental:        "dental-clinics",
  cosmetic:      "cosmetic-clinics",
  wellness:      "wellness-clinics",
  fertility:     "fertility-clinics",
};

const CITY_LABEL: Record<string, string> = {
  bangkok:    "Bangkok",
  phuket:     "Phuket",
  "chiang-mai": "Chiang Mai",
  pattaya:    "Pattaya",
  thailand:   "Thailand",
};

const STAR = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

/* ─── Page ───────────────────────────────────────────────────────── */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";
  const postUrl    = `${siteUrl}/blog/${slug}/`;
  const related    = getRelatedPosts(post.category, slug);
  const faqs       = extractFAQs(post.content);
  const catLabel   = CATEGORY_LABELS[post.category] ?? post.category;
  const catColor   = CATEGORY_COLORS[post.category] ?? "var(--green)";
  const catPath    = CITY_CATEGORY_PATH[post.category];
  const cityLabel  = CITY_LABEL[post.city] ?? post.city;
  const titleShort = post.title.length > 40 ? post.title.slice(0, 40) + "…" : post.title;

  /* ── Schemas ── */
  const articleSchema = {
    "@context":        "https://schema.org",
    "@type":           "Article",
    headline:          post.title,
    description:       post.description,
    datePublished:     post.publishedAt,
    dateModified:      post.updatedAt,
    url:               postUrl,
    author:    { "@type": "Organization", name: "ThailandClinics", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name:    "ThailandClinics",
      url:     siteUrl,
      logo:    { "@type": "ImageObject", url: `${siteUrl}/icon.svg` },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${siteUrl}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type":          "Question",
      name:             f.question,
      acceptedAnswer:   { "@type": "Answer", text: f.answer },
    })),
  } : null;

  const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  /* ── Compile MDX content (frontmatter already stripped by gray-matter) ── */
  const { content: Content } = await compileMDX({
    source: post.content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return (
    <>
      <StructuredData data={schemas} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ══════════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════════ */}
        <div style={{
          background:   "var(--white)",
          borderBottom: "1px solid var(--border-soft)",
          padding:      "40px 48px 44px",
        }} className="blog-header-pad">
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" style={{
              display:    "flex",
              alignItems: "center",
              gap:        "6px",
              flexWrap:   "wrap",
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "12.5px",
              color:      "var(--muted)",
              marginBottom: "20px",
            }}>
              {[
                { label: "Home",   href: "/" },
                { label: "Blog",   href: "/blog/" },
                { label: titleShort, href: null },
              ].map((crumb, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
                  {crumb.href
                    ? <Link href={crumb.href} style={{ color: "var(--green)", textDecoration: "none" }}>{crumb.label}</Link>
                    : <span style={{ color: "var(--charcoal-soft)" }}>{crumb.label}</span>
                  }
                </span>
              ))}
            </nav>

            {/* Badges row */}
            <div style={{
              display:    "flex",
              alignItems: "center",
              gap:        "12px",
              flexWrap:   "wrap",
              marginBottom: "18px",
            }}>
              <span style={{
                fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize:      "10.5px",
                fontWeight:    600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color:         catColor,
                background:    `${catColor}14`,
                padding:       "3px 10px",
                borderRadius:  "4px",
              }}>
                {catLabel}
              </span>
              <span style={{
                fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize:      "10.5px",
                fontWeight:    500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color:         "var(--muted)",
                border:        "1px solid var(--border)",
                padding:       "3px 10px",
                borderRadius:  "4px",
              }}>
                {post.type}
              </span>
              <span style={{
                fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize:   "12.5px",
                color:      "var(--muted)",
              }}>
                {post.readTime}
              </span>
            </div>

            {/* H1 */}
            <h1 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "clamp(28px, 4vw, 42px)",
              fontWeight:   300,
              color:        "var(--charcoal)",
              lineHeight:   1.1,
              marginBottom: "18px",
              maxWidth:     "800px",
            }}>
              {post.title}
            </h1>

            {/* Meta row */}
            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "13px",
              color:      "var(--muted)",
              margin:     0,
            }}>
              By ThailandClinics · Published {formatPostDateLong(post.publishedAt)}
              {post.updatedAt !== post.publishedAt && ` · Updated ${formatPostDateLong(post.updatedAt)}`}
            </p>

            <hr style={{ border: "none", borderTop: "1px solid var(--border-soft)", margin: "24px 0 0" }} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            BODY — MDX content
        ══════════════════════════════════════════════════════════ */}
        <div style={{ padding: "48px" }} className="blog-content-pad">
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            {Content}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RELATED POSTS
        ══════════════════════════════════════════════════════════ */}
        {related.length > 0 && (
          <div style={{
            background:   "var(--linen-dark)",
            borderTop:    "1px solid var(--border-soft)",
            padding:      "48px",
          }} className="blog-content-pad">
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <h2 style={{
                fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
                fontSize:     "26px",
                fontWeight:   400,
                color:        "var(--charcoal)",
                marginBottom: "24px",
              }}>
                More guides
              </h2>
              <div className="blog-grid">
                {related.map((rel) => {
                  const rColor = CATEGORY_COLORS[rel.category] ?? "var(--green)";
                  return (
                    <Link key={rel.slug} href={`/blog/${rel.slug}/`} className="blog-card" style={{ textDecoration: "none" }}>
                      <div style={{ height: "4px", background: rColor }} />
                      <div style={{ padding: "20px" }}>
                        <p style={{
                          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                          fontSize: "10px", fontWeight: 500,
                          letterSpacing: "0.1em", textTransform: "uppercase",
                          color: "var(--terracotta)", marginBottom: "6px",
                        }}>
                          {CATEGORY_LABELS[rel.category] ?? rel.category}
                        </p>
                        <h3 className="blog-card-title" style={{
                          fontFamily: "var(--font-cormorant,'Cormorant Garamond',serif)",
                          fontSize: "19px", fontWeight: 500,
                          color: "var(--charcoal)", lineHeight: 1.3,
                          marginBottom: "10px",
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {rel.title}
                        </h3>
                        <p style={{
                          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
                          fontSize: "12px", color: "var(--muted)",
                        }}>
                          {rel.readTime} · {formatPostDate(rel.publishedAt)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            CTA BLOCK
        ══════════════════════════════════════════════════════════ */}
        {catPath && post.city !== "thailand" && (
          <div style={{
            background: "var(--green)",
            padding:    "48px",
            textAlign:  "center",
          }} className="blog-content-pad">
            <h2 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "clamp(22px, 3vw, 30px)",
              fontWeight:   400,
              color:        "#fff",
              marginBottom: "20px",
              lineHeight:   1.2,
            }}>
              Browse {catLabel} clinics in {cityLabel}
            </h2>
            <Link
              href={`/${post.city}/${catPath}/`}
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          "8px",
                fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
                fontSize:     "14px",
                fontWeight:   600,
                color:        "var(--green)",
                background:   "#fff",
                padding:      "13px 28px",
                borderRadius: "4px",
                textDecoration: "none",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={STAR} />
              </svg>
              View verified {catLabel} clinics →
            </Link>
          </div>
        )}

      </main>
    </>
  );
}
