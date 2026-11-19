import { describe, expect, it } from 'vitest';
import { SERVICE_TAXONOMY } from '@/lib/service-taxonomy';
import { SOMETHING_ELSE, isEmail, leadPayload, leadSubject, needOptions } from '@/lib/quick-match';

const lead = {
  need: 'Back & spine', timing: 'This week', name: ' Anna ', contact: ' anna@mail.com ',
  clinicName: 'FRESH Physiotherapy Clinic', cityName: 'Bangkok', categoryName: 'Physiotherapy Clinics',
  pageUrl: 'https://thailand-clinics.com/bangkok/physiotherapy-clinics/fresh/',
};

describe('needOptions', () => {
  it('gives five tracked treatments plus Something else for each main category', () => {
    for (const cat of ['physiotherapy-clinics', 'dental-clinics', 'cosmetic-clinics', 'wellness-clinics', 'fertility-clinics']) {
      const opts = needOptions(cat);
      expect(opts).toHaveLength(6);
      expect(opts.at(-1)).toBe(SOMETHING_ELSE);
    }
  });
  it('only uses services the taxonomy tracks for that category', async () => {
    const { SERVICE_LABELS } = await import('@/lib/service-taxonomy');
    for (const [cat, slugs] of Object.entries(SERVICE_TAXONOMY)) {
      const allowed = new Set(slugs.map((s) => SERVICE_LABELS[s]));
      for (const o of needOptions(cat).slice(0, -1)) expect(allowed.has(o)).toBe(true);
    }
  });
  it('falls back to Something else for an unknown category', () => {
    expect(needOptions('unknown')).toEqual([SOMETHING_ELSE]);
  });
});

describe('lead formatting', () => {
  it('builds a sortable subject', () => {
    expect(leadSubject(lead)).toBe('[Patient] Quick match — Back & spine · This week — Bangkok physiotherapy');
  });
  it('sets reply-to only for email contacts and trims input', () => {
    const p = leadPayload(lead, '');
    expect(p._replyto).toBe('anna@mail.com');
    expect(p.name).toBe('Anna');
    expect(leadPayload({ ...lead, contact: 'anna.k' }, '')._replyto).toBeUndefined();
  });
  it('detects emails', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('+66 81 234 5678')).toBe(false);
    expect(isEmail('line: anna')).toBe(false);
  });
});
