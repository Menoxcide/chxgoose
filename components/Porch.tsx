"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { HONK_FAIL } from "@/lib/copy";
import {
  AMOUNT_META,
  AMOUNTS,
  OUTFIT_META,
  VOTE_OUTFIT_IDS,
  type AmountCents,
  type VoteOutfitId,
} from "@/lib/outfits";
import type { PublicState } from "@/lib/types";

const FlockMap = dynamic(() => import("./FlockMap").then((m) => m.FlockMap), {
  ssr: false,
});

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function Porch({ state }: { state: PublicState }) {
  const [live, setLive] = useState(state);
  const [pick, setPick] = useState<VoteOutfitId | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honked, setHonked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("honk") === "1") {
      setHonked(true);
      fetch("/api/state")
        .then((r) => r.json())
        .then((s: PublicState) => setLive(s))
        .catch(() => {});
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const winning = live.winning;
  const potMap = useMemo(() => {
    return new Map(live.pots.map((p) => [p.outfitId, p.amountCents]));
  }, [live.pots]);

  async function checkout(outfitId: VoteOutfitId, amountCents: AmountCents) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ outfitId, amountCents }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? HONK_FAIL);
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError(HONK_FAIL);
      setBusy(false);
    }
  }

  async function share() {
    const url = "https://chxgoose.com";
    const text = "Billie the porch goose, 905 Bridge.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Billie", text, url });
        return;
      }
    } catch {
      /* fall through */
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <>
      <section>
        <h2>Next outfit</h2>
        <p className="lede">
          Highest pot wins. We order that Amazon listing and put it on her.
          {winning
            ? ` Leading: ${OUTFIT_META[winning].name}.`
            : " Nothing leading yet."}
        </p>
        {live.degraded && <p className="warn">Honks are offline.</p>}
        {error && <p className="warn">{error}</p>}
        <ul className="order">
          {VOTE_OUTFIT_IDS.map((id) => (
            <li key={id} className={id === winning ? "row lead" : "row"}>
              <span className="name">
                {OUTFIT_META[id].name}
                <a
                  href={OUTFIT_META[id].amazon}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Amazon
                </a>
              </span>
              <span className="pot">{dollars(potMap.get(id) ?? 0)}</span>
              <button
                className="honk"
                disabled={live.degraded || busy}
                onClick={() => setPick(id)}
              >
                Honk
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="map-block">
        <h2>Where from?</h2>
        <p className="lede">{live.flockCount} pins.</p>
        {live.degraded ? (
          <p className="warn">Map is offline.</p>
        ) : (
          <FlockMap pins={live.pins} />
        )}
      </section>

      <footer className="footer">
        <p>
          {live.honkCount} honks · 905 Bridge · outfits from Amazon
        </p>
        <button className="share" type="button" onClick={share}>
          Share
        </button>
      </footer>

      {pick && (
        <div className="sheet" role="dialog" aria-label="Choose an amount">
          <div className="sheet-card">
            <h2>{OUTFIT_META[pick].name}</h2>
            <p className="lede">
              Goes on the pot. Listing:{" "}
              <a href={OUTFIT_META[pick].amazon} target="_blank" rel="noopener noreferrer">
                Amazon
              </a>
            </p>
            <div className="chips">
              {AMOUNTS.map((cents) => (
                <button
                  key={cents}
                  className="chip"
                  disabled={busy}
                  onClick={() => checkout(pick, cents)}
                >
                  {AMOUNT_META[cents].dollars}
                </button>
              ))}
            </div>
            <button className="ghost" type="button" onClick={() => setPick(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {honked && (
        <div className="overlay" onClick={() => setHonked(false)} role="status">
          <div className="overlay-card">Paid. It’s on the pot.</div>
        </div>
      )}
    </>
  );
}
