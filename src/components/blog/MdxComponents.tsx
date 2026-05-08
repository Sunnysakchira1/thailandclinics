import type { MDXComponents } from "mdx/types";

const BLOCKQUOTE_STYLE: React.CSSProperties = {
  borderLeft:   "3px solid var(--green)",
  background:   "var(--green-pale)",
  padding:      "16px 24px",
  margin:       "24px 0",
  borderRadius: "0 4px 4px 0",
  fontStyle:    "italic",
};

const TABLE_CELL: React.CSSProperties = {
  fontFamily:  "var(--font-dm-sans,'DM Sans',sans-serif)",
  fontSize:    "14px",
  padding:     "10px 12px",
  borderBottom: "1px solid var(--border-soft)",
  color:       "var(--charcoal-soft)",
  textAlign:   "left",
};

export const mdxComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 style={{
      fontFamily:   "var(--font-cormorant,'Cormorant Garamond',serif)",
      fontSize:     "28px",
      fontWeight:   400,
      color:        "var(--charcoal)",
      lineHeight:   1.2,
      marginTop:    "40px",
      marginBottom: "12px",
    }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontFamily:   "var(--font-dm-sans,'DM Sans',sans-serif)",
      fontSize:     "16px",
      fontWeight:   600,
      color:        "var(--charcoal)",
      lineHeight:   1.4,
      marginTop:    "24px",
      marginBottom: "8px",
    }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{
      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
      fontSize:   "16px",
      lineHeight: 1.85,
      color:      "var(--charcoal-soft)",
      margin:     "0 0 18px",
    }}>{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="mdx-link" style={{
      color:          "var(--green)",
      fontWeight:     500,
      textDecoration: "none",
    }}>{children}</a>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: "var(--charcoal)" }}>{children}</strong>
  ),
  ul: ({ children }) => (
    <ul style={{
      fontFamily:  "var(--font-dm-sans,'DM Sans',sans-serif)",
      fontSize:    "15px",
      lineHeight:  1.8,
      paddingLeft: "24px",
      margin:      "0 0 18px",
      color:       "var(--charcoal-soft)",
    }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{
      fontFamily:  "var(--font-dm-sans,'DM Sans',sans-serif)",
      fontSize:    "15px",
      lineHeight:  1.8,
      paddingLeft: "24px",
      margin:      "0 0 18px",
      color:       "var(--charcoal-soft)",
    }}>{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote style={BLOCKQUOTE_STYLE}>{children}</blockquote>
  ),
  hr: () => (
    <hr style={{
      border:    "none",
      borderTop: "1px solid var(--border-soft)",
      margin:    "40px 0",
    }} />
  ),
  code: ({ children }) => (
    <code style={{
      fontFamily:   "ui-monospace,'DM Mono',monospace",
      fontSize:     "13px",
      background:   "var(--linen-dark)",
      padding:      "2px 6px",
      borderRadius: "3px",
      color:        "var(--charcoal)",
    }}>{children}</code>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "0 0 24px" }}>
      <table style={{
        width:          "100%",
        borderCollapse: "collapse",
        fontFamily:     "var(--font-dm-sans,'DM Sans',sans-serif)",
      }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody className="mdx-tbody">{children}</tbody>,
  th: ({ children }) => (
    <th style={{
      fontFamily:    "var(--font-dm-sans,'DM Sans',sans-serif)",
      fontSize:      "12px",
      fontWeight:    600,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color:         "var(--muted)",
      borderBottom:  "2px solid var(--border)",
      padding:       "10px 12px",
      textAlign:     "left",
    }}>{children}</th>
  ),
  td: ({ children }) => <td style={TABLE_CELL}>{children}</td>,
};
