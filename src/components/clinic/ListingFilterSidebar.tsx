'use client';

import { useState, type ReactNode } from 'react';
import {
  RATING_OPTIONS, REVIEW_OPTIONS, TOP_RATED,
  type FilterOption, type FilterSections, type FilterState,
} from '@/lib/listing-filters';

const STATIONS_SHOWN = 5;

export function SystemBadge({ system }: { system: string }) {
  return <span className={`lf-sys lf-sys-${system.split(' ')[0]}`}>{system.split(' ')[0]}</span>;
}

function Group({ title, active, defaultOpen, children }: {
  title: string; active: number; defaultOpen?: boolean; children: ReactNode;
}) {
  return (
    <details className="lf-group" open={defaultOpen}>
      <summary>
        <span>{title}</span>
        {active > 0 && <span className="lf-group-count">{active}</span>}
        <span className="lf-chev" aria-hidden />
      </summary>
      <div className="lf-group-body">{children}</div>
    </details>
  );
}

function Check({ option, checked, count, onToggle }: {
  option: FilterOption; checked: boolean; count: number | null; onToggle: (id: string) => void;
}) {
  const dead = count === 0 && !checked;
  return (
    <label className={`lf-opt${dead ? ' is-dead' : ''}`}>
      <input type="checkbox" className="lf-check" checked={checked} disabled={dead} onChange={() => onToggle(option.id)} />
      <span className="lf-opt-label">{option.system && <SystemBadge system={option.system} />}{option.label}</span>
      {count !== null && <span className="lf-opt-n">{count}</span>}
    </label>
  );
}

function RadioSet({ name, anyLabel, options, value, total, countOf, onChange }: {
  name: string; anyLabel: string; options: { value: number; label: string }[]; value: number | null;
  total: number; countOf: (v: number) => number; onChange: (v: number | null) => void;
}) {
  return (
    <>
      <label className="lf-opt">
        <input type="radio" className="lf-check lf-radio" name={name} checked={value === null} onChange={() => onChange(null)} />
        <span className="lf-opt-label">{anyLabel}</span>
        <span className="lf-opt-n">{total}</span>
      </label>
      {options.map((o) => (
        <label className="lf-opt" key={o.value}>
          <input type="radio" className="lf-check lf-radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span className="lf-opt-label">{o.label}</span>
          <span className="lf-opt-n">{countOf(o.value)}</span>
        </label>
      ))}
    </>
  );
}

export default function ListingFilterSidebar({
  sections, state, activeCount, onToggle, onRating, onReviews, onClear,
  optionCount, ratingCount, reviewsCount, ratingTotal, reviewsTotal,
}: {
  sections: FilterSections;
  state: FilterState;
  activeCount: number;
  onToggle: (id: string) => void;
  onRating: (v: number | null) => void;
  onReviews: (v: number | null) => void;
  onClear: () => void;
  optionCount: (id: string) => number | null;
  ratingCount: (v: number) => number;
  reviewsCount: (v: number) => number;
  ratingTotal: number;
  reviewsTotal: number;
}) {
  const [showAllStations, setShowAllStations] = useState(false);
  const [stationQuery, setStationQuery] = useState('');

  const isOn = (o: FilterOption) => state.on.includes(o.id);
  const activeIn = (opts: FilterOption[]) => opts.filter(isOn).length;
  const list = (opts: FilterOption[]) => opts.map((o) => (
    <Check key={o.id} option={o} checked={isOn(o)} count={optionCount(o.id)} onToggle={onToggle} />
  ));

  const q = stationQuery.trim().toLowerCase();
  const stations = showAllStations
    ? sections.stations.filter((s) => !q || s.label.toLowerCase().includes(q))
    : sections.stations.filter((s, i) => i < STATIONS_SHOWN || isOn(s));
  const reputationActive = (state.minRating !== null ? 1 : 0) + (state.minReviews !== null ? 1 : 0) + (state.on.includes(TOP_RATED) ? 1 : 0);

  return (
    <div className="lf-side">
      <div className="lf-side-head">
        <span className="lf-title">Filters</span>
        {activeCount > 0 && <button type="button" className="lf-clear" onClick={onClear}>Clear all</button>}
      </div>

      {sections.hours.length > 0 && (
        <Group title="Opening hours" active={activeIn(sections.hours)} defaultOpen>{list(sections.hours)}</Group>
      )}

      {(sections.stations.length > 0 || sections.access.length > 0) && (
        <Group title="Getting there" active={activeIn(sections.stations) + activeIn(sections.access)} defaultOpen>
          {sections.stations.length > 0 && (
            <>
              <p className="lf-sub">Near a station <span>within 1 km</span></p>
              {showAllStations && (
                <input
                  type="search" className="lf-find" placeholder="Find a station" aria-label="Find a station"
                  value={stationQuery} onChange={(e) => setStationQuery(e.target.value)}
                />
              )}
              <div className={showAllStations ? 'lf-scroll' : undefined}>{list(stations)}</div>
              {sections.stations.length > STATIONS_SHOWN && (
                <button type="button" className="lf-more" onClick={() => { setShowAllStations((v) => !v); setStationQuery(''); }}>
                  {showAllStations ? 'Show fewer stations' : `Show all ${sections.stations.length} stations`}
                </button>
              )}
            </>
          )}
          {sections.access.length > 0 && (
            <>
              {sections.stations.length > 0 && <p className="lf-sub">Access</p>}
              {list(sections.access)}
            </>
          )}
        </Group>
      )}

      <Group title="Reputation" active={reputationActive} defaultOpen>
        <p className="lf-sub">Google rating</p>
        <RadioSet name="lf-rating" anyLabel="Any rating" options={RATING_OPTIONS} value={state.minRating} total={ratingTotal} countOf={ratingCount} onChange={onRating} />
        <p className="lf-sub">Number of reviews</p>
        <RadioSet name="lf-reviews" anyLabel="Any number" options={REVIEW_OPTIONS} value={state.minReviews} total={reviewsTotal} countOf={reviewsCount} onChange={onReviews} />
        {sections.hasTopRated && (
          <>
            <p className="lf-sub">Our picks</p>
            <Check option={{ id: TOP_RATED, label: 'Top rated only' }} checked={state.on.includes(TOP_RATED)} count={optionCount(TOP_RATED)} onToggle={onToggle} />
          </>
        )}
      </Group>

      {sections.services.length > 0 && <Group title="Services" active={activeIn(sections.services)}>{list(sections.services)}</Group>}
      {sections.practical.length > 0 && <Group title="Practical" active={activeIn(sections.practical)}>{list(sections.practical)}</Group>}
      {sections.districts.length > 0 && <Group title="Neighbourhood" active={activeIn(sections.districts)}>{list(sections.districts)}</Group>}
    </div>
  );
}
