import Link from "next/link";

const cities = [
  { name: "Bangkok",    slug: "bangkok" },
  { name: "Phuket",     slug: "phuket" },
  { name: "Chiang Mai", slug: "chiang-mai" },
  { name: "Pattaya",    slug: "pattaya" },
];

const categories = [
  { name: "Physiotherapy", slug: "physiotherapy-clinics" },
  { name: "Dental",        slug: "dental-clinics" },
  { name: "Cosmetic",      slug: "cosmetic-clinics" },
  { name: "Wellness",      slug: "wellness-clinics" },
];

export default function Nav() {
  return (
    <nav
      style={{
        height: "64px",
        backgroundColor: "var(--white)",
        borderBottom: "1px solid var(--border-soft)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "100%",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "32px",
        }}
      >
        {/* Logo wordmark */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
            fontSize: "20px",
            letterSpacing: "0.01em",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 400, color: "var(--charcoal-soft)" }}>
            thailand
          </span>
          <span style={{ fontWeight: 600, color: "var(--green)" }}>
            clinics
          </span>
        </Link>

        {/* City links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "13.5px",
            fontWeight: 400,
          }}
        >
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              style={{ color: "var(--charcoal-soft)", textDecoration: "none" }}
              className="nav-link"
            >
              {city.name}
            </Link>
          ))}

          <span style={{ color: "var(--border)", userSelect: "none" }}>|</span>

          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/bangkok/${cat.slug}`}
              style={{ color: "var(--charcoal-soft)", textDecoration: "none" }}
              className="nav-link"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
