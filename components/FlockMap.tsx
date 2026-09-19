"use client";

import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PublicPin } from "@/lib/types";

export function FlockMap({
  pins,
  alreadyPinned,
}: {
  pins: PublicPin[];
  alreadyPinned: boolean;
}) {
  const [query, setQuery] = useState("");
  const [local, setLocal] = useState(pins);
  const [saving, setSaving] = useState(false);
  const [pinned, setPinned] = useState(alreadyPinned);
  const [note, setNote] = useState<string | null>(null);

  const markers = useMemo(() => local, [local]);
  const canDrop = !pinned;

  async function drop() {
    if (!canDrop) return;
    const q = query.trim();
    if (q.length < 2) {
      setNote("Type a city or postal code.");
      return;
    }
    setSaving(true);
    setNote(null);
    const res = await fetch("/api/pin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: q }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.status === 409) {
      setPinned(true);
      setNote("You already dropped a pin.");
      return;
    }
    if (!res.ok) {
      setNote(typeof data.error === "string" ? data.error : "Couldn’t drop that pin.");
      return;
    }
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setLocal((prev) => [{ lat, lng, label: data.label ?? q }, ...prev]);
    }
    setQuery("");
    setPinned(true);
  }

  return (
    <>
      {canDrop && (
        <form
          className="pin-prompt"
          onSubmit={(e) => {
            e.preventDefault();
            drop();
          }}
        >
          <input
            maxLength={80}
            placeholder="City or postal code"
            value={query}
            autoComplete="postal-code"
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="honk" type="submit" disabled={saving}>
            Drop pin
          </button>
        </form>
      )}
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
          {markers.map((p, i) => (
            <CircleMarker
              key={`${p.lat}-${p.lng}-${i}`}
              center={[p.lat, p.lng]}
              radius={8}
              pathOptions={{ color: "#5c4033", fillColor: "#b85c38", fillOpacity: 0.95 }}
            />
          ))}
        </MapContainer>
      </div>
      <p className="map-note">
        {pinned
          ? "You already dropped your pin. One per visitor."
          : "US ZIP, Canadian postal code, or any city. One pin per visitor."}
      </p>
      {note ? <p className="map-note">{note}</p> : null}
    </>
  );
}
