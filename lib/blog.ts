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
