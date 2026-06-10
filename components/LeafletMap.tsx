"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "@/i18n/navigation";

export type MapPoint = {
  id: string;
  title: string;
  vendor: string | null;
  lat: number;
  lng: number;
};

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LeafletMap({
  points,
  center,
}: {
  points: MapPoint[];
  center: [number, number];
}) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <Recenter center={center} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={11}
          pathOptions={{
            color: "#c8492f",
            fillColor: "#ff6a4d",
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            <Link href={`/benefit/${p.id}`} className="font-semibold text-brand-ink">
              {p.title}
            </Link>
            {p.vendor && <div className="text-xs text-muted">{p.vendor}</div>}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
