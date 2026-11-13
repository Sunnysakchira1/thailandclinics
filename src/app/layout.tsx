import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import SiteFooter from "@/components/layout/SiteFooter";

// Self-hosted (latin subset, variable weight 300–600). next/font/google broke on
// Cloudflare's build servers, where Google returns /l/font?kit=…&skey=… URLs Turbopack can't parse.
const cormorant = localFont({
  variable: "--font-cormorant",
  src: [
    { path: "../fonts/CormorantGaramond-normal.woff2", weight: "300 600", style: "normal" },
    { path: "../fonts/CormorantGaramond-italic.woff2", weight: "300 600", style: "italic" },
  ],
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const dmSans = localFont({
  variable: "--font-dm-sans",
  src: [
    { path: "../fonts/DMSans-normal.woff2", weight: "300 600", style: "normal" },
    { path: "../fonts/DMSans-italic.woff2", weight: "300 600", style: "italic" },
  ],
  display: "swap",
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "Thailand Clinics — Find Verified Dental, Physio & Cosmetic Clinics",
  description:
    "Find verified dental, physiotherapy, cosmetic, and wellness clinics in Bangkok, Phuket, Chiang Mai and Pattaya. Trusted by expats and medical tourists.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailand-clinics.com"
  ),
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body
        style={{ fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}
      >
        {children}
        <SiteFooter />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DS28XT8TPY"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-DS28XT8TPY');
        `}</Script>
      </body>
    </html>
  );
}
