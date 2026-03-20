import Link from "next/link";

export default function Nav() {
  return (
    <nav
      className="main-nav"
      style={{
        height:          "64px",
        backgroundColor: "var(--linen)",
        borderBottom:    "1px solid var(--border)",
        position:        "sticky",
        top:             0,
        zIndex:          100,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        {/* Leaf SVG */}
        <svg
          width="22" height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green)"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 22c0 0-8-4-8-12a8 8 0 0 1 16 0c0 8-8 12-8 12z"/>
          <path d="M12 10v12" strokeDasharray="2 2"/>
        </svg>

        {/* Wordmark */}
        <span
          style={{
            fontFamily:    "var(--font-cormorant, 'Cormorant Garamond', serif)",
            fontSize:      "20px",
            fontWeight:    600,
            letterSpacing: "0.01em",
            lineHeight:    1,
          }}
        >
          <span style={{ color: "var(--charcoal)" }}>Thailand</span>
          <span style={{ color: "var(--green)" }}>Clinics</span>
        </span>
      </Link>

      {/* ── Right nav ────────────────────────────────────────── */}
      <div className="nav-links">
        {[
          { label: "Browse",  href: "/bangkok/physiotherapy-clinics/" },
          { label: "Cities",  href: "/" },
          { label: "About",   href: "/about/" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize:      "13.5px",
              fontWeight:    400,
              color:         "var(--charcoal-soft)",
              textDecoration: "none",
              letterSpacing: "0.02em",
              transition:    "color 0.2s",
            }}
            className="nav-link"
          >
            {label}
          </Link>
        ))}

        <Link
          href="/list-your-clinic/"
          style={{
            fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:      "13px",
            fontWeight:    500,
            color:         "var(--green)",
            textDecoration: "none",
            border:        "1px solid var(--green)",
            padding:       "7px 16px",
            borderRadius:  "4px",
            transition:    "background 0.2s, color 0.2s",
            whiteSpace:    "nowrap",
          }}
          className="nav-cta"
        >
          List Your Clinic
        </Link>
      </div>
    </nav>
  );
}
