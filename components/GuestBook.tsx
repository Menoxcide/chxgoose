"use client";

import { useState, type FormEvent } from "react";
import type { GuestNote } from "@/lib/types";

export function GuestBook({
  entries,
  alreadySigned,
  degraded,
}: {
  entries: GuestNote[];
  alreadySigned: boolean;
  degraded: boolean;
}) {
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [signed, setSigned] = useState(alreadySigned);
  const [list, setList] = useState(entries);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (signed || degraded) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, place, note }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 409) {
      setSigned(true);
      return;
    }
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Couldn’t sign.");
      return;
    }
    setList((prev) => [
      {
        name: data.name ?? (name.trim() || "A visitor"),
        note: data.note ?? note.trim(),
        place: data.place ?? (place.trim() || null),
      },
      ...prev,
    ]);
    setName("");
    setPlace("");
    setNote("");
    setSigned(true);
  }

  return (
    <section className="book">
      <h2>Guestbook</h2>
      <p className="lede">Leave Billie a note. One per visitor.</p>
      {degraded ? (
        <p className="warn">Book is offline.</p>
      ) : signed ? (
        <p className="map-note">You’re in the book. Thanks.</p>
      ) : (
        <form className="book-form" onSubmit={submit}>
          <input
            maxLength={40}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            maxLength={40}
            placeholder="Town (optional)"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
          <textarea
            maxLength={200}
            rows={3}
            placeholder="Saw Billie. Honked."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
          {error ? <p className="warn">{error}</p> : null}
          <button className="honk" type="submit" disabled={busy}>
            Sign
          </button>
        </form>
      )}
      {list.length === 0 ? (
        <p className="map-note">No notes yet. Be first.</p>
      ) : (
        <ul className="book-list">
          {list.map((g, i) => (
            <li key={`${g.name}-${i}`}>
              <p className="book-note">{g.note}</p>
              <p className="book-by">
                {g.name}
                {g.place ? ` · ${g.place}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
