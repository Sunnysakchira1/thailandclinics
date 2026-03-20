import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thailand Clinics — Find Verified Dental, Physio & Cosmetic Clinics",
  description:
    "Find verified dental, physiotherapy, cosmetic, and wellness clinics in Bangkok, Phuket, Chiang Mai and Pattaya. Trusted by expats and medical tourists.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://thailandclinics.co"
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
    <html lang="en">
      <body
        className={`${cormorant.variable} ${dmSans.variable}`}
        style={{ fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}
      >
        {children}
      </body>
    </html>
  );
}
