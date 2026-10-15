import type { ClinicDoctor } from "@/lib/db/schema";

const SERIF = "var(--font-cormorant,'Cormorant Garamond',Georgia,serif)";
const SANS = "var(--font-dm-sans,'DM Sans',sans-serif)";

function initials(name: string): string {
  const words = name.replace(/^(dr\.?|prof\.?)\s+/i, "").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";
}

/** "Our doctors" — Premium profiles only. Renders nothing when there are no doctors. */
export default function DoctorsSection({ doctors }: { doctors: ClinicDoctor[] }) {
  if (doctors.length === 0) return null;

  return (
    <section className="profile-voices" aria-labelledby="our-doctors-heading">
      <div className="profile-voices-inner">
        <h2 id="our-doctors-heading" style={{
          fontFamily: SERIF, fontSize: "28px", fontWeight: 400,
          color: "var(--charcoal)", margin: "0 0 20px", lineHeight: 1.2,
        }}>
          Our doctors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <div key={d.id} style={{
              background: "var(--white)", border: "1px solid var(--border-soft)",
              borderRadius: "6px", padding: "16px",
              display: "flex", gap: "14px", alignItems: "flex-start",
            }}>
              {d.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.photoUrl}
                  alt={`Portrait of ${d.name}`}
                  width={56}
                  height={56}
                  loading="lazy"
                  style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div aria-hidden="true" style={{
                  width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
                  background: "var(--linen-dark)", color: "var(--green)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: SERIF, fontSize: "20px", fontWeight: 500,
                }}>
                  {initials(d.name)}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: SERIF, fontSize: "19px", fontWeight: 500, color: "var(--charcoal)", margin: 0, lineHeight: 1.25 }}>
                  {d.name}
                </p>
                {d.role && (
                  <p style={{ fontFamily: SANS, fontSize: "12.5px", color: "var(--green)", margin: "2px 0 0" }}>
                    {d.role}
                  </p>
                )}
                {d.credentials && (
                  <p style={{ fontFamily: SANS, fontSize: "12px", color: "var(--charcoal-soft)", margin: "6px 0 0" }}>
                    {d.credentials}
                  </p>
                )}
                {d.licence && (
                  <p style={{ fontFamily: SANS, fontSize: "12px", color: "var(--charcoal-soft)", margin: "2px 0 0" }}>
                    {d.licence}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
