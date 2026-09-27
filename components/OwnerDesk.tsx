"use client";

import { useState } from "react";
import { DEFAULT_OUTFIT, OUTFIT_META, VOTE_OUTFIT_IDS, type OutfitId } from "@/lib/outfits";
import type { OrderStatus, PorchOrder } from "@/lib/porch";

const WEARING_IDS: OutfitId[] = [DEFAULT_OUTFIT, ...VOTE_OUTFIT_IDS];

type Desk = {
  caption: string;
  wearing: OutfitId;
  order: PorchOrder | null;
};

const EMPTY: Desk = { caption: "", wearing: DEFAULT_OUTFIT, order: null };

export function OwnerDesk() {
  const [key, setKey] = useState("");
  const [desk, setDesk] = useState<Desk>(EMPTY);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [orderOutfit, setOrderOutfit] = useState<string>(VOTE_OUTFIT_IDS[0]);
  const [loaded, setLoaded] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function apply(next: Desk) {
    setDesk({
      caption: next.caption ?? "",
      wearing: next.wearing,
      order: next.order,
    });
    setStatus(next.order?.status ?? "");
    setOrderOutfit(next.order?.outfitId ?? VOTE_OUTFIT_IDS[0]);
  }

  async function send(method: "GET" | "POST") {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/owner", {
        method,
        headers: {
          "content-type": "application/json",
          "x-owner-key": key,
        },
        body:
          method === "POST"
            ? JSON.stringify({
                caption: desk.caption,
                wearing: desk.wearing,
                orderOutfitId: orderOutfit,
                orderStatus: status,
              })
            : undefined,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(
          res.status === 404
            ? "Desk is closed."
            : res.status === 401
              ? "That key didn’t fit."
              : (data?.error ?? "Couldn’t save that."),
        );
        setBusy(false);
        return;
      }
      apply(data as Desk);
      setLoaded(true);
      setNote(method === "POST" ? "Saved." : "Loaded.");
    } catch {
      setError("Couldn’t reach the desk.");
    }
    setBusy(false);
  }

  return (
    <form
      className="desk"
      onSubmit={(e) => {
        e.preventDefault();
        void send("POST");
      }}
    >
      <label htmlFor="owner-key">Owner key</label>
      <input
        id="owner-key"
        type="password"
        autoComplete="current-password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />

      <label htmlFor="caption">Caption under the photo</label>
      <input
        id="caption"
        value={desk.caption}
        maxLength={120}
        disabled={!loaded}
        onChange={(e) => setDesk({ ...desk, caption: e.target.value })}
      />
      <p className="hint">Leave this blank to use the outfit name.</p>

      <label htmlFor="wearing">On her</label>
      <select
        id="wearing"
        value={desk.wearing}
        disabled={!loaded}
        onChange={(e) => setDesk({ ...desk, wearing: e.target.value as OutfitId })}
      >
        {WEARING_IDS.map((id) => (
          <option key={id} value={id}>
            {OUTFIT_META[id].name}
          </option>
        ))}
      </select>

      <label htmlFor="order-look">Order</label>
      <select
        id="order-look"
        value={orderOutfit}
        disabled={!loaded}
        onChange={(e) => setOrderOutfit(e.target.value)}
      >
        {VOTE_OUTFIT_IDS.map((id) => (
          <option key={id} value={id}>
            {OUTFIT_META[id].name}
          </option>
        ))}
      </select>
      <label htmlFor="order-status">Where that order is</label>
      <select
        id="order-status"
        value={status}
        disabled={!loaded}
        onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
      >
        <option value="">Nothing yet</option>
        <option value="ordered">Ordered</option>
        <option value="shipping">On the way</option>
        <option value="on_her">On her</option>
      </select>
      <p className="hint">On her also marks that look in the carousel.</p>

      {error ? <p className="warn">{error}</p> : null}
      {note ? <p className="hint">{note}</p> : null}

      <div className="desk-actions">
        <button className="share" type="button" disabled={busy || key.length < 16} onClick={() => void send("GET")}>
          Load
        </button>
        <button className="honk" type="submit" disabled={busy || !loaded}>
          Save
        </button>
      </div>
    </form>
  );
}
