'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ClinicListItem } from '@/lib/db/queries';

/* ─── Types ──────────────────────────────────────────────────────── */
type SortOption = 'rating' | 'reviews' | 'alpha';

interface Props {
  clinics: ClinicListItem[];
  citySlug: string;
  catSlug: string;
  cityName: string;
  catName: string;
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

const RATING_THRESHOLDS = [
  { label: '4.5 & up', stars: 5, min: 4.5 },
  { label: '4.0 & up', stars: 4, min: 4.0 },
  { label: '3.0 & up', stars: 3, min: 3.0 },
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

function SidebarStars({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= count ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={i <= count ? 0 : 1.5}
          style={{ color: '#e8a020' }}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

/* ─── Custom checkbox ────────────────────────────────────────────── */
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div style={{
      width: '16px', height: '16px',
      border: `1.5px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: '3px',
      background: checked ? 'var(--green)' : 'var(--white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, transition: 'all 0.15s',
    }}>
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

/* ─── Sidebar content ────────────────────────────────────────────── */
function SidebarContent({
  allClinics, ratingMin, setRatingMin,
  selectedDistricts, toggleDistrict,
  englishOnly, setEnglishOnly,
  neighbourhoodCounts, ratingCounts, englishCount,
}: {
  allClinics: ClinicListItem[];
  ratingMin: number | null;
  setRatingMin: (v: number | null) => void;
  selectedDistricts: string[];
  toggleDistrict: (d: string) => void;
  englishOnly: boolean;
  setEnglishOnly: (v: boolean) => void;
  neighbourhoodCounts: [string, number][];
  ratingCounts: { label: string; stars: number; min: number; count: number }[];
  englishCount: number;
}) {
  const filterTitle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px',
  };
  const filterGroup: React.CSSProperties = {
    marginBottom: '28px', paddingBottom: '28px',
    borderBottom: '1px solid var(--border-soft)',
  };

  return (
    <>
      {/* Rating */}
      <div style={filterGroup}>
        <p style={filterTitle}>Rating</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div onClick={() => setRatingMin(null)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', padding: '6px 10px', borderRadius: '4px',
            background: ratingMin === null ? 'var(--green-pale)' : 'transparent',
            transition: 'background 0.15s',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--charcoal-soft)' }}>Any rating</span>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{allClinics.length}</span>
          </div>
          {ratingCounts.map(r => (
            <div key={r.min} onClick={() => setRatingMin(r.min)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', padding: '6px 10px', borderRadius: '4px',
              background: ratingMin === r.min ? 'var(--green-pale)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SidebarStars count={r.stars} />
                <span style={{ fontSize: '13px', color: 'var(--charcoal-soft)', marginLeft: '6px' }}>{r.label}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Neighbourhood */}
      {neighbourhoodCounts.length > 0 && (
        <div style={filterGroup}>
          <p style={filterTitle}>Neighbourhood</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {neighbourhoodCounts.map(([district, count]) => (
              <div key={district} onClick={() => toggleDistrict(district)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Checkbox checked={selectedDistricts.includes(district)} />
                  <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>{district}</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Language */}
      <div>
        <p style={filterTitle}>Language</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div onClick={() => setEnglishOnly(!englishOnly)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={englishOnly} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>English speaking</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{englishCount}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function ListingsClient({ clinics: allClinics, citySlug, catSlug, cityName, catName }: Props) {
  const [sort, setSort]                     = useState<SortOption>('rating');
  const [ratingMin, setRatingMin]           = useState<number | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [englishOnly, setEnglishOnly]       = useState(false);
  const [openNow, setOpenNow]               = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  /* ── Computed counts ─────────────────────────────────────────── */
  const neighbourhoodCounts = useMemo<[string, number][]>(() => {
    const counts: Record<string, number> = {};
    for (const c of allClinics) {
      if (c.district) counts[c.district] = (counts[c.district] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [allClinics]);

  const ratingCounts = useMemo(() =>
    RATING_THRESHOLDS.map(t => ({
      ...t,
      count: allClinics.filter(c => (c.googleRating ?? 0) >= t.min).length,
    })), [allClinics]);

  const englishCount = useMemo(
    () => allClinics.filter(c => c.englishSpeaking).length,
    [allClinics]);

  /* ── Filtered + sorted list ──────────────────────────────────── */
  const filteredClinics = useMemo(() => {
    let list = [...allClinics];

    if (ratingMin !== null) list = list.filter(c => (c.googleRating ?? 0) >= ratingMin);
    if (selectedDistricts.length > 0) list = list.filter(c => c.district && selectedDistricts.includes(c.district));
    if (englishOnly) list = list.filter(c => c.englishSpeaking);
    if (openNow) list = list.filter(c => c.openWeekends);

    if (sort === 'rating') {
      list.sort((a, b) => {
        const rd = (b.googleRating ?? 0) - (a.googleRating ?? 0);
        return rd !== 0 ? rd : (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0);
      });
    } else if (sort === 'reviews') {
      list.sort((a, b) => (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0));
    } else {
      list.sort((a, b) => (a.nameEn || a.name).localeCompare(b.nameEn || b.name));
    }

    return list;
  }, [allClinics, sort, ratingMin, selectedDistricts, englishOnly, openNow]);

  function toggleDistrict(d: string) {
    setSelectedDistricts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  const catShort = catName.replace(' Clinics', '');

  const sidebarProps = {
    allClinics, ratingMin, setRatingMin,
    selectedDistricts, toggleDistrict,
    englishOnly, setEnglishOnly,
    neighbourhoodCounts, ratingCounts, englishCount,
  };

  return (
    <>
      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--linen)', borderBottom: '1px solid var(--border)',
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }} className="listing-nav-pad" >
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.5">
            <path d="M12 22c0 0-8-4-8-12a8 8 0 0 1 16 0c0 8-8 12-8 12z" />
            <path d="M12 10v12" strokeDasharray="2 2" />
          </svg>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '20px', fontWeight: 600, color: 'var(--charcoal)' }}>
            thailand<span style={{ color: 'var(--green)' }}>clinics</span>
          </span>
        </Link>

        {/* Inline search */}
        <div className="nav-search-bar" style={{
          flex: 1, maxWidth: '440px', margin: '0 40px',
          display: 'flex', alignItems: 'center', height: '38px',
          border: '1px solid var(--border)', borderRadius: '5px',
          background: 'var(--white)', overflow: 'hidden',
        }}>
          <input
            type="text"
            placeholder="Physiotherapy, dental, wellness…"
            defaultValue={catShort}
            style={{
              flex: 1, padding: '0 14px', height: '100%',
              border: 'none', outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: '13.5px',
              color: 'var(--charcoal)', background: 'transparent',
            }}
          />
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0 }} />
          <select style={{
            padding: '0 28px 0 12px', height: '100%',
            border: 'none', outline: 'none',
            fontFamily: 'var(--font-sans)', fontSize: '13.5px',
            color: 'var(--charcoal-soft)', background: 'transparent',
            cursor: 'pointer', flexShrink: 0,
          }} defaultValue={citySlug}>
            <option value="bangkok">Bangkok</option>
            <option value="chiang-mai">Chiang Mai</option>
            <option value="phuket">Phuket</option>
            <option value="pattaya">Pattaya</option>
          </select>
          <button style={{
            height: '100%', padding: '0 16px',
            background: 'var(--green)', color: 'var(--white)',
            border: 'none', fontFamily: 'var(--font-sans)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer', flexShrink: 0,
          }}>Search</button>
        </div>

        <ul className="listing-nav-links" style={{
          display: 'flex', alignItems: 'center', gap: '24px',
          listStyle: 'none', flexShrink: 0,
        }}>
          <li><Link href="/" className="nav-link" style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)', textDecoration: 'none' }}>Browse</Link></li>
          <li><Link href="/about" className="nav-link" style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)', textDecoration: 'none' }}>About</Link></li>
          <li>
            <Link href="/add-listing" className="nav-cta" style={{
              fontSize: '13px', fontWeight: 500, color: 'var(--green)',
              border: '1px solid var(--green)', padding: '6px 14px',
              borderRadius: '4px', textDecoration: 'none',
            }}>List Your Clinic</Link>
          </li>
        </ul>
      </nav>

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
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{filteredClinics.length}</strong> clinics found
          </span>
        </div>
      </div>

      {/* ── SORT BAR ─────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--linen)', borderBottom: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }} className="listing-sort-pad">
        <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Sort by</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['rating', 'reviews', 'alpha'] as SortOption[]).map((s, i) => {
            const labels = ['Highest rated', 'Most reviewed', 'A–Z'];
            const active = sort === s;
            return (
              <button key={s} onClick={() => setSort(s)} style={{
                padding: '5px 14px',
                border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: '100px',
                background: active ? 'var(--green)' : 'var(--white)',
                fontFamily: 'var(--font-sans)', fontSize: '12.5px',
                color: active ? 'var(--white)' : 'var(--charcoal-soft)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{labels[i]}</button>
            );
          })}
        </div>
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
        </button>

        {/* Open now toggle */}
        <label onClick={() => setOpenNow(!openNow)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '13px', color: 'var(--charcoal-soft)',
          cursor: 'pointer', userSelect: 'none',
        }}>
          <div style={{
            width: '36px', height: '20px', borderRadius: '10px',
            background: openNow ? 'var(--green)' : 'var(--border)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: '3px',
              left: openNow ? '19px' : '3px',
              width: '14px', height: '14px', borderRadius: '50%',
              background: 'var(--white)', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }} />
          </div>
          Open weekends
        </label>
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

          <SidebarContent {...sidebarProps} />
        </aside>

        {/* LISTINGS */}
        <main>
          {filteredClinics.length === 0 ? (
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
            filteredClinics.map((clinic, i) => {
              const displayName = clinic.nameEn || clinic.name;
              const rank = i + 1;
              const bg = PHOTO_BG[i % PHOTO_BG.length];
              const isFeatured = !!clinic.featured;

              const tags: string[] = [];
              if (clinic.nearBts && clinic.nearMrt) tags.push('BTS · MRT access');
              else if (clinic.nearBts) tags.push('Near BTS');
              else if (clinic.nearMrt) tags.push('Near MRT');
              if (clinic.openWeekends) tags.push('Open weekends');
              if (clinic.verified) tags.push('Verified');

              return (
                <Link
                  key={clinic.id}
                  href={`/${citySlug}/${catSlug}/${clinic.slug}`}
                  className="clinic-row-list"
                  style={{
                    borderLeft: isFeatured ? '3px solid var(--green)' : undefined,
                  }}
                >
                  {/* Photo */}
                  <div style={{
                    background: bg, aspectRatio: '4/3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', flexShrink: 0, overflow: 'hidden',
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
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

                    {/* Featured badge */}
                    {isFeatured && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--green)',
                        background: 'var(--green-pale)', padding: '3px 8px',
                        borderRadius: '3px', marginBottom: '6px', width: 'fit-content',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d={STAR_PATH} />
                        </svg>
                        Top Rated
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

                    {/* Meta row */}
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
                      {(clinic.nearBts || clinic.nearMrt) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: 'var(--muted)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="10" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          {clinic.nearBts && clinic.nearMrt ? 'BTS · MRT' : clinic.nearBts ? 'Near BTS' : 'Near MRT'}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: '12px', paddingTop: '12px',
                      borderTop: '1px solid var(--border-soft)',
                    }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
                      }}>
                        View clinic
                        <svg className="clinic-row-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </main>
      </div>
    </>
  );
}
