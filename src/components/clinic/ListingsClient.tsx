'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { ListingEntry } from '@/lib/db/queries';
import { weightedRating } from '@/lib/ranking';
import ClinicPhoto from '@/components/clinic/ClinicPhoto';
import Nav from '@/components/layout/Nav';

/* ─── Types ──────────────────────────────────────────────────────── */
type SortOption = 'rating' | 'reviews' | 'alpha';

interface Props {
  clinics: ListingEntry[];
  citySlug: string;
  catSlug: string;
  cityName: string;
  catName: string;
  guideHref?: string | null;
  guideLabel?: string | null;
}

/* ─── Service taxonomy ───────────────────────────────────────────── */
const SERVICE_LABELS: Record<string, string> = {
  'sports-rehab':          'Sports rehab',
  'manual-therapy':        'Manual therapy',
  'dry-needling':          'Dry needling',
  'lymphatic-drainage':    'Lymphatic drainage',
  'pilates':               'Pilates',
  'post-surgery-rehab':    'Post-surgery rehab',
  'pediatric-physio':      'Paediatric physio',
  'neuro-rehab':           'Neuro rehab',
  'back-spine':            'Back & spine',
  'traditional-massage':   'Traditional massage',
  'tcm-acupuncture':       'TCM / Acupuncture',
  'general-dentistry':     'General dentistry',
  'orthodontics':          'Orthodontics',
  'implants':              'Implants',
  'whitening':             'Whitening',
  'root-canal':            'Root canal',
  'cosmetic-dentistry':    'Cosmetic dentistry',
  'pediatric-dentistry':   'Paediatric dentistry',
  'botox-fillers':         'Botox & fillers',
  'laser-treatments':      'Laser treatments',
  'skin-care':             'Skin care',
  'body-contouring':       'Body contouring',
  'prp':                   'PRP',
  'hair-removal':          'Hair removal',
  'anti-aging':            'Anti-aging',
  'yoga':                  'Yoga',
  'massage':               'Massage',
  'meditation':            'Meditation',
  'nutrition':             'Nutrition',
  'mental-health':         'Mental health',
  'traditional-thai-massage': 'Thai massage',
  'detox':                 'Detox',
  'iv-therapy':            'IV therapy',
  'health-screening':      'Health screening',
  'hormone-therapy':       'Hormone therapy',
  'vitamin-therapy':       'Vitamin therapy',
  'weight-management':     'Weight management',
  'functional-medicine':   'Functional medicine',
  'ivf':                   'IVF',
  'icsi':                  'ICSI',
  'iui':                   'IUI',
  'egg-freezing':          'Egg freezing',
  'genetic-screening':     'Genetic screening (PGT)',
  'egg-sperm-donation':    'Egg / sperm donation',
  'male-fertility':        'Male fertility',
  'fertility-consultation':'Fertility consultation',
};

const SERVICE_TAXONOMY: Record<string, string[]> = {
  'physiotherapy-clinics': [
    'sports-rehab', 'manual-therapy', 'dry-needling', 'lymphatic-drainage',
    'pilates', 'post-surgery-rehab', 'pediatric-physio', 'neuro-rehab',
    'back-spine', 'traditional-massage', 'tcm-acupuncture',
  ],
  'dental-clinics': [
    'general-dentistry', 'orthodontics', 'implants', 'whitening',
    'root-canal', 'cosmetic-dentistry', 'pediatric-dentistry',
  ],
  'cosmetic-clinics': [
    'botox-fillers', 'laser-treatments', 'skin-care', 'body-contouring',
    'prp', 'hair-removal', 'anti-aging',
  ],
  'wellness-clinics': [
    'iv-therapy', 'health-screening', 'anti-aging', 'hormone-therapy',
    'vitamin-therapy', 'weight-management', 'functional-medicine', 'nutrition',
  ],
  'fertility-clinics': [
    'ivf', 'icsi', 'iui', 'egg-freezing', 'genetic-screening',
    'egg-sperm-donation', 'male-fertility', 'fertility-consultation',
  ],
};

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
  allClinics, catSlug, totalClinics,
  ratingMin, setRatingMin,
  selectedDistricts, toggleDistrict,
  selectedServices, toggleService,
  englishOnly, setEnglishOnly,
  nearBtsOnly, setNearBtsOnly,
  nearMrtOnly, setNearMrtOnly,
  openWeekends, setOpenWeekends,
  parkingOnly, setParkingOnly,
  wheelchairOnly, setWheelchairOnly,
  openLateOnly, setOpenLateOnly,
  acceptsCardOnly, setAcceptsCardOnly,
  neighbourhoodCounts, ratingCounts, serviceCounts,
  englishCount, btsCount, mrtCount, weekendsCount,
  parkingCount, wheelchairCount, openLateCount, acceptsCardCount,
}: {
  allClinics: ListingEntry[];
  totalClinics: number;
  catSlug: string;
  ratingMin: number | null;
  setRatingMin: (v: number | null) => void;
  selectedDistricts: string[];
  toggleDistrict: (d: string) => void;
  selectedServices: string[];
  toggleService: (s: string) => void;
  englishOnly: boolean;
  setEnglishOnly: (v: boolean) => void;
  nearBtsOnly: boolean;
  setNearBtsOnly: (v: boolean) => void;
  nearMrtOnly: boolean;
  setNearMrtOnly: (v: boolean) => void;
  openWeekends: boolean;
  setOpenWeekends: (v: boolean) => void;
  parkingOnly: boolean;
  setParkingOnly: (v: boolean) => void;
  wheelchairOnly: boolean;
  setWheelchairOnly: (v: boolean) => void;
  openLateOnly: boolean;
  setOpenLateOnly: (v: boolean) => void;
  acceptsCardOnly: boolean;
  setAcceptsCardOnly: (v: boolean) => void;
  neighbourhoodCounts: [string, number][];
  ratingCounts: { label: string; stars: number; min: number; count: number }[];
  serviceCounts: Record<string, number>;
  englishCount: number;
  btsCount: number;
  mrtCount: number;
  weekendsCount: number;
  parkingCount: number;
  wheelchairCount: number;
  openLateCount: number;
  acceptsCardCount: number;
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
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{totalClinics}</span>
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

      {/* Services */}
      {SERVICE_TAXONOMY[catSlug] && (
        <div style={filterGroup}>
          <p style={filterTitle}>Services</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {SERVICE_TAXONOMY[catSlug].map(slug => {
              const count = serviceCounts[slug] ?? 0;
              if (count === 0) return null;
              return (
                <div key={slug} onClick={() => toggleService(slug)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Checkbox checked={selectedServices.includes(slug)} />
                    <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>
                      {SERVICE_LABELS[slug] ?? slug}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
      <div style={filterGroup}>
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

      {/* Transit */}
      <div style={filterGroup}>
        <p style={filterTitle}>Transit access</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div onClick={() => setNearBtsOnly(!nearBtsOnly)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={nearBtsOnly} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>Near BTS</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{btsCount}</span>
          </div>
          <div onClick={() => setNearMrtOnly(!nearMrtOnly)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={nearMrtOnly} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>Near MRT</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{mrtCount}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div style={filterGroup}>
        <p style={filterTitle}>Availability</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div onClick={() => setOpenWeekends(!openWeekends)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={openWeekends} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>Open weekends</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{weekendsCount}</span>
          </div>
          <div onClick={() => setOpenLateOnly(!openLateOnly)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={openLateOnly} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>Open late</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{openLateCount}</span>
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div>
        <p style={filterTitle}>Facilities</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div onClick={() => setParkingOnly(!parkingOnly)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={parkingOnly} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>Has parking</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{parkingCount}</span>
          </div>
          <div onClick={() => setWheelchairOnly(!wheelchairOnly)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={wheelchairOnly} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>Wheelchair accessible</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{wheelchairCount}</span>
          </div>
          <div onClick={() => setAcceptsCardOnly(!acceptsCardOnly)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Checkbox checked={acceptsCardOnly} />
              <span style={{ fontSize: '13.5px', color: 'var(--charcoal-soft)' }}>Accepts card</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{acceptsCardCount}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function ListingsClient({ clinics: allClinics, citySlug, catSlug, cityName, catName, guideHref, guideLabel }: Props) {
  /* ── Derived totals for count line ──────────────────────────────
     totalClinics = standalone count + sum of branchCount on brand entries.
     brandCount   = number of isBrand entries.                        */
  const [sort, setSort]                     = useState<SortOption>('rating');
  const [ratingMin, setRatingMin]           = useState<number | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [englishOnly, setEnglishOnly]       = useState(false);
  const [nearBtsOnly, setNearBtsOnly]       = useState(false);
  const [nearMrtOnly, setNearMrtOnly]       = useState(false);
  const [openWeekends, setOpenWeekends]     = useState(false);
  const [parkingOnly, setParkingOnly]       = useState(false);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [openLateOnly, setOpenLateOnly]     = useState(false);
  const [acceptsCardOnly, setAcceptsCardOnly] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  /* ── Derived clinic totals (for count line) ─────────────────── */
  const totalClinics = useMemo(() =>
    allClinics.reduce((sum, e) =>
      e.isBrand ? sum + (e.branchCount ?? 0) : sum + 1, 0),
  [allClinics]);
  const brandCount = useMemo(() => allClinics.filter(e => e.isBrand).length, [allClinics]);

  /* ── Computed counts (facets use standalone entries only) ────── */
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

  const englishCount    = useMemo(() => allClinics.filter(c => c.englishSpeaking).length,    [allClinics]);
  const btsCount        = useMemo(() => allClinics.filter(c => c.nearBts).length,             [allClinics]);
  const mrtCount        = useMemo(() => allClinics.filter(c => c.nearMrt).length,             [allClinics]);
  const weekendsCount   = useMemo(() => allClinics.filter(c => c.openWeekends).length,        [allClinics]);
  const serviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of allClinics) {
      if (!c.services) continue;
      try {
        const parsed = JSON.parse(c.services) as unknown;
        if (Array.isArray(parsed)) {
          for (const s of parsed) if (typeof s === 'string') counts[s] = (counts[s] || 0) + 1;
        }
      } catch { /* ignore */ }
    }
    return counts;
  }, [allClinics]);

  const parkingCount    = useMemo(() => allClinics.filter(c => c.hasParking).length,           [allClinics]);
  const wheelchairCount = useMemo(() => allClinics.filter(c => c.wheelchairAccessible).length, [allClinics]);
  const openLateCount   = useMemo(() => allClinics.filter(c => c.openLate).length,             [allClinics]);
  const acceptsCardCount = useMemo(() => allClinics.filter(c => c.acceptsCard).length,         [allClinics]);

  /* ── Filtered + sorted list ──────────────────────────────────── */
  const filteredClinics = useMemo(() => {
    let list = [...allClinics];

    // v1 any-match simplification: brand entries have no per-branch attribute
    // flags (district/services are null, englishSpeaking/nearBts/etc are false).
    // Rather than wrongly hiding brands when a filter is active, brand entries
    // always pass attribute/neighbourhood/service filters. Only standalone
    // clinics are filtered by those dimensions. Rating filter applies to both
    // (brands have a real aggregated rating).
    if (ratingMin !== null) {
      list = list.filter(c => (c.googleRating ?? 0) >= ratingMin);
    }
    if (selectedDistricts.length > 0) {
      list = list.filter(c => c.isBrand || (c.district != null && selectedDistricts.includes(c.district)));
    }
    if (englishOnly)    list = list.filter(c => c.isBrand || c.englishSpeaking);
    if (nearBtsOnly)    list = list.filter(c => c.isBrand || c.nearBts);
    if (nearMrtOnly)    list = list.filter(c => c.isBrand || c.nearMrt);
    if (openWeekends)   list = list.filter(c => c.isBrand || c.openWeekends);
    if (parkingOnly)    list = list.filter(c => c.isBrand || c.hasParking);
    if (wheelchairOnly) list = list.filter(c => c.isBrand || c.wheelchairAccessible);
    if (openLateOnly)   list = list.filter(c => c.isBrand || c.openLate);
    if (acceptsCardOnly) list = list.filter(c => c.isBrand || c.acceptsCard);
    if (selectedServices.length > 0) {
      list = list.filter(c => {
        if (c.isBrand) return true; // brands always pass service filter (v1 any-match)
        if (!c.services) return false;
        try {
          const parsed = JSON.parse(c.services) as unknown;
          if (!Array.isArray(parsed)) return false;
          return selectedServices.every(s => (parsed as string[]).includes(s));
        } catch { return false; }
      });
    }

    if (sort === 'rating') {
      list.sort((a, b) => {
        const aPos = a.featured && a.featuredPosition != null ? a.featuredPosition : Infinity;
        const bPos = b.featured && b.featuredPosition != null ? b.featuredPosition : Infinity;
        if (aPos !== bPos) return aPos - bPos;
        const wd = weightedRating(b.googleRating, b.googleReviewsCount)
                 - weightedRating(a.googleRating, a.googleReviewsCount);
        return wd !== 0 ? wd : (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0);
      });
    } else if (sort === 'reviews') {
      list.sort((a, b) => (b.googleReviewsCount ?? 0) - (a.googleReviewsCount ?? 0));
    } else {
      list.sort((a, b) => (a.nameEn || a.name).localeCompare(b.nameEn || b.name));
    }

    return list;
  }, [allClinics, sort, ratingMin, selectedDistricts, englishOnly, nearBtsOnly, nearMrtOnly, openWeekends, parkingOnly, wheelchairOnly, openLateOnly, acceptsCardOnly, selectedServices]);

  /* ── Visible (filtered) counts for header ───────────────────── */
  const visibleClinicTotal = useMemo(
    () => filteredClinics.reduce((n, c) => n + (c.isBrand ? (c.branchCount ?? 0) : 1), 0),
    [filteredClinics]
  );
  const visibleBrandCount = useMemo(
    () => filteredClinics.filter(c => c.isBrand).length,
    [filteredClinics]
  );

  function toggleDistrict(d: string) {
    setSelectedDistricts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function toggleService(s: string) {
    setSelectedServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  const catShort = catName.replace(' Clinics', '');

  const sidebarProps = {
    allClinics, catSlug, totalClinics,
    ratingMin, setRatingMin,
    selectedDistricts, toggleDistrict,
    selectedServices, toggleService,
    englishOnly, setEnglishOnly,
    nearBtsOnly, setNearBtsOnly,
    nearMrtOnly, setNearMrtOnly,
    openWeekends, setOpenWeekends,
    parkingOnly, setParkingOnly,
    wheelchairOnly, setWheelchairOnly,
    openLateOnly, setOpenLateOnly,
    acceptsCardOnly, setAcceptsCardOnly,
    neighbourhoodCounts, ratingCounts, serviceCounts,
    englishCount, btsCount, mrtCount, weekendsCount,
    parkingCount, wheelchairCount, openLateCount, acceptsCardCount,
  };

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
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{visibleClinicTotal}</strong> clinics
            {visibleBrandCount > 0 && (
              <> · <strong style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{visibleBrandCount}</strong> brands</>
            )}
          </span>
        </div>
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
            filteredClinics.map((clinic, i) => {
              const displayName = clinic.nameEn || clinic.name;
              const rank = i + 1;
              const bg = PHOTO_BG[i % PHOTO_BG.length];
              const isFeatured = !!clinic.featured;
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
                <Link
                  key={clinic.isBrand ? `brand-${clinic.brandSlug}` : clinic.id}
                  href={href}
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

                    {/* Brand badge (locations count) or Featured badge */}
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
                    )}

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
                        {clinic.isBrand ? 'View all locations' : 'View clinic'}
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
