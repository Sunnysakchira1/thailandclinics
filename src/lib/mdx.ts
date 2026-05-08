import fs   from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

/* ─── Types ──────────────────────────────────────────────────────── */
export type PostCategory = "physiotherapy" | "dental" | "cosmetic" | "wellness" | "expat-guide";
export type PostCity     = "bangkok" | "phuket" | "chiang-mai" | "pattaya" | "thailand";
export type PostType     = "pillar" | "cluster" | "best-of" | "guide";

export type PostFrontmatter = {
  title:       string;
  description: string;
  publishedAt: string;
  updatedAt:   string;
  category:    PostCategory;
  city:        PostCity;
  type:        PostType;
  featured:    boolean;
};

export type PostMeta = PostFrontmatter & {
  slug:     string;
  readTime: string;
};

export type Post = PostMeta & {
  content: string;
};

/* ─── Helpers ────────────────────────────────────────────────────── */
export function calculateReadTime(content: string): string {
  const words   = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function formatPostDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatPostDateLong(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** Extract FAQ Q&A pairs from raw MDX content for FAQPage schema */
export function extractFAQs(content: string): { question: string; answer: string }[] {
  // Look for an ## FAQ or ## Frequently Asked Questions heading
  const faqMatch = content.match(/##\s+(?:FAQ|Frequently Asked Questions)([\s\S]*?)(?=\n##\s|\n---|\n#\s|$)/i);
  if (!faqMatch) return [];

  const faqBlock = faqMatch[1];
  const faqs: { question: string; answer: string }[] = [];

  // Match ### Question followed by answer text
  const qaPairs = faqBlock.matchAll(/###\s+(.+)\n+([\s\S]+?)(?=\n###|\n##|$)/g);
  for (const match of qaPairs) {
    const question = match[1].trim();
    const answer   = match[2].trim().replace(/\*\*/g, "").replace(/\n+/g, " ").slice(0, 500);
    if (question && answer) faqs.push({ question, answer });
  }
  return faqs;
}

/* ─── Queries ────────────────────────────────────────────────────── */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw  = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        ...(data as PostFrontmatter),
        slug,
        readTime: calculateReadTime(content),
      };
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    ...(data as PostFrontmatter),
    slug,
    content,
    readTime: calculateReadTime(content),
  };
}

export function getRelatedPosts(category: string, currentSlug: string): PostMeta[] {
  return getAllPosts()
    .filter((p) => p.category === category && p.slug !== currentSlug)
    .slice(0, 3);
}
