'use client';

import { useEffect, useRef, useState } from 'react';

export type SortOption = 'recommended' | 'rated' | 'reviews' | 'alpha';

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rated', label: 'Highest rated' },
  { value: 'reviews', label: 'Most reviewed' },
  { value: 'alpha', label: 'A–Z' },
];

export function SortMenu({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="lf-sort" ref={root}>
      <button type="button" className="lf-sort-btn" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Sort: <b>{SORTS.find((s) => s.value === value)?.label}</b>
        <span className="lf-chev" aria-hidden />
      </button>
      {open && (
        <div className="lf-sort-menu">
          {SORTS.map((s) => (
            <button
              key={s.value} type="button" className={s.value === value ? 'is-on' : undefined}
              aria-current={s.value === value ? 'true' : undefined}
              onClick={() => { onChange(s.value); setOpen(false); }}
            >
              {s.label}{s.value === value && <span aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActiveChips({ chips, onRemove, onClear }: {
  chips: { id: string; label: string }[]; onRemove: (id: string) => void; onClear: () => void;
}) {
  if (chips.length === 0) return <span className="lf-chips-hint">Showing all clinics. Narrow down with the filters.</span>;
  return (
    <div className="lf-chips">
      <span className="lf-title">Filters</span>
      {chips.map((c) => (
        <span className="lf-chip" key={c.id}>
          {c.label}
          <button type="button" aria-label={`Remove ${c.label}`} onClick={() => onRemove(c.id)}>×</button>
        </span>
      ))}
      <button type="button" className="lf-clear" onClick={onClear}>Clear all</button>
    </div>
  );
}
