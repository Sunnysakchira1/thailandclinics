"use client";
import { useEffect, useState } from "react";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function toMinutes(t: string): number {
  const m = t.trim().match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = parseInt(m[2] ?? "0");
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

export default function OpenStatus({ hoursJson }: { hoursJson: string | null }) {
  const [status, setStatus] = useState<"open" | "closed" | null>(null);

  useEffect(() => {
    if (!hoursJson) return;
    try {
      const hours = JSON.parse(hoursJson) as Record<string, string>;
      const now   = new Date();
      // Bangkok = UTC+7
      const bkk   = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60_000);
      const today = DAYS[bkk.getDay()];
      const raw   = hours[today];
      if (!raw || raw.toLowerCase() === "closed") { setStatus("closed"); return; }
      const [openStr, closeStr] = raw.replace(/\s/g, "").split("-");
      const openMin  = toMinutes(openStr ?? "");
      const closeMin = toMinutes(closeStr ?? "");
      const nowMin   = bkk.getHours() * 60 + bkk.getMinutes();
      setStatus(openMin >= 0 && nowMin >= openMin && nowMin < closeMin ? "open" : "closed");
    } catch { /* ignore */ }
  }, [hoursJson]);

  if (!status) return null;
  const isOpen = status === "open";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      fontFamily: "var(--font-dm-sans,'DM Sans',sans-serif)",
      fontSize: "13px", fontWeight: 500,
      color: isOpen ? "var(--open)" : "#b04040",
    }}>
      <span style={{
        width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0,
        background: isOpen ? "var(--open)" : "#b04040",
      }} />
      {isOpen ? "Open now" : "Closed now"}
    </span>
  );
}
