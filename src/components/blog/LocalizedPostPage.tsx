import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Nav from "@/components/layout/Nav";
import StructuredData from "@/components/seo/StructuredData";
import LanguageSwitcher from "@/components/blog/LanguageSwitcher";
import { mdxComponents } from "@/components/blog/MdxComponents";
import { Figure, InShort } from "@/components/blog/Figures";
import PremiumBox from "@/components/blog/PremiumBox";
import { extractFAQs } from "@/lib/mdx";
import { getLocalizedPosts, getLocalizedPost, getHreflangAlternates, formatLocalDate, UI, HREFLANG, RTL_LANGS, type Lang } from "@/lib/mdxI18n";

/** Listing page a post funnels to: /<city>/<category>-clinics/. Country-wide posts ("thailand") go to Bangkok. */
const MONEY_CATEGORIES = ["fertility", "physiotherapy", "cosmetic", "dental", "wellness"];
const CITY_NAMES: Record<string, string> = { bangkok: "Bangkok", phuket: "Phuket" };
function moneyPage(category: string, city: string): { href: string; cityName: string } | null {
  if (!MONEY_CATEGORIES.includes(category)) return null;
  const c = CITY_NAMES[city] ? city : "bangkok";
  return { href: `/${c}/${category}-clinics/`, cityName: CITY_NAMES[c] };
}
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
      alternates: { canonical: `/${lang}/blog/${slug}/`, languages: getHreflangAlternates(post.enSlug) },
      openGraph: { title: post.title, description: post.description, locale: lang },
    };
  }

  async function Page({ params }: Props) {
    const { slug } = await params;
    const post = getLocalizedPost(lang, slug);
    if (!post) notFound();
    const t = UI[lang];
    const dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com";
    const url = `${siteUrl}/${lang}/blog/${slug}/`;
    const money = moneyPage(post.category, post.city);
    const components = {
      ...mdxComponents,
      Figure: (p: { name: string }) => <Figure {...p} lang={lang} />,
      InShort: (p: { children: React.ReactNode }) => <InShort {...p} lang={lang} />,
      PremiumBox: (p: { slug: string; children: React.ReactNode }) => <PremiumBox {...p} lang={lang} />,
    };
    const faqs = extractFAQs(post.content);

    const schemas: Record<string, unknown>[] = [
      { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description, inLanguage: HREFLANG[lang],
        datePublished: post.publishedAt, dateModified: post.updatedAt, url,
        author: { "@type": "Organization", name: "ThailandClinics", url: `${siteUrl}/` },
        publisher: { "@type": "Organization", name: "ThailandClinics", url: `${siteUrl}/`, logo: { "@type": "ImageObject", url: `${siteUrl}/icon.svg` } } },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: t.home, item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: t.blog, item: `${siteUrl}/blog/` },
        { "@type": "ListItem", position: 3, name: post.title, item: url } ] },
      ...(faqs.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", inLanguage: HREFLANG[lang],
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }] : []),
    ];

    const { content: Content } = await compileMDX({ source: post.content, components, options: { mdxOptions: { remarkPlugins: [remarkGfm] } } });

    return (
      <>
        {/* Root layout hard-codes <html lang="en">. scripts/set-html-lang.mjs fixes the built HTML
            at postbuild; this covers `next dev` and client-side navigation. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(HREFLANG[lang])};document.documentElement.dir=${JSON.stringify(dir)}` }} />
        <StructuredData data={schemas} />
        <Nav />
        <main lang={HREFLANG[lang]} dir={dir} style={{ backgroundColor: "var(--linen)", minHeight: "100vh" }}>
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
              <LanguageSwitcher enSlug={post.enSlug} current={lang} label={t.language} />
            </div>
          </div>
          <div style={{ padding: "48px" }} className="blog-content-pad">
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              {Content}
              {money && (
                <div style={{ marginTop: "40px", padding: "22px 24px", background: "var(--green-pale)", border: "1px solid var(--border-soft)", borderRadius: "8px" }}>
                  <Link href={money.href} style={{ fontFamily: SANS, fontSize: "14px", fontWeight: 500, color: "var(--green)", textDecoration: "none", borderBottom: "1px solid var(--green)", paddingBottom: "2px" }}>
                    {t.browse(t.cats[post.category] ?? post.category, money.cityName)}
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
