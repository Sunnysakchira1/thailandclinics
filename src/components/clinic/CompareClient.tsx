'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { MAX_COMPARE, removeCompare, useCompareList, type CompareItem } from '@/lib/compare';
import { isOpenAt, isOpenOnDay, parseHours, type Clock } from '@/lib/opening-hours';
import { useBangkokClock } from '@/lib/use-bangkok-clock';
import { SystemBadge } from '@/components/clinic/ListingFilterSidebar';

const yesNo = (v: boolean): ReactNode => (v ? <span className="compare-yes">✓ Yes</span> : <span className="compare-no">–</span>);

function Row({ label, items, render }: {
  label: string; items: CompareItem[]; render: (c: CompareItem) => ReactNode;
}) {
  return (
    <tr>
      <th className="compare-attr" scope="row">{label}</th>
      {items.map((c) => (
        <td key={c.id}>{render(c)}</td>
      ))}
    </tr>
  );
}

function Section({ label, span }: { label: string; span: number }) {
  return <tr className="compare-section"><td colSpan={span}>{label}</td></tr>;
}

function todayCell(c: CompareItem, clock: Clock | null): ReactNode {
  const hours = parseHours(c.openingHours);
  if (!hours) return <span className="compare-no">Not listed</span>;
  if (!clock) return null;
  const open = isOpenAt(hours, clock);
  return (
    <>
      <span className={`row-open${open ? ' is-open' : ''}`}><i aria-hidden />{open ? 'Open now' : 'Closed now'}</span>
      {hours[clock.day] && <><br />{hours[clock.day]}</>}
    </>
  );
}

export default function CompareClient() {
  const items = useCompareList();
  const clock = useBangkokClock();
  const first = items[0];

  if (items.length < 2) {
    return (
      <main className="compare-page">
        {first && <Link className="compare-back" href={`/${first.citySlug}/${first.catSlug}/`}>← Back to {first.catName.toLowerCase()} in {first.cityName}</Link>}
        <h1>Compare clinics</h1>
        <div className="compare-empty">
          <h2>{first ? 'Pick one more clinic to compare' : 'Pick at least 2 clinics to compare'}</h2>
          <p>Tick “Compare” on any clinic card. You can compare up to {MAX_COMPARE} at once.</p>
          <Link className="compare-btn" href={first ? `/${first.citySlug}/${first.catSlug}/` : '/browse/'}>Browse clinics</Link>
        </div>
      </main>
    );
  }

  const span = items.length + 1;
  const sunday = (c: CompareItem) => isOpenOnDay(parseHours(c.openingHours), 'Sunday');

  return (
    <main className="compare-page">
      <Link className="compare-back" href={`/${first.citySlug}/${first.catSlug}/`}>← Back to {first.catName.toLowerCase()} in {first.cityName}</Link>
      <h1>Comparing <em>{items.length} clinics</em></h1>
      <p className="compare-lede">Side by side from our directory data: Google ratings, location and practical details.</p>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-attr"><span className="sr-only">Clinic</span></th>
              {items.map((c) => (
                <th key={c.id} scope="col">
                  <Link className="compare-name" href={c.href}>{c.name}</Link>
                  <span className="compare-district">{c.district ? `${c.district}, ` : ''}{c.cityName}</span>
                  <button type="button" className="compare-remove" onClick={() => removeCompare(c.id)} aria-label={`Remove ${c.name}`}>Remove</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Section label="Reputation" span={span} />
            <Row label="Google rating" items={items}
              render={(c) => (c.rating != null ? <><b>{c.rating.toFixed(1)}</b> <span className="compare-star">★</span></> : <span className="compare-no">Not listed</span>)} />
            <Row label="Reviews" items={items} render={(c) => (c.reviews ?? 0).toLocaleString()} />
            <Row label="Top rated" items={items} render={(c) => yesNo(c.topRated)} />

            <Section label="Getting there" span={span} />
            <Row label="Nearest station" items={items}
              render={(c) => (c.stations.length
                ? c.stations.map((s, i) => <span key={s.name}>{i > 0 && <br />}<SystemBadge system={s.system} />{s.name} · {s.distanceM} m</span>)
                : <span className="compare-no">None within 1 km</span>)} />
            <Row label="Neighbourhood" items={items} render={(c) => c.district ?? '–'} />
            <Row label="Free parking" items={items} render={(c) => yesNo(c.freeParking)} />
            <Row label="Wheelchair access" items={items} render={(c) => yesNo(c.wheelchairAccessible)} />

            <Section label="Opening hours" span={span} />
            <Row label="Today" items={items} render={(c) => todayCell(c, clock)} />
            <Row label="Open Sunday" items={items} render={(c) => yesNo(sunday(c))} />
            <Row label="Open late" items={items} render={(c) => yesNo(c.openLate)} />

            <Section label="Practical" span={span} />
            <Row label="English speaking" items={items} render={(c) => yesNo(c.englishSpeaking)} />
            <Row label="Accepts card" items={items} render={(c) => yesNo(c.acceptsCard)} />
            <Row label="Mobile / NFC payment" items={items} render={(c) => yesNo(c.acceptsNfc)} />
            <Row label="LGBTQ+ friendly" items={items} render={(c) => yesNo(c.lgbtqFriendly)} />

            <Section label="Services" span={span} />
            <Row label="Treatments listed" items={items}
              render={(c) => (c.services.length
                ? c.services.map((s, i) => <span key={s}>{i > 0 && <br />}{s}</span>)
                : <span className="compare-no">Not listed</span>)} />
            <tr>
              <th className="compare-attr" scope="row"><span className="sr-only">Links</span></th>
              {items.map((c) => <td key={c.id}><Link className="compare-btn is-ghost" href={c.href} aria-label={`View ${c.name}`}>View clinic</Link></td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="compare-cta">
        <div>
          <h2>Still not sure which one?</h2>
          <p>Tell us what you need. We’ll send a free shortlist of 2–3 clinics by email.</p>
        </div>
        <Link className="compare-btn" href="/get-matched/">Get matched, free</Link>
      </div>
    </main>
  );
}
