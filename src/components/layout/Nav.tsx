"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const CITIES = [
  { label: "Bangkok", href: "/bangkok/" },
  { label: "Phuket", href: "/phuket/" },
  { label: "Chiang Mai", href: "/chiang-mai/" },
  { label: "Pattaya", href: "/pattaya/" },
];
const CATEGORIES = [
  { label: "Physiotherapy", href: "/physiotherapy-clinics/" },
  { label: "Dental", href: "/dental-clinics/" },
  { label: "Cosmetic", href: "/cosmetic-clinics/" },
  { label: "Wellness", href: "/wellness-clinics/" },
  { label: "IVF & Fertility", href: "/fertility-clinics/" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  // lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <nav className="main-nav">
      <Link href="/" className="nav-wordmark" aria-label="ThailandClinics — home" onClick={() => setOpen(false)}>
        Thailand<span style={{ fontStyle: "italic" }}>Clinics</span>
      </Link>

      {/* ── Desktop nav ─────────────────────────────────────────── */}
      <div className="nav-desktop">
        <div className="nav-browse-wrapper">
          <button className="nav-link nav-browse-trigger" aria-haspopup="true">
            Browse
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden style={{ marginLeft: "5px" }}><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <div className="nav-browse-dropdown">
            <div>
              <p className="nav-browse-col-title">By city</p>
              {CITIES.map(({ label, href }) => <Link key={label} href={href} className="nav-browse-link">{label}</Link>)}
            </div>
            <div>
              <p className="nav-browse-col-title">By specialty</p>
              {CATEGORIES.map(({ label, href }) => <Link key={label} href={href} className="nav-browse-link">{label}</Link>)}
            </div>
          </div>
        </div>
        <Link href="/guides/" className="nav-link">Guides</Link>
        <Link href="/about/" className="nav-link">About</Link>
        <Link href="/list-your-clinic/" className="nav-cta">List your clinic</Link>
      </div>

      {/* ── Mobile hamburger ────────────────────────────────────── */}
      <button className="nav-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={`nav-burger-icon${open ? " is-open" : ""}`}><i /><i /><i /></span>
      </button>

      {/* ── Mobile menu ─────────────────────────────────────────── */}
      <div className={`nav-mobile${open ? " is-open" : ""}`} onClick={() => setOpen(false)}>
        <div className="nav-mobile-panel" onClick={(e) => e.stopPropagation()}>
          <div className="nav-mobile-group">
            <p className="nav-mobile-title">Cities</p>
            {CITIES.map(({ label, href }) => <Link key={label} href={href} className="nav-mobile-link" onClick={() => setOpen(false)}>{label}</Link>)}
          </div>
          <div className="nav-mobile-group">
            <p className="nav-mobile-title">Specialties</p>
            {CATEGORIES.map(({ label, href }) => <Link key={label} href={href} className="nav-mobile-link" onClick={() => setOpen(false)}>{label}</Link>)}
          </div>
          <div className="nav-mobile-group">
            <Link href="/guides/" className="nav-mobile-link" onClick={() => setOpen(false)}>Guides</Link>
            <Link href="/about/" className="nav-mobile-link" onClick={() => setOpen(false)}>About</Link>
          </div>
          <Link href="/list-your-clinic/" className="nav-mobile-cta" onClick={() => setOpen(false)}>List your clinic →</Link>
        </div>
      </div>
    </nav>
  );
}
