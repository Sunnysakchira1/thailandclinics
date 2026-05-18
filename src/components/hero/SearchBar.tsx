'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const KEYWORD_MAP: Record<string, string[]> = {
  'physiotherapy-clinics': [
    'physio', 'physical therapy', 'rehab', 'sport', 'injury',
    'back pain', 'neck pain', 'knee pain', 'joint pain', 'shoulder', 'knee', 'spine',
  ],
  'dental-clinics': [
    'dental', 'dentist', 'teeth', 'tooth', 'brace',
    'orthodont', 'implant', 'whitening',
  ],
  'cosmetic-clinics': [
    'cosmetic', 'botox', 'filler', 'laser', 'skin',
    'beauty', 'aesthetic', 'face', 'lip',
  ],
  'wellness-clinics': [
    'wellness', 'yoga', 'spa', 'massage', 'meditation',
    'mental', 'stress', 'holistic',
  ],
}

const SPECIALTIES = [
  { slug: 'physiotherapy-clinics', label: 'Physiotherapy clinics' },
  { slug: 'dental-clinics',        label: 'Dental clinics' },
  { slug: 'cosmetic-clinics',      label: 'Cosmetic clinics' },
  { slug: 'wellness-clinics',      label: 'Wellness clinics' },
]

function findCategory(query: string): string | null {
  const lower = query.toLowerCase()
  for (const [slug, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) return slug
  }
  return null
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('bangkok')
  const [showDropdown, setShowDropdown] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setShowDropdown(false)
    const category = findCategory(query)
    if (category) {
      router.push(`/${city}/${category}/`)
    } else {
      router.push(`/${city}/`)
    }
  }

  function handleSpecialtyClick(slug: string) {
    setShowDropdown(false)
    router.push(`/${city}/${slug}/`)
  }

  return (
    <div
      className="animate-fade-up delay-300"
      style={{ position: 'relative', maxWidth: '620px', margin: '0 auto', opacity: 0 }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display:      'flex',
          alignItems:   'center',
          border:       '1px solid var(--border)',
          borderRadius: showDropdown ? '6px 6px 0 0' : '6px',
          background:   'var(--white)',
          overflow:     'hidden',
          boxShadow:    '0 2px 24px rgba(26,71,49,0.06)',
          transition:   'border-radius 0.15s',
        }}
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder="Physiotherapy, dental, wellness…"
          autoComplete="off"
          aria-label="Search for clinics"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          style={{
            flex:       1,
            padding:    '0 20px',
            height:     '54px',
            border:     'none',
            outline:    'none',
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize:   '15px',
            color:      'var(--charcoal)',
            background: 'transparent',
            minWidth:   0,
          }}
        />
        <div style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />
        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          aria-label="Select city"
          style={{
            padding:            '0 32px 0 16px',
            height:             '54px',
            border:             'none',
            outline:            'none',
            fontFamily:         "var(--font-dm-sans, 'DM Sans', sans-serif)",
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
          <option value="bangkok">Bangkok</option>
          <option value="chiang-mai">Chiang Mai</option>
          <option value="phuket">Phuket</option>
          <option value="pattaya">Pattaya</option>
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
            fontFamily:    "var(--font-dm-sans, 'DM Sans', sans-serif)",
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

      {showDropdown && (
        <ul
          role="listbox"
          style={{
            position:        'absolute',
            top:             '100%',
            left:            0,
            right:           0,
            margin:          0,
            padding:         '6px 0',
            listStyle:       'none',
            background:      'var(--white)',
            border:          '1px solid var(--border)',
            borderTop:       'none',
            borderRadius:    '0 0 6px 6px',
            boxShadow:       '0 8px 24px rgba(26,26,26,0.08)',
            zIndex:          50,
          }}
        >
          {SPECIALTIES.map(s => (
            <li key={s.slug} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSpecialtyClick(s.slug) }}
                style={{
                  display:    'block',
                  width:      '100%',
                  padding:    '11px 20px',
                  textAlign:  'left',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize:   '14px',
                  color:      'var(--charcoal)',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--green-pale)'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--green)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none'
                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--charcoal)'
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
