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

export function FlockMap({
  pins,
  alreadyPinned,
}: {
  pins: PublicPin[];
  alreadyPinned: boolean;
}) {
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(null);
  const [label, setLabel] = useState("");
  const [local, setLocal] = useState(pins);
  const [saving, setSaving] = useState(false);
  const [pinned, setPinned] = useState(alreadyPinned);
  const [note, setNote] = useState<string | null>(null);

  const markers = useMemo(() => local, [local]);
  const canDrop = !pinned;

  async function drop() {
    if (!draft || !canDrop) return;
    setSaving(true);
    setNote(null);
    const body = { lat: draft.lat, lng: draft.lng, label: label.trim() || undefined };
    const res = await fetch("/api/pin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.status === 409) {
      setPinned(true);
      setDraft(null);
      setNote("You already dropped a pin.");
      return;
    }
    if (!res.ok) {
      setNote("Pin didn’t stick. Try once more.");
      return;
    }
    setLocal((prev) => [{ lat: draft.lat, lng: draft.lng, label: label.trim() || null }, ...prev]);
    setDraft(null);
    setLabel("");
    setPinned(true);
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
          {canDrop ? <ClickCatch onPick={(lat, lng) => setDraft({ lat, lng })} /> : null}
          {markers.map((p, i) => (
            <CircleMarker
              key={`${p.lat}-${p.lng}-${i}`}
              center={[p.lat, p.lng]}
              radius={8}
              pathOptions={{ color: "#5c4033", fillColor: "#b85c38", fillOpacity: 0.95 }}
            />
          ))}
          {draft && canDrop && (
            <CircleMarker
              center={[draft.lat, draft.lng]}
              radius={10}
              pathOptions={{ color: "#a67c52", fillColor: "#c9a882", fillOpacity: 1 }}
            />
          )}
        </MapContainer>
      </div>
      {draft && canDrop && (
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
      <p className="map-note">
        {pinned
          ? "You already dropped your pin. One per visitor."
          : "Tap once. One pin per visitor."}
      </p>
      {note ? <p className="map-note">{note}</p> : null}
    </>
  );
}
