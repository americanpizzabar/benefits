"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MapPoint } from "@/components/LeafletMap";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-border/40 text-sm text-muted">
      …
    </div>
  ),
});

const DEFAULT_CENTER: [number, number] = [35.6595, 139.7005]; // Shibuya

export function MapClient({
  points,
  focusId,
}: {
  points: MapPoint[];
  focusId?: string;
}) {
  const t = useTranslations("Map");
  const focus = points.find((p) => p.id === focusId);
  const [center, setCenter] = useState<[number, number]>(
    focus
      ? [focus.lat, focus.lng]
      : points[0]
        ? [points[0].lat, points[0].lng]
        : DEFAULT_CENTER,
  );
  const [status, setStatus] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) {
      setStatus(t("noLocation"));
      return;
    }
    setStatus(t("locating"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setStatus(null);
      },
      () => setStatus(t("noLocation")),
    );
  }

  return (
    <div>
      <div className="h-[62vh] overflow-hidden">
        <LeafletMap points={points} center={center} />
      </div>
      <div className="px-4 py-3">
        <button
          onClick={locate}
          className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white"
        >
          📍 {t("useMyLocation")}
        </button>
        {status && <p className="mt-2 text-center text-xs text-muted">{status}</p>}
      </div>
    </div>
  );
}
