"use client";
import { useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/mdx";

const CATEGORIES = [
  { label: "All",           value: "all" },
  { label: "Physiotherapy", value: "physiotherapy" },
  { label: "Dental",        value: "dental" },
  { label: "Cosmetic",      value: "cosmetic" },
  { label: "Wellness",      value: "wellness" },
  { label: "Fertility",     value: "fertility" },
  { label: "Expat Guide",   value: "expat-guide" },
];

const CATEGORY_COLORS: Record<string, string> = {
  physiotherapy: "var(--green)",
  dental:        "#2a5c8a",
  cosmetic:      "var(--terracotta)",
  wellness:      "#5c7a3a",
  fertility:     "#8a5c7a",
  "expat-guide": "#7a5c2a",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function PostCard({ post }: { post: PostMeta }) {
  const accent = CATEGORY_COLORS[post.category] ?? "var(--green)";
  const catLabel = CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category;

  return (
    <Link href={`/blog/${post.slug}/`} className="blog-card" style={{ textDecoration: "none" }}>
      {/* Top accent band */}
      <div style={{ height: "4px", background: accent }} />

      {/* Body */}
      <div style={{ padding: "24px" }}>
        <p style={{
          fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
          fontSize:      "10.5px",
          fontWeight:    500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color:         "var(--terracotta)",
          marginBottom:  "8px",
        }}>
          {catLabel}
        </p>

        <h2 className="blog-card-title" style={{
          fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
          fontSize:     "21px",
          fontWeight:   500,
          color:        "var(--charcoal)",
          lineHeight:   1.3,
          marginBottom: "10px",
          display:      "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow:     "hidden",
        }}>
          {post.title}
        </h2>

        <p style={{
          fontFamily:      "var(--font-dm-sans,'DM Sans',sans-serif)",
          fontSize:        "13.5px",
          color:           "var(--muted)",
          lineHeight:      1.6,
          marginBottom:    "16px",
          display:         "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow:        "hidden",
        }}>
          {post.description}
        </p>
      </div>

      {/* Footer */}
      <div style={{
        borderTop:    "1px solid var(--border-soft)",
        padding:      "12px 24px",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
          fontSize:   "12px",
          color:      "var(--muted)",
        }}>
          {post.readTime}
        </span>
        <span style={{
          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
          fontSize:   "12px",
          color:      "var(--muted)",
        }}>
          {formatDate(post.publishedAt)}
        </span>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background:   "var(--white)",
      border:       "1px solid var(--border-soft)",
      borderRadius: "8px",
      overflow:     "hidden",
    }}>
      <div style={{ height: "4px", background: "var(--border-soft)" }} />
      <div style={{ padding: "24px" }}>
        <div style={{ height: "11px", width: "80px", background: "var(--linen-dark)", borderRadius: "4px", marginBottom: "12px" }} />
        <div style={{ height: "20px", background: "var(--linen-dark)", borderRadius: "4px", marginBottom: "8px" }} />
        <div style={{ height: "20px", width: "70%", background: "var(--linen-dark)", borderRadius: "4px", marginBottom: "16px" }} />
        <div style={{ height: "14px", background: "var(--linen-dark)", borderRadius: "4px", marginBottom: "6px" }} />
        <div style={{ height: "14px", background: "var(--linen-dark)", borderRadius: "4px", marginBottom: "6px" }} />
        <div style={{ height: "14px", width: "60%", background: "var(--linen-dark)", borderRadius: "4px" }} />
      </div>
      <div style={{
        borderTop: "1px solid var(--border-soft)", padding: "12px 24px",
        display: "flex", justifyContent: "space-between",
      }}>
        <div style={{ height: "12px", width: "60px", background: "var(--linen-dark)", borderRadius: "4px" }} />
        <div style={{ height: "12px", width: "60px", background: "var(--linen-dark)", borderRadius: "4px" }} />
      </div>
    </div>
  );
}

export default function BlogFilter({ posts }: { posts: PostMeta[] }) {
  const [active, setActive] = useState("all");

  const filtered = active === "all"
    ? posts
    : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Filter pills */}
      <div style={{
        display:    "flex",
        gap:        "8px",
        flexWrap:   "wrap",
        marginBottom: "36px",
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActive(cat.value)}
            style={{
              fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
              fontSize:      "13px",
              fontWeight:    500,
              padding:       "6px 16px",
              borderRadius:  "100px",
              border:        `1px solid ${active === cat.value ? "var(--green)" : "var(--border)"}`,
              background:    active === cat.value ? "var(--green)" : "var(--white)",
              color:         active === cat.value ? "#fff" : "var(--charcoal-soft)",
              cursor:        "pointer",
              transition:    "all 0.15s",
              whiteSpace:    "nowrap",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {posts.length === 0 ? (
        /* No posts yet — show 3 skeleton cards */
        <div className="blog-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <p style={{
          fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
          fontSize:   "14px",
          color:      "var(--muted)",
          padding:    "40px 0",
        }}>
          No guides yet for this category — check back soon.
        </p>
      ) : (
        <div className="blog-grid">
          {filtered.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
      )}
    </>
  );
}
