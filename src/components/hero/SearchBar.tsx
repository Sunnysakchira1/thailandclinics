'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const KEYWORD_MAP: Record<string, string[]> = {
  'physiotherapy-clinics': [
    'physio', 'therapy', 'rehab', 'sport', 'injury',
    'back', 'pain', 'shoulder', 'knee', 'spine', 'massage',
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
    'wellness', 'yoga', 'spa', 'meditation',
    'mental', 'stress', 'holistic',
  ],
}

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const category = findCategory(query)
    if (category) {
      router.push(`/${city}/${category}/`)
    } else {
      router.push(`/${city}/`)
    }
  }

  return (
    <div
      className="animate-fade-up delay-300"
      style={{
        display:      'flex',
        alignItems:   'center',
        maxWidth:     '620px',
        margin:       '0 auto',
        border:       '1px solid var(--border)',
        borderRadius: '6px',
        background:   'var(--white)',
        overflow:     'hidden',
        boxShadow:    '0 2px 24px rgba(26,71,49,0.06)',
        opacity:      0,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'contents' as const }}
      >
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Physiotherapy, dental, wellness…"
          autoComplete="off"
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
          <option value="koh-samui">Koh Samui</option>
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
    </div>
  )
}
