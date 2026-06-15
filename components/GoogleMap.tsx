"use client";

import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { Link } from "@/i18n/navigation";

export type MapPoint = {
  id: string;
  title: string;
  vendor: string | null;
  lat: number;
  lng: number;
};

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map?.panTo({ lat: center[0], lng: center[1] });
  }, [map, center]);
  return null;
}

export default function GoogleMap({
  points,
  center,
}: {
  points: MapPoint[];
  center: [number, number];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = points.find((p) => p.id === activeId) ?? null;

  if (!API_KEY) {
    return (
      <div className="grid h-full place-items-center bg-border/40 px-6 text-center text-sm text-muted">
        Google Maps is not configured — set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        defaultCenter={{ lat: center[0], lng: center[1] }}
        defaultZoom={14}
        gestureHandling="greedy"
        clickableIcons={false}
        style={{ height: "100%", width: "100%" }}
      >
        <Recenter center={center} />
        {points.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => setActiveId(p.id)}
          />
        ))}
        {active && (
          <InfoWindow
            position={{ lat: active.lat, lng: active.lng }}
            onCloseClick={() => setActiveId(null)}
          >
            <Link
              href={`/benefit/${active.id}`}
              className="font-semibold text-brand-ink"
            >
              {active.title}
            </Link>
            {active.vendor && (
              <div className="text-xs text-muted">{active.vendor}</div>
            )}
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
