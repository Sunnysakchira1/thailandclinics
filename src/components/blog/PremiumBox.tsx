import Link from "next/link";
import PlanBadges from "@/components/ui/PlanBadges";

/**
 * Wraps a Premium clinic's entry in a guide. The ranking and wording inside stay editorial;
 * the box only labels the paid placement. Pass `topRated` only when our editors have set the flag.
 */
export default function PremiumBox({ topRated = false, children }: { topRated?: boolean; children: React.ReactNode }) {
  return (
    <aside style={{ border: "1px solid var(--gold)", background: "#fffdf7", borderRadius: "6px", padding: "18px 22px 14px", margin: "24px 0" }}>
      <PlanBadges tier="premium" topRated={topRated} size="sm" />
      <div style={{ marginTop: "8px" }}>{children}</div>
      <p style={{ fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)", fontSize: "12px", color: "var(--muted)", margin: "10px 0 0" }}>
        Premium: this clinic pays for a labelled placement. Our rankings are editorial and not for sale.{" "}
        <Link href="/how-we-rank/" style={{ color: "var(--green)" }}>How we rank</Link>
      </p>
    </aside>
  );
}
