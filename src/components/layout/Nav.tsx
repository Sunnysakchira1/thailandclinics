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
      {/* ── Logo — editorial wordmark (Direction 03) ─────────── */}
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }} aria-label="ThailandClinics — home">
        <span
          style={{
            fontFamily:    "var(--font-cormorant, 'Cormorant Garamond', serif)",
            fontSize:      "22px",
            fontWeight:    500,
            letterSpacing: "-0.01em",
            lineHeight:    1,
            color:         "var(--green)",
          }}
        >
          Thailand<span style={{ fontStyle: "italic" }}>Clinics</span>
        </span>
      </Link>

      {/* ── Right nav ────────────────────────────────────────── */}
      <div className="nav-links">

        {/* Browse dropdown */}
        <div className="nav-browse-wrapper">
          <Link
            href="/browse/"
            style={{
              fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize:      "13.5px",
              fontWeight:    400,
              color:         "var(--charcoal-soft)",
              letterSpacing: "0.02em",
              textDecoration: "none",
            }}
            className="nav-link"
          >
            Browse
          </Link>
          <div className="nav-browse-dropdown">
            <div>
              <p className="nav-browse-col-title">By City</p>
              {[
                { label: "Bangkok",    href: "/bangkok/" },
                { label: "Phuket",     href: "/phuket/" },
                { label: "Chiang Mai", href: "/chiang-mai/" },
                { label: "Pattaya",    href: "/pattaya/" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="nav-browse-link">{label}</Link>
              ))}
            </div>
            <div>
              <p className="nav-browse-col-title">By Category</p>
              {[
                { label: "Physiotherapy", href: "/physiotherapy-clinics/" },
                { label: "Dental",        href: "/dental-clinics/" },
                { label: "Cosmetic",      href: "/cosmetic-clinics/" },
                { label: "Wellness",      href: "/wellness-clinics/" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="nav-browse-link">{label}</Link>
              ))}
            </div>
          </div>
        </div>

        {[
          { label: "About", href: "/about/" },
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
