import PlanBadges from "@/components/ui/PlanBadges";
import { getPremiumBoxInfo } from "@/lib/db/queries";

/**
 * Wraps a Premium clinic's entry in a guide. The ranking and wording inside stay editorial;
 * the box only labels the placement. `slug` is the clinic slug (or brand slug for chains);
 * the Top rated badge is read from the database at build time, never set in MDX.
 */
export default async function PremiumBox({ slug, children }: { slug: string; children: React.ReactNode }) {
  const info = await getPremiumBoxInfo(slug);
  if (!info) {
    throw new Error(`PremiumBox: no clinic or brand with slug "${slug}". Fix the slug in the guide's MDX.`);
  }
  return (
    <aside style={{ border: "1px solid var(--gold)", background: "#fffdf7", borderRadius: "6px", padding: "18px 22px 6px", margin: "24px 0" }}>
      <PlanBadges tier="premium" topRated={info.topRated} size="sm" />
      <div style={{ marginTop: "8px" }}>{children}</div>
    </aside>
  );
}
