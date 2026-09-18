"use client";

import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PublicPin } from "@/lib/types";

function ClickCatch({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function FlockMap({ pins }: { pins: PublicPin[] }) {
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null);
  const [label, setLabel] = useState("");
  const [local, setLocal] = useState(pins);
  const [saving, setSaving] = useState(false);

  const markers = useMemo(() => local, [local]);

  async function drop() {
    if (!draft) return;
    setSaving(true);
    const body = { lat: draft.lat, lng: draft.lng, label: label.trim() || undefined };
    const res = await fetch("/api/pin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!res.ok) return;
    setLocal((prev) => [{ lat: draft.lat, lng: draft.lng, label: label.trim() || null }, ...prev]);
    setDraft(null);
    setLabel("");
  }

  return (
    <>
      <div className="map">
        <MapContainer
          center={[44.5, -85.0]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickCatch onPick={(lat, lng) => setDraft({ lat, lng })} />
          {markers.map((p, i) => (
            <CircleMarker
              key={`${p.lat}-${p.lng}-${i}`}
              center={[p.lat, p.lng]}
              radius={8}
              pathOptions={{ color: "#143029", fillColor: "#d63b12", fillOpacity: 0.95 }}
            />
          ))}
          {draft && (
            <CircleMarker
              center={[draft.lat, draft.lng]}
              radius={10}
              pathOptions={{ color: "#e3b23c", fillColor: "#e3b23c", fillOpacity: 1 }}
            />
          )}
        </MapContainer>
      </div>
      {draft && (
        <div className="pin-prompt">
          <input
            maxLength={40}
            placeholder="Town (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button className="honk" type="button" disabled={saving} onClick={drop}>
            Drop pin
          </button>
        </div>
      )}
      <p className="map-note">Tap the map. Label optional.</p>
    </>
  );
}
