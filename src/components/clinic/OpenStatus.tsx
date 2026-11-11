"use client";
import { useEffect, useState } from "react";
import { bangkokClock, isOpenAt, parseHours } from "@/lib/opening-hours";

export default function OpenStatus({ hoursJson }: { hoursJson: string | null }) {
  const [status, setStatus] = useState<"open" | "closed" | null>(null);

  useEffect(() => {
    if (!hoursJson) return;
    const hours = parseHours(hoursJson);
    if (hours) setStatus(isOpenAt(hours, bangkokClock(new Date())) ? "open" : "closed");
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
