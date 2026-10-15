'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PlanBadges from '@/components/ui/PlanBadges'
import { search, type SearchClinic, type SearchIndex } from '@/lib/search/engine'
import { TREATMENTS, CATEGORY_LABELS } from '@/lib/search/vocab'

const FONT_SANS = "var(--font-dm-sans, 'DM Sans', sans-serif)"
const CITY_NAMES: Record<string, string> = { bangkok: 'Bangkok', phuket: 'Phuket', 'chiang-mai': 'Chiang Mai', pattaya: 'Pattaya' }
const POPULAR = ['Ulthera / HIFU skin lifting', 'Dental implants', 'IVF / ICSI', 'Back and neck pain']
  .map(label => TREATMENTS.find(t => t.label === label))
  .filter((t): t is (typeof TREATMENTS)[number] => Boolean(t))

type Option =
  | { kind: 'link'; icon: '+' | '→'; label: string; sub: string; url: string }
  | { kind: 'clinic'; clinic: SearchClinic; sub: string; url: string }

type Group = { title: string; options: Option[] }

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

/** Wraps the word-start matches of the query words in <strong>. */
function highlight(text: string, query: string): React.ReactNode {
  const qs = query.trim().split(/\s+/).filter(Boolean).map(escapeRe)
  if (!qs.length) return text
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${qs.join('|')})`, 'giu')
  const out: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const start = m.index + m[1].length
    if (start > last) out.push(text.slice(last, start))
    out.push(<strong key={start}>{m[2]}</strong>)
    last = start + m[2].length
    if (m[0].length === 0) re.lastIndex++
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [index, setIndex] = useState<SearchIndex | null>(null)
  const [failed, setFailed] = useState(false)
  const loading = useRef(false)
  const listRef = useRef<HTMLDivElement>(null)

  function loadIndex() {
    if (loading.current || index) return
    loading.current = true
    fetch('/search-index.json')
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((data: SearchIndex) => setIndex(data))
      .catch(() => { setFailed(true); loading.current = false })
  }

  const cityName = (slug: string) => index?.cities.find(c => c.slug === slug)?.name ?? CITY_NAMES[slug] ?? slug
  const linkCity = city || 'bangkok'
  const trimmed = query.trim()

  const groups: Group[] = useMemo(() => {
    if (!trimmed) {
      return [{
        title: 'Popular',
        options: POPULAR.map(t => ({
          kind: 'link', icon: '+', label: t.label,
          sub: `${CATEGORY_LABELS[t.category]} clinics in ${cityName(linkCity)}`,
          url: `/${linkCity}/${t.category}/`,
        })),
      }]
    }
    if (!index) return []
    const res = search(index, trimmed, city)
    const out: Group[] = []
    if (res.treatments.length) out.push({ title: 'Treatments', options: res.treatments.map(t => ({ kind: 'link', icon: '+', label: t.label, sub: t.sub, url: t.url })) })
    if (res.clinics.length) out.push({
      title: 'Clinics',
      options: res.clinics.map(c => {
        const where = [c.d, cityName(c.c)].filter(Boolean).join(', ')
        const rating = c.r != null ? ` · ★ ${c.r} (${(c.v ?? 0).toLocaleString()})` : ''
        return { kind: 'clinic', clinic: c, url: c.u, sub: `${CATEGORY_LABELS[c.k] ?? 'Clinic'} · ${where}${rating}` }
      }),
    })
    if (res.categories.length) out.push({ title: 'Categories', options: res.categories.map(t => ({ kind: 'link', icon: '→', label: t.label, sub: t.sub, url: t.url })) })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, city, index])

  const options = useMemo(() => groups.flatMap(g => g.options), [groups])

  // Reset the highlight whenever the result set changes.
  useEffect(() => { setActive(-1) }, [trimmed, city, index])

  useEffect(() => {
    if (active < 0) return
    document.getElementById(`search-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function go(i: number) {
    const opt = options[i]
    if (!opt) return
    setOpen(false)
    router.push(opt.url)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const n = options.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      if (n) setActive(a => (a + 1) % n)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      if (n) setActive(a => (a <= 0 ? n - 1 : a - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // An option the user arrowed onto (incl. a Popular item) always wins.
    if (active >= 0 && options[active]) { go(active); return }
    // Empty query, index loading/failed, or zero matches → the city page.
    if (!trimmed || !index || options.length === 0) {
      setOpen(false)
      router.push(`/${city || 'bangkok'}/`)
      return
    }
    go(0)
  }

  const liveCities = index?.cities.filter(c => c.count > 0) ?? []
  let optIndex = -1

  return (
    <div
      className="animate-fade-up delay-300"
      style={{ position: 'relative', maxWidth: '640px', margin: '0 auto', opacity: 0, zIndex: 10, textAlign: 'left' }}
    >
      <form
        onSubmit={onSubmit}
        role="search"
        style={{
          display:      'flex',
          alignItems:   'center',
          border:       '1px solid var(--border)',
          borderRadius: open ? '6px 6px 0 0' : '6px',
          background:   'var(--white)',
          boxShadow:    '0 2px 24px rgba(26,71,49,0.06)',
          overflow:     'hidden',
        }}
      >
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); loadIndex() }}
          onFocus={() => { setOpen(true); loadIndex() }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          placeholder="Clinic name, treatment or area — e.g. Ulthera, Asok"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search clinics, treatments or areas"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-listbox"
          aria-activedescendant={open && active >= 0 ? `search-opt-${active}` : undefined}
          style={{
            flex:       1,
            padding:    '0 20px',
            height:     '54px',
            border:     'none',
            outline:    'none',
            fontFamily: FONT_SANS,
            fontSize:   '15px',
            color:      'var(--charcoal)',
            background: 'transparent',
            minWidth:   0,
          }}
        />
        <div className="search-city-divider" style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />
        <select
          className="search-city"
          value={city}
          onChange={e => setCity(e.target.value)}
          aria-label="Select city"
          style={{
            padding:            '0 32px 0 16px',
            height:             '54px',
            border:             'none',
            outline:            'none',
            fontFamily:         FONT_SANS,
            fontSize:           '15px',
            color:              'var(--charcoal-soft)',
            background:         'transparent',
            cursor:             'pointer',
            appearance:         'none',
            WebkitAppearance:   'none',
            backgroundImage:    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8278' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat:   'no-repeat',
            backgroundPosition: 'right 12px center',
            flexShrink:         0,
          }}
        >
          <option value="">All cities</option>
          {liveCities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button
          type="submit"
          className="search-btn"
          style={{
            height:        '54px',
            padding:       '0 28px',
            background:    'var(--green)',
            color:         'var(--white)',
            border:        'none',
            fontFamily:    FONT_SANS,
            fontSize:      '14px',
            fontWeight:    500,
            letterSpacing: '0.04em',
            cursor:        'pointer',
            flexShrink:    0,
            transition:    'background 0.2s',
          }}
        >
          Search
        </button>
      </form>

      {open && (
        <div
          ref={listRef}
          id="search-listbox"
          role="listbox"
          aria-label="Search suggestions"
          style={{
            position:     'absolute',
            top:          '100%',
            left:         0,
            right:        0,
            maxHeight:    '460px',
            overflowY:    'auto',
            background:   'var(--white)',
            border:       '1px solid var(--border)',
            borderTop:    'none',
            borderRadius: '0 0 6px 6px',
            boxShadow:    '0 12px 32px rgba(26,26,26,0.08)',
            zIndex:       50,
            fontFamily:   FONT_SANS,
          }}
        >
          {trimmed && !index ? (
            <div style={emptyStyle}>{failed ? 'Search is unavailable right now — browse by city below.' : 'Loading…'}</div>
          ) : options.length === 0 ? (
            <div style={emptyStyle}>
              No matches for &ldquo;{trimmed}&rdquo;. Try a treatment (e.g. &ldquo;implants&rdquo;) or an area (e.g. &ldquo;Thonglor&rdquo;).
            </div>
          ) : (
            groups.map(g => (
              <div key={g.title} role="group" aria-label={g.title}>
                <div style={groupStyle}>{g.title}</div>
                {g.options.map(opt => {
                  const i = ++optIndex
                  return (
                    <div
                      key={`${g.title}-${opt.url}-${i}`}
                      id={`search-opt-${i}`}
                      role="option"
                      aria-selected={i === active}
                      className="search-opt"
                      onMouseDown={e => { e.preventDefault(); go(i) }}
                      onMouseMove={() => { if (active !== i) setActive(i) }}
                    >
                      {opt.kind === 'clinic' ? (
                        <span
                          aria-hidden="true"
                          style={{
                            width: '40px', height: '30px', borderRadius: '3px', flexShrink: 0,
                            backgroundColor: '#e8e2d9',
                            backgroundImage: opt.clinic.p ? `url(${JSON.stringify(opt.clinic.p)})` : undefined,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                          }}
                        />
                      ) : (
                        <span aria-hidden="true" style={iconStyle}>{opt.icon}</span>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="search-opt-title">
                          <span className="search-opt-name">
                            {highlight(opt.kind === 'clinic' ? opt.clinic.n : opt.label, trimmed)}
                          </span>
                          {opt.kind === 'clinic' && (
                            <span style={{ flexShrink: 0, display: 'inline-flex' }}>
                              <PlanBadges size="sm" tier={opt.clinic.t} topRated={opt.clinic.tr} />
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {opt.sub}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const emptyStyle: React.CSSProperties = { padding: '16px 20px', fontSize: '13.5px', color: 'var(--muted)' }

const groupStyle: React.CSSProperties = {
  fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
  color: 'var(--muted)', padding: '12px 20px 6px',
}

const iconStyle: React.CSSProperties = {
  width: '30px', height: '30px', borderRadius: '50%', background: 'var(--green-pale)', color: 'var(--green)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0,
}
