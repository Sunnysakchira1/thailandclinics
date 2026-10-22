/**
 * Form delivery for the /get-matched/ shortlist form (Formspree).
 * Formspree form URLs are public by design (they ship in the page), so the
 * default lives here. NEXT_PUBLIC_FORMSPREE_GET_MATCHED overrides it at build.
 * Empty = fall back to a mailto to hello@.
 */
export const GET_MATCHED_FORMSPREE =
  process.env.NEXT_PUBLIC_FORMSPREE_GET_MATCHED || "https://formspree.io/f/xppqvnlj";

export const CONTACT_EMAIL = "hello@thailand-clinics.com";
