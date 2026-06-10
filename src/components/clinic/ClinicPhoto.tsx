"use client";

import { useState } from "react";

/**
 * Renders a clinic photo with a guaranteed branded fallback.
 *
 * - Real photo URL that loads  → shows the image.
 * - URL missing OR fails to load (e.g. an expired Google `gps-cs-s` URL)
 *   → shows an on-brand gradient + leaf placeholder with the clinic initial.
 *
 * Always absolutely fills its parent, which must be `position: relative`
 * with `overflow: hidden`. This guarantees every clinic shows a functioning
 * image even as Google photo URLs expire over time.
 */

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(150deg, #2a5c40 0%, #1a3d2b 100%)", // green
  "linear-gradient(150deg, #2a4a5c 0%, #1a3040 100%)", // blue
  "linear-gradient(150deg, #5c432a 0%, #3d2d1a 100%)", // earth
  "linear-gradient(150deg, #3a5c2a 0%, #253d1a 100%)", // moss
  "linear-gradient(150deg, #4a3a5c 0%, #2d1a3d 100%)", // plum
];

function pickGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_GRADIENTS[h % PLACEHOLDER_GRADIENTS.length];
}

interface Props {
  url: string | null | undefined;
  name: string;
  /** Show the clinic initial in the placeholder. Default true. */
  showInitial?: boolean;
}

export default function ClinicPhoto({ url, name, showInitial = true }: Props) {
  const [failed, setFailed] = useState(false);

  if (url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  const initial = (name.trim()[0] || "?").toUpperCase();

  return (
    <div
      role="img"
      aria-label={name}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: pickGradient(name),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {/* Brand leaf mark (mirrors the nav / favicon leaf) */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      >
        <path d="M12 22c0 0-7.5-3.75-7.5-11.25a7.5 7.5 0 0 1 15 0C19.5 18.25 12 22 12 22z" />
        <line x1="12" y1="10.5" x2="12" y2="22" strokeWidth="1.1" strokeDasharray="2 1.6" />
      </svg>
      {showInitial && (
        <span
          style={{
            fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
            fontSize: "34px",
            fontWeight: 500,
            lineHeight: 1,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
