'use client';

import Link from 'next/link';
import { clearCompare, MAX_COMPARE, removeCompare, type CompareItem } from '@/lib/compare';

export default function CompareTray({ items, notice }: { items: CompareItem[]; notice: string | null }) {
  if (items.length === 0 && !notice) return null;
  const empty = MAX_COMPARE - items.length;
  return (
    <>
      <div className="compare-spacer" aria-hidden />
      {notice && <div className="compare-notice" role="status">{notice}</div>}
      {items.length > 0 && (
        <div className="compare-tray" role="region" aria-label="Clinics to compare">
          <div className="compare-tray-inner">
            <span className="compare-tray-label">Comparing {items.length} of {MAX_COMPARE}</span>
            <div className="compare-slots">
              {items.map((c) => (
                <span className="compare-slot" key={c.id}>
                  <span className="compare-slot-name">{c.name}</span>
                  <button type="button" aria-label={`Remove ${c.name}`} onClick={() => removeCompare(c.id)}>×</button>
                </span>
              ))}
              {Array.from({ length: empty }, (_, i) => <span className="compare-slot is-empty" key={i}>+ Add clinic</span>)}
            </div>
            <button type="button" className="compare-tray-clear" onClick={clearCompare}>Clear</button>
            {items.length < 2
              ? <span className="compare-tray-go is-disabled">Pick 1 more</span>
              : <Link href="/compare/" className="compare-tray-go">Compare {items.length} clinics →</Link>}
          </div>
        </div>
      )}
    </>
  );
}
