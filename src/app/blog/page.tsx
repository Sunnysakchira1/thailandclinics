import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import BlogFilter from "@/components/blog/BlogFilter";
import { getAllPosts } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Thailand Healthcare Guides | ThailandClinics",
  description:
    "Practical guides for expats and medical tourists on healthcare in Bangkok, Phuket and Thailand. Physiotherapy, dental, cosmetic and wellness.",
  alternates: { canonical: "/blog/" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://thailand-clinics.com/" },
    { "@type": "ListItem", position: 2, name: "Guides & Resources", item: "https://thailand-clinics.com/blog/" },
  ],
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <StructuredData data={[breadcrumbSchema]} />
      <Nav />

      <main style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          background:   "var(--white)",
          borderBottom: "1px solid var(--border-soft)",
          padding:      "56px 48px 48px",
        }} className="blog-header-pad">
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <p style={{
              fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:      "11px",
              fontWeight:    600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color:         "var(--terracotta)",
              marginBottom:  "14px",
            }}>
              Guides &amp; Resources
            </p>

            <h1 style={{
              fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
              fontSize:     "clamp(32px, 5vw, 48px)",
              fontWeight:   300,
              color:        "var(--charcoal)",
              lineHeight:   1.1,
              marginBottom: "16px",
            }}>
              Thailand Healthcare Guides
            </h1>

            <p style={{
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:   "16px",
              color:      "var(--charcoal-soft)",
              lineHeight: 1.7,
              maxWidth:   "560px",
              margin:     0,
            }}>
              Practical guides for expats and medical tourists navigating
              healthcare in Thailand.
            </p>

            <Link href="/guides/" style={{
              display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "22px",
              fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "14px", fontWeight: 500,
              color: "var(--green)", background: "var(--green-pale)", border: "1px solid var(--green)",
              borderRadius: "100px", padding: "9px 18px", textDecoration: "none", width: "fit-content",
            }}>
              Or use our interactive clinic-choosing guides →
            </Link>
          </div>
        </div>

        {/* ── Filter + Grid ──────────────────────────────────────── */}
        <div style={{ padding: "48px" }} className="blog-content-pad">
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <BlogFilter posts={posts} />
          </div>
        </div>

      </main>
    </>
  );
}
