import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { extractFAQs } from "@/lib/mdx";
import { getLocalizedPosts, getLocalizedPost, getAlternates, formatLocalDate, UI, type Lang } from "@/lib/mdxI18n";

const MONEY: Record<string, string> = { fertility: "/bangkok/fertility-clinics/", physiotherapy: "/bangkok/physiotherapy-clinics/" };
const SANS = "var(--font-dm-sans,'DM Sans',sans-serif)";
const SERIF = "var(--font-cormorant,'Cormorant Garamond',serif)";
type Props = { params: Promise<{ slug: string }> };

/** Factory used by src/app/<lang>/blog/[slug]/page.tsx so all five languages share one template. */
export function makeLocalizedPostPage(lang: Lang) {
  async function generateStaticParams() {
    return getLocalizedPosts(lang).map((p) => ({ slug: p.slug }));
  }

  async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getLocalizedPost(lang, slug);
    if (!post) return {};
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `/${lang}/blog/${slug}/`, languages: getAlternates(post.enSlug) },
      openGraph: { title: post.title, description: post.description, locale: lang },
    };
  }

  async function Page({ params }: Props) {
    const { slug } = await params;
    const post = getLocalizedPost(lang, slug);
    if (!post) notFound();
    const t = UI[lang];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";
    const url = `${siteUrl}/${lang}/blog/${slug}/`;
    const money = MONEY[post.category];
    const faqs = extractFAQs(post.content);

    const schemas: Record<string, unknown>[] = [
      { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, inLanguage: lang,
        datePublished: post.publishedAt, dateModified: post.updatedAt, url,
        author: { "@type": "Organization", name: "ThailandClinics", url: `${siteUrl}/` },
        publisher: { "@type": "Organization", name: "ThailandClinics", url: `${siteUrl}/`, logo: { "@type": "ImageObject", url: `${siteUrl}/icon.svg` } } },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: t.home, item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: t.blog, item: `${siteUrl}/blog/` },
        { "@type": "ListItem", position: 3, name: post.title, item: url } ] },
      ...(faqs.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", inLanguage: lang,
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }] : []),
    ];

    const { content: Content } = await compileMDX({ source: post.content, components: mdxComponents, options: { mdxOptions: { remarkPlugins: [remarkGfm] } } });

    return (
      <>
        {/* Root layout hard-codes <html lang="en">; set the real language before paint. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(lang)}` }} />
        <StructuredData data={schemas} />
        <Nav />
        <main lang={lang} style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>
          <div style={{ background: "var(--white)", borderBottom: "1px solid var(--border-soft)", padding: "40px 48px 44px" }} className="blog-header-pad">
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontFamily: SANS, fontSize: "12.5px", color: "var(--muted)", marginBottom: "20px" }}>
                <Link href="/" style={{ color: "var(--green)", textDecoration: "none" }}>{t.home}</Link><span style={{ opacity: 0.4 }}>›</span>
                <Link href="/blog/" style={{ color: "var(--green)", textDecoration: "none" }}>{t.blog}</Link><span style={{ opacity: 0.4 }}>›</span>
                <span style={{ color: "var(--charcoal-soft)" }}>{post.title.length > 40 ? post.title.slice(0, 40) + "…" : post.title}</span>
              </nav>
              <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, color: "var(--charcoal)", lineHeight: 1.1, marginBottom: "18px" }}>{post.title}</h1>
              <p style={{ fontFamily: SANS, fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                {t.by} · {t.updated} {formatLocalDate(lang, post.updatedAt)} · <Link href={`/blog/${post.enSlug}/`} hrefLang="en" style={{ color: "var(--green)" }}>{t.readIn}</Link>
              </p>
            </div>
          </div>
          <div style={{ padding: "48px" }} className="blog-content-pad">
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              {Content}
              {money && (
                <div style={{ marginTop: "40px", padding: "22px 24px", background: "var(--green-pale)", border: "1px solid var(--border-soft)", borderRadius: "8px" }}>
                  <Link href={money} style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 500, color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)", paddingBottom: "2px" }}>
                    {t.browse(t.cats[post.category] ?? post.category)}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
