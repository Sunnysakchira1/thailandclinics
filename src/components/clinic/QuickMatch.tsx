'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACT_EMAIL, FORMSPREE_ENDPOINT } from '@/lib/forms';
import { TIMING_OPTIONS, leadPayload, needOptions } from '@/lib/quick-match';

type Props = {
  /** Set on clinic profiles; omit on listing pages. */
  clinicName?: string;
  /** Hide the bar (e.g. while the listing's Compare tray occupies the bottom). */
  hidden?: boolean;
  cityName: string;
  categorySlug: string;
  categoryName: string;
};

type Step = 0 | 1 | 2 | 'sent';

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}
function track(event: string, params: Record<string, string | number> = {}) {
  try { window.gtag?.('event', event, params); } catch { /* analytics must never break the form */ }
}

/** Mobile sticky "Find my clinic" bar + three-step bottom sheet. Opens only on tap. */
export default function QuickMatch({ clinicName, hidden = false, cityName, categorySlug, categoryName }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [need, setNeed] = useState('');
  const [timing, setTiming] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const needs = needOptions(categorySlug);
  const category = categoryName.replace(/\s+clinics?$/i, '').toLowerCase();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = sheetRef.current?.querySelector<HTMLElement>('input, .qm-chip, .qm-btn');
    el?.focus();
  }, [open, step]);

  function openSheet() {
    setOpen(true);
    if (step === 'sent') { setStep(0); setNeed(''); setTiming(''); }
    track('quick_match_open', { source: clinicName ? 'profile' : 'listing', clinic: clinicName ?? '', category: categorySlug });
  }
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }
  function pickNeed(v: string) { setNeed(v); setStep(1); track('quick_match_step', { step: 1, need: v }); }
  function pickTiming(v: string) { setTiming(v); setStep(2); track('quick_match_step', { step: 2, timing: v }); }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const honeypot = (e.currentTarget.elements.namedItem('_gotcha') as HTMLInputElement | null)?.value ?? '';
    const payload = leadPayload({
      need, timing, name, contact, clinicName, cityName, categoryName,
      pageUrl: window.location.href.split(/[?#]/)[0],
    }, honeypot);
    setStatus('sending');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('idle');
      setStep('sent');
      track('generate_lead', { form: 'quick_match', source: clinicName ? 'profile' : 'listing', need, timing, category: categorySlug });
    } catch {
      setStatus('error');
      track('quick_match_error', { category: categorySlug });
    }
  }

  return (
    <>
      <div className="profile-sticky-cta qm-bar" hidden={hidden && !open}>
        <div className="qm-bar-text">
          <p className="qm-kicker">3 taps · free</p>
          <p className="qm-headline">{clinicName ? 'Not sure this is the one?' : 'Not sure which to pick?'}</p>
        </div>
        <button ref={triggerRef} type="button" className="qm-btn" onClick={openSheet} aria-haspopup="dialog">
          Find my clinic
        </button>
      </div>

      {open && (
        <>
          <div className="qm-scrim" onClick={close} aria-hidden="true" />
          <div ref={sheetRef} className="qm-sheet" role="dialog" aria-modal="true" aria-labelledby="qm-title">
            <button type="button" className="qm-close" onClick={close} aria-label="Close">×</button>
            {step !== 'sent' && (
              <div className="qm-steps" aria-hidden="true">
                {[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'on' : undefined} />)}
              </div>
            )}

            {step === 0 && (
              <>
                <h2 id="qm-title" className="qm-title">What is it for?</h2>
                <div className="qm-chips">
                  {needs.map((n) => <button key={n} type="button" className="qm-chip" onClick={() => pickNeed(n)}>{n}</button>)}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 id="qm-title" className="qm-title">When do you want to go?</h2>
                <div className="qm-chips">
                  {TIMING_OPTIONS.map((t) => <button key={t} type="button" className="qm-chip" onClick={() => pickTiming(t)}>{t}</button>)}
                </div>
                <button type="button" className="qm-link" onClick={() => setStep(0)}>← Back</button>
              </>
            )}

            {step === 2 && (
              <form onSubmit={submit}>
                <h2 id="qm-title" className="qm-title">Where should we send your shortlist?</h2>
                <p className="qm-sub">We&rsquo;ll reply with 2–3 {category} clinics in {cityName} that fit.</p>
                <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="qm-hp" />
                <label className="qm-field">
                  <span>Your name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required maxLength={80} />
                </label>
                <label className="qm-field">
                  <span>LINE ID, WhatsApp or email</span>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} required maxLength={120}
                    placeholder="e.g. anna.k or anna@mail.com" />
                </label>
                <p className="qm-context">{need} · {timing}{clinicName ? ` · viewed ${clinicName}` : ''}</p>
                <button type="submit" className="qm-btn qm-full" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send my request'}
                </button>
                {status === 'error' && (
                  <p className="qm-error" role="alert">
                    That didn&rsquo;t send. Please try again, or email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                  </p>
                )}
                <p className="qm-fine">Free. We never share your details with a clinic without your permission.</p>
                <button type="button" className="qm-link" onClick={() => setStep(1)}>← Back</button>
              </form>
            )}

            {step === 'sent' && (
              <div className="qm-done">
                <div className="qm-tick" aria-hidden="true">✓</div>
                <h2 id="qm-title" className="qm-title">Request received</h2>
                <p className="qm-sub">We&rsquo;ll reply within 1 business day on the contact you gave us.</p>
                <button type="button" className="qm-btn qm-ghost qm-full" onClick={close}>{clinicName ? 'Back to the clinic' : 'Back to the list'}</button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
