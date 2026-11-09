import Link from "next/link";

// Site-wide footer (moved out of the homepage 2026-11-08 so every page carries it).
// Internal-linking playbook: priority pages, cluster hubs and trust pages live here,
// plus one exact-match link to the homepage. Not every article goes here, only hubs.
export default function SiteFooter() {
  return (
  <>
    {/* ══════════════════════════════════════════════════════
        SECTION 7 — FOOTER
    ══════════════════════════════════════════════════════ */}
    <footer className="footer-pad" style={{ background: "var(--charcoal)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Top grid */}
        <div className="footer-grid">
          {/* Col 1 — Brand */}
          <div>
            <div style={{
              fontFamily:   "var(--font-cormorant, 'Cormorant Garamond', serif)",
              fontSize:     "22px",
              fontWeight:   500,
              color:        "var(--white)",
              marginBottom: "12px",
            }}>
              ThailandClinics
            </div>
            <p style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize:   "13.5px",
              lineHeight: 1.65,
              color:      "rgba(255,255,255,0.5)",
              maxWidth:   "260px",
            }}>
              The definitive guide to healthcare in Thailand. Helping expats and medical tourists find trusted care since 2024.
            </p>
          </div>

          {/* Col 2 — Browse */}
          <FooterCol title="Browse" links={[
            { label: "Clinics in Thailand", href: "/" },
            { label: "By city & specialty", href: "/browse/" },
            { label: "Physiotherapy", href: "/physiotherapy-clinics/" },
            { label: "Cosmetic",      href: "/cosmetic-clinics/" },
            { label: "IVF & Fertility", href: "/fertility-clinics/" },
            { label: "Dental",        href: "/dental-clinics/" },
            { label: "Wellness",      href: "/wellness-clinics/" },
          ]} />

          {/* Col 3 — Cities */}
          <FooterCol title="Cities" links={[
            { label: "Bangkok",    href: "/bangkok/" },
            { label: "Chiang Mai", href: "/chiang-mai/" },
            { label: "Phuket",     href: "/phuket/" },
            { label: "Pattaya",    href: "/pattaya/" },
          ]} />

          {/* Col 4 — Company */}
          <FooterCol title="Company" links={[
            { label: "About",            href: "/about/" },
            { label: "How we rank",      href: "/how-we-rank/" },
            { label: "Blog",             href: "/blog/" },
            { label: "Clinic guides",    href: "/guides/" },
            { label: "Get matched",      href: "/get-matched/" },
            { label: "List Your Clinic", href: "/list-your-clinic/" },
            { label: "Privacy Policy",   href: "/privacy/" },
            { label: "Terms of Use",     href: "/terms/" },
          ]} />
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{
          fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
          fontSize:   "12.5px",
          color:      "rgba(255,255,255,0.3)",
        }}>
          <span>© 2026 ThailandClinics — All rights reserved</span>
          <span>Made with care for expats in Thailand</span>
        </div>

      </div>
    </footer>
  </>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p style={{
        fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
        fontSize:      "11px",
        fontWeight:    500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color:         "rgba(255,255,255,0.4)",
        marginBottom:  "20px",
      }}>
        {title}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} style={{
              fontFamily:     "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize:       "14px",
              color:          "rgba(255,255,255,0.6)",
              textDecoration: "none",
              transition:     "color 0.2s",
            }}
            className="footer-link"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

