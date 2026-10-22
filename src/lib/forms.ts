/**
 * Form delivery via Formspree. One endpoint serves both site forms:
 * /get-matched/ (patients) and /list-your-clinic/ (clinics). Each sends a
 * `form` field and a [Patient] / [Clinic] subject prefix so the two are easy to
 * filter in the inbox. Formspree form URLs are public by design (they ship in
 * the page), so the default lives here. NEXT_PUBLIC_FORMSPREE_ENDPOINT
 * overrides it at build. Empty = fall back to a mailto to hello@.
 */
export const FORMSPREE_ENDPOINT =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/xppqvnlj";

export const CONTACT_EMAIL = "hello@thailand-clinics.com";
