import PlanBadges from "@/components/ui/PlanBadges";

/**
 * Wraps a Premium clinic's entry in a guide. The ranking and wording inside stay editorial;
 * the box only labels the placement. Pass `topRated` only when our editors have set the flag.
 */
export default function PremiumBox({ topRated = false, children }: { topRated?: boolean; children: React.ReactNode }) {
  return (
    <aside style={{ border: "1px solid var(--gold)", background: "#fffdf7", borderRadius: "6px", padding: "18px 22px 6px", margin: "24px 0" }}>
      <PlanBadges tier="premium" topRated={topRated} size="sm" />
      <div style={{ marginTop: "8px" }}>{children}</div>
    </aside>
  );
}
