'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { ListingEntry } from '@/lib/db/queries';
import { weightedRating } from '@/lib/ranking';
import ClinicPhoto from '@/components/clinic/ClinicPhoto';
import Nav from '@/components/layout/Nav';
import PlanBadges from '@/components/ui/PlanBadges';
import { tierRank } from '@/lib/tiers';
import ListingFilterSidebar, { SystemBadge } from '@/components/clinic/ListingFilterSidebar';
import { ActiveChips, SortMenu, type SortOption } from '@/components/clinic/ListingToolbar';
import CompareTray from '@/components/clinic/CompareTray';
import {
  activeFilterCount, applyFilters, buildSections, chipLabel, countClinics, EMPTY_FILTERS,
  prepareEntries, stateWith, toggleFilter, type FilterState, type Prepared,
} from '@/lib/listing-filters';
import { addCompare, MAX_COMPARE, removeCompare, useCompareList, type CompareItem } from '@/lib/compare';
import { isOpenAt } from '@/lib/opening-hours';
import { useBangkokClock } from '@/lib/use-bangkok-clock';
import { SERVICE_LABELS } from '@/lib/service-taxonomy';

/* ─── Types ──────────────────────────────────────────────────────── */
interface Props {
  clinics: ListingEntry[];
  citySlug: string;
  catSlug: string;
  cityName: string;
  catName: string;
  guideHref?: string | null;
  guideLabel?: string | null;
}

/* ─── Constants ──────────────────────────────────────────────────── */
const PHOTO_BG = [
  'linear-gradient(135deg, #2a5c40 0%, #1a3d2b 100%)',
  'linear-gradient(135deg, #3d4a5c 0%, #2a3340 100%)',
  'linear-gradient(135deg, #4a3d5c 0%, #332a40 100%)',
  'linear-gradient(135deg, #5c4a2a 0%, #40331a 100%)',
  'linear-gradient(135deg, #2a4a5c 0%, #1a3240 100%)',
  'linear-gradient(135deg, #5c3d3d 0%, #402a2a 100%)',
  'linear-gradient(135deg, #3d5c2a 0%, #2a401a 100%)',
];

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function rankColor(rank: number): string {
  if (rank === 1) return '#c9a84c';
  if (rank === 2) return '#8a8278';
  if (rank === 3) return '#a0714c';
  return '#1a1a1a';
}

/* ─── Star components ────────────────────────────────────────────── */
function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= Math.round(rating);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={filled ? 0 : 1.5}
            style={{ color: '#e8a020', flexShrink: 0 }}>
            <path d={STAR_PATH} />
          </svg>
        );
      })}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function ListingsClient({ clinics: allClinics, citySlug, catSlug, cityName, catName, guideHref, guideLabel }: Props) {
  const [sort, setSort] = useState<SortOption>('recommended');
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const clock = useBangkokClock();
  const compareItems = useCompareList();
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prepared = useMemo(() => prepareEntries(allClinics), [allClinics]);
  const sections = useMemo(() => buildSections(prepared, catSlug), [prepared, catSlug]);
  const totalClinics = useMemo(() => countClinics(prepared, EMPTY_FILTERS, null), [prepared]);

  const { entries: matched, clinics: visibleClinicTotal } = useMemo(
    () => applyFilters(prepared, filters, clock), [prepared, filters, clock]);

  const filteredClinics = useMemo(() => {
    const list = [...matched];
    const weighted = (p: Prepared<ListingEntry>) => weightedRating(p.entry.googleRating, p.entry.googleReviewsCount);
    const byWeighted = (a: Prepared<ListingEntry>, b: Prepared<ListingEntry>) =>
      (weighted(b) - weighted(a)) || ((b.entry.googleReviewsCount ?? 0) - (a.entry.googleReviewsCount ?? 0));
    if (sort === 'recommended') {
      // Premium, then Pro (each by featuredPosition), then organic. The other
      // sorts are purely organic: paid entries keep badges but lose their pin.
      list.sort((a, b) => {
        const td = tierRank(b.entry.tier) - tierRank(a.entry.tier);
        if (td !== 0) return td;
        if (a.entry.tier !== 'basic') {
          const pd = (a.entry.featuredPosition ?? 9999) - (b.entry.featuredPosition ?? 9999);
          if (pd !== 0) return pd;
        }
        return byWeighted(a, b);
      });
    } else if (sort === 'rated') {
      list.sort(byWeighted);
    } else if (sort === 'reviews') {
      list.sort((a, b) => (b.entry.googleReviewsCount ?? 0) - (a.entry.googleReviewsCount ?? 0));
    } else {
      list.sort((a, b) => (a.entry.nameEn || a.entry.name).localeCompare(b.entry.nameEn || b.entry.name));
    }
    return list;
  }, [matched, sort]);

  // Reset paging when the visitor changes filters or sort (not on the minute tick).
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filters, sort]);

  const activeCount = activeFilterCount(filters);
  const clearAll = () => setFilters(EMPTY_FILTERS);
  const onToggle = (id: string) => setFilters((f) => toggleFilter(f, id));

  const chips = [
    ...filters.on.map((id) => ({ id, label: chipLabel(id) })),
    ...(filters.minRating !== null ? [{ id: '@rating', label: `${filters.minRating.toFixed(1)}+ rating` }] : []),
    ...(filters.minReviews !== null ? [{ id: '@reviews', label: `${filters.minReviews.toLocaleString()}+ reviews` }] : []),
  ];
  const removeChip = (id: string) => {
    if (id === '@rating') setFilters((f) => ({ ...f, minRating: null }));
    else if (id === '@reviews') setFilters((f) => ({ ...f, minReviews: null }));
    else onToggle(id);
  };

  function showNotice(message: string) {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3000);
  }

  function toggleCompare(p: Prepared<ListingEntry>, href: string) {
    const c = p.entry;
    if (compareItems.some((x) => x.id === c.id)) { removeCompare(c.id); return; }
    const item: Omit<CompareItem, 'savedAt'> = {
      id: c.id, name: c.nameEn || c.name, href, citySlug, cityName, catSlug, catName,
      district: c.district, rating: c.googleRating, reviews: c.googleReviewsCount, topRated: c.topRated,
      stations: c.stations, openingHours: c.openingHours, englishSpeaking: !!c.englishSpeaking,
      freeParking: c.freeParking, wheelchairAccessible: !!c.wheelchairAccessible, openLate: !!c.openLate,
      acceptsCard: !!c.acceptsCard, acceptsNfc: !!c.acceptsNfc, lgbtqFriendly: c.lgbtqFriendly,
      services: p.self.services.map((s) => SERVICE_LABELS[s] ?? s),
    };
    const result = addCompare(item);
    if (!result.ok) {
      showNotice(result.reason === 'full'
        ? `You can compare up to ${MAX_COMPARE} clinics. Remove one first.`
        : `Your list has ${compareItems[0]?.catName.toLowerCase()}. Clear it to compare ${catName.toLowerCase()}.`);
    }
  }

  const catShort = catName.replace(' Clinics', '');

  const sidebar = (
    <ListingFilterSidebar
      sections={sections}
      state={filters}
      activeCount={activeCount}
      onToggle={onToggle}
      onRating={(minRating) => setFilters((f) => ({ ...f, minRating }))}
      onReviews={(minReviews) => setFilters((f) => ({ ...f, minReviews }))}
      onClear={clearAll}
      optionCount={(id) => (id === 'openNow' && !clock ? null : countClinics(prepared, stateWith(filters, id), clock))}
      ratingCount={(minRating) => countClinics(prepared, { ...filters, minRating }, clock)}
      reviewsCount={(minReviews) => countClinics(prepared, { ...filters, minReviews }, clock)}
      ratingTotal={countClinics(prepared, { ...filters, minRating: null }, clock)}
      reviewsTotal={countClinics(prepared, { ...filters, minReviews: null }, clock)}
    />
  );

  return (
    <>
      {/* ── NAV (shared) ─────────────────────────────────────────── */}
      <Nav />

      {/* ── TITLE BAR ────────────────────────────────────────────── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-soft)' }}
        className="listing-title-pad">
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12.5px', color: 'var(--muted)', marginBottom: '10px',
        }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <Link href={`/${citySlug}`} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{cityName}</Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <span style={{ color: 'var(--charcoal-soft)' }}>{catName}</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h1 style={{
            fontFamily: 'var(--font-cormorant)', fontSize: '28px',
            fontWeight: 400, color: 'var(--charcoal)', lineHeight: 1.2,
          }}>
            {catName} in <em style={{ fontStyle: 'italic', color: 'var(--green)' }}>{cityName}</em>
          </h1>
        </div>
        <p className="lf-count" aria-live="polite">
          <strong>{visibleClinicTotal}</strong> clinic{visibleClinicTotal === 1 ? '' : 's'} found
          {activeCount > 0 && <span> of {totalClinics}</span>}
        </p>
        {guideHref && (
          <Link href={guideHref} className="listing-guide-link" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '14px',
            fontFamily: 'var(--font-dm-sans)', fontSize: '13.5px', color: 'var(--green)',
            textDecoration: 'none', background: 'var(--green-pale)', border: '1px solid var(--green)',
            borderRadius: '100px', padding: '7px 16px', width: 'fit-content',
          }}>
            <span aria-hidden>📖</span> New guide: {guideLabel} →
          </Link>
        )}
      </div>

      {/* ── SORT BAR ─────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--linen)', borderBottom: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }} className="listing-sort-pad">
        <ActiveChips chips={chips} onRemove={removeChip} onClear={clearAll} />
        <div style={{ flex: 1 }} />

        {/* Mobile: Filters button */}
        <button className="mobile-filter-btn" onClick={() => setSidebarOpen(true)} style={{
          display: 'none', alignItems: 'center', gap: '6px',
          padding: '5px 14px', border: '1px solid var(--border)',
          borderRadius: '100px', background: 'var(--white)',
          fontFamily: 'var(--font-sans)', fontSize: '12.5px',
          color: 'var(--charcoal-soft)', cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="16" y2="12" /><line x1="4" y1="18" x2="12" y2="18" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '17px', height: '17px', padding: '0 4px', marginLeft: '2px',
              borderRadius: '100px', background: 'var(--green)', color: 'var(--white)',
              fontSize: '10.5px', fontWeight: 600, lineHeight: 1,
            }}>{activeCount}</span>
          )}
        </button>

        <SortMenu value={sort} onChange={setSort} />
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────────────────────── */}
      <div className="listings-grid">

        {/* Mobile sidebar overlay backdrop */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 199, display: 'none',
          }} className="sidebar-backdrop" />
        )}

        {/* SIDEBAR */}
        <aside className={`listings-sidebar${sidebarOpen ? ' open' : ''}`}>
          {/* Mobile close */}
          <div style={{
            display: 'none', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '20px',
          }} className="sidebar-close-row">
            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Filters</span>
            <button onClick={() => setSidebarOpen(false)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--charcoal-soft)', padding: '4px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {sidebar}
        </aside>

        {/* LISTINGS */}
        <main>
          {allClinics.length === 0 ? (
            <div style={{
              padding: '64px 40px', textAlign: 'center', background: 'var(--white)',
            }}>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', color: 'var(--charcoal-soft)' }}>
                {catName} in {cityName} — coming soon
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--muted)', marginTop: '8px' }}>
                We're verifying clinics in this category. Check back soon, or{' '}
                <a href="/list-your-clinic/" style={{ color: 'var(--green)', textDecoration: 'none', borderBottom: '1px solid var(--green)' }}>
                  submit your clinic
                </a>.
              </p>
            </div>
          ) : filteredClinics.length === 0 ? (
            <div style={{
              padding: '64px 40px', textAlign: 'center', background: 'var(--white)',
            }}>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', color: 'var(--charcoal-soft)' }}>
                No clinics match your filters
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13.5px', color: 'var(--muted)', marginTop: '8px' }}>
                Try removing some filters to see more results.
              </p>
            </div>
          ) : (
            filteredClinics.slice(0, visibleCount).map((p, i) => {
              const clinic = p.entry;
              const inCompare = compareItems.some((x) => x.id === clinic.id);
              // Show the station the visitor filtered by, else the closest one.
              const nearest = clinic.stations.find((st) => filters.on.includes(`st:${st.system}|${st.name}`)) ?? clinic.stations[0];
              const todayHours = clock ? p.self.hours?.[clock.day] : undefined;
              const openNow = clock ? isOpenAt(p.self.hours, clock) : false;
              const displayName = clinic.nameEn || clinic.name;
              const rank = i + 1;
              const bg = PHOTO_BG[i % PHOTO_BG.length];
              const isPremium = clinic.tier === 'premium';
              const isPro     = clinic.tier === 'pro';
              // Brand entry: link to hub; standalone: link to clinic profile
              const href = clinic.isBrand
                ? `/${citySlug}/${catSlug}/${clinic.brandSlug}/`
                : `/${citySlug}/${catSlug}/${clinic.slug}/`;

              const tags: string[] = [];
              if (!clinic.isBrand) {
                if (clinic.nearBts && clinic.nearMrt) tags.push('BTS · MRT access');
                else if (clinic.nearBts) tags.push('Near BTS');
                else if (clinic.nearMrt) tags.push('Near MRT');
                if (clinic.openWeekends) tags.push('Open weekends');
                if (clinic.verified) tags.push('Verified');
              }

              return (
                <div
                  key={clinic.isBrand ? `brand-${clinic.brandSlug}` : clinic.id}
                  className={`clinic-row-wrap${inCompare ? ' is-compared' : ''}`}
                >
                <Link
                  href={href}
                  className="clinic-row-list"
                  style={
                    isPremium ? { border: '2px solid var(--gold)' }
                    : isPro   ? { borderLeft: '3px solid var(--green)' }
                    : undefined
                  }
                >
                  {/* Photo */}
                  <div style={{
                    background: bg, aspectRatio: '4/3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', flexShrink: 0, overflow: 'hidden',
                  }}>
                    <ClinicPhoto url={clinic.photoUrl} name={displayName} />
                    <div style={{
                      position: 'absolute', top: '16px', left: '16px',
                      width: '28px', height: '28px',
                      background: rankColor(rank),
                      color: 'var(--white)', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 600, zIndex: 1,
                    }}>{rank}</div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '20px 24px 20px 20px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                    {/* Brand badge (locations count) + plan badges */}
                    {clinic.isBrand && clinic.branchCount != null && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '10.5px', fontFamily: 'var(--font-sans)', fontWeight: 500,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'var(--green)', background: 'var(--green-pale)',
                        padding: '3px 8px', borderRadius: '3px',
                        marginBottom: '6px', width: 'fit-content',
                      }}>
                        {clinic.branchCount} locations
                      </div>
                    )}
                    {(clinic.tier !== 'basic' || clinic.topRated) && (
                      <div style={{ marginBottom: '6px' }}>
                        <PlanBadges tier={clinic.tier} topRated={clinic.topRated} context="listing" />
                      </div>
                    )}

                    {/* Top row: tag + name | rating */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-start',
                      justifyContent: 'space-between', gap: '12px', marginBottom: '6px',
                      flexWrap: 'wrap',
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.1em',
                          textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: '4px',
                        }}>
                          {catShort}
                        </p>
                        <h2 className="clinic-row-list-name" style={{
                          fontFamily: 'var(--font-cormorant)', fontSize: '22px',
                          fontWeight: 500, color: 'var(--charcoal)', lineHeight: 1.2,
                          transition: 'color 0.15s',
                        }}>
                          {displayName}
                        </h2>
                      </div>
                      {clinic.googleRating != null && (
                        <div className="clinic-row-rating" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--charcoal)' }}>
                            {clinic.googleRating.toFixed(1)}
                          </span>
                          <StarRow rating={clinic.googleRating} size={13} />
                          {clinic.googleReviewsCount != null && (
                            <span className="clinic-row-rating-count" style={{ fontSize: '12.5px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                              {clinic.googleReviewsCount.toLocaleString()} reviews
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta row — only for standalone clinics */}
                    {!clinic.isBrand && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        marginTop: '8px', flexWrap: 'wrap',
                      }}>
                        {clinic.district && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--muted)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {clinic.district}
                          </span>
                        )}
                        {clinic.englishSpeaking && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--muted)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                            </svg>
                            English speaking
                          </span>
                        )}
                        {nearest && (
                          <span className="row-station">
                            <SystemBadge system={nearest.system} />{nearest.name} · {nearest.distanceM < 1000 ? `${nearest.distanceM} m` : `${(nearest.distanceM / 1000).toFixed(1)} km`}
                          </span>
                        )}
                        {p.self.hours && clock && (
                          <span className={`row-open${openNow ? ' is-open' : ''}`}>
                            <i aria-hidden />{openNow ? 'Open now' : 'Closed now'}
                            {todayHours && !/closed/i.test(todayHours) && <span className="row-open-today"> · Today {todayHours}</span>}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: '12px', paddingTop: '12px',
                      borderTop: '1px solid var(--border-soft)',
                    }}>
                      <div className={clinic.isBrand ? undefined : 'row-foot-tags'} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {tags.map(tag => (
                          <span key={tag} style={{
                            padding: '3px 10px', borderRadius: '100px',
                            border: '1px solid var(--border)',
                            fontSize: '11.5px', color: 'var(--charcoal-soft)',
                            background: 'var(--linen)',
                          }}>{tag}</span>
                        ))}
                      </div>
                      <span style={{
                        fontSize: '13px', fontWeight: 500, color: 'var(--green)',
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto',
                      }}>
                        {clinic.isBrand ? 'View all locations' : 'View clinic'}
                        <svg className="clinic-row-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
                {!clinic.isBrand && (
                  <label className="row-compare">
                    <input type="checkbox" className="lf-check" checked={inCompare} onChange={() => toggleCompare(p, href)} aria-label={`Compare ${displayName}`} />
                    Compare
                  </label>
                )}
                </div>
              );
            })
          )}

          {filteredClinics.length > visibleCount && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              padding: '32px 0 8px',
            }}>
              <button onClick={() => setVisibleCount(v => v + PAGE_SIZE)} style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: '13.5px', fontWeight: 500,
                color: 'var(--green)', background: 'var(--white)',
                border: '1px solid var(--green)', borderRadius: '100px',
                padding: '11px 28px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Load more clinics
              </button>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Showing {visibleCount} of {filteredClinics.length}
              </span>
            </div>
          )}
        </main>
      </div>
      <CompareTray items={compareItems} notice={notice} />
    </>
  );
}
