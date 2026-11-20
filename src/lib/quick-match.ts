/**
 * Mobile "Find my clinic" qualifier on clinic profiles and listing pages: three taps (need,
 * timing, contact) that send a lead to hello@ through the shared Formspree
 * form. Need options come from SERVICE_TAXONOMY labels so they only name
 * treatments the directory already tracks for that category.
 */
import { SERVICE_LABELS } from '@/lib/service-taxonomy';

export const SOMETHING_ELSE = 'Something else';

const NEEDS_BY_CATEGORY: Record<string, string[]> = {
  'physiotherapy-clinics': ['back-spine', 'sports-rehab', 'post-surgery-rehab', 'dry-needling', 'neuro-rehab'],
  'dental-clinics':        ['general-dentistry', 'implants', 'orthodontics', 'whitening', 'cosmetic-dentistry'],
  'cosmetic-clinics':      ['botox-fillers', 'laser-treatments', 'skin-care', 'body-contouring', 'hair-removal'],
  'wellness-clinics':      ['health-screening', 'iv-therapy', 'weight-management', 'hormone-therapy', 'nutrition'],
  'fertility-clinics':     ['fertility-consultation', 'ivf', 'iui', 'egg-freezing', 'male-fertility'],
};

/** Need chips for a category, always ending with "Something else". */
export function needOptions(categorySlug: string): string[] {
  const slugs = NEEDS_BY_CATEGORY[categorySlug] ?? [];
  return [...slugs.map((s) => SERVICE_LABELS[s] ?? s), SOMETHING_ELSE];
}

export const TIMING_OPTIONS = ['This week', 'This month', 'Just looking'] as const;

export type QuickMatchLead = {
  need: string;
  timing: string;
  name: string;
  contact: string;
  /** Clinic the visitor was viewing; omitted on listing pages. */
  clinicName?: string;
  cityName: string;
  categoryName: string;
  pageUrl: string;
};

/** True when the contact looks like an email, so Formspree can set Reply-To. */
export function isEmail(contact: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
}

/** Inbox subject, e.g. "[Patient] Quick match — Back & spine · This week — Bangkok physiotherapy". */
export function leadSubject(l: Pick<QuickMatchLead, 'need' | 'timing' | 'cityName' | 'categoryName'>): string {
  const cat = l.categoryName.replace(/\s+clinics?$/i, '').toLowerCase();
  return `[Patient] Quick match — ${l.need} · ${l.timing} — ${l.cityName} ${cat}`;
}

/** JSON body for Formspree. */
export function leadPayload(l: QuickMatchLead, honeypot: string): Record<string, string> {
  const contact = l.contact.trim();
  const body: Record<string, string> = {
    form: l.clinicName ? 'Patient: quick match (mobile, profile)' : 'Patient: quick match (mobile, listing)',
    name: l.name.trim(),
    contact,
    need: l.need,
    timing: l.timing,
    viewed_clinic: l.clinicName ?? '— (listing page)',
    city: l.cityName,
    category: l.categoryName,
    page: l.pageUrl,
    _subject: leadSubject(l),
    _gotcha: honeypot,
  };
  if (isEmail(contact)) body._replyto = contact;
  return body;
}
