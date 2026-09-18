"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
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
    const m = new Map(live.pots.map((p) => [p.outfitId, p.amountCents]));
    return m;
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
        setError(data.error ?? "Billy didn’t get that honk, try again.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Billy didn’t get that honk, try again.");
      setBusy(false);
    }
  }

  async function share() {
    const url = "https://chxgoose.com";
    const text = "I found Billy the porch goose.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "chxgoose", text, url });
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
        <h2>Dress Billy tomorrow</h2>
        <p className="lede">
          Highest pot wins. Owner dresses the real goose in the morning.
          {winning
            ? ` Winning right now: ${OUTFIT_META[winning].name}.`
            : " Nobody yet — Billy’s in a bow tie until you honk."}
        </p>
        {live.degraded && (
          <p className="warn">Honk later — the porch ledger is napping.</p>
        )}
        {error && <p className="warn">{error}</p>}
        <div className="grid">
          {VOTE_OUTFIT_IDS.map((id) => (
            <article key={id} className={id === winning ? "card leader" : "card"}>
              <img src={OUTFIT_META[id].src} alt={OUTFIT_META[id].name} />
              <h3>{OUTFIT_META[id].name}</h3>
              <p className="pot">{dollars(potMap.get(id) ?? 0)} in the pot</p>
              <button
                className="honk"
                disabled={live.degraded || busy}
                onClick={() => setPick(id)}
              >
                Honk
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="map-block">
        <h2>Where’d you honk from?</h2>
        <p className="lede">Tap the map. Optional tiny label. {live.flockCount} in the flock.</p>
        {live.degraded ? (
          <p className="warn">Map’s napping. Honk later.</p>
        ) : (
          <FlockMap pins={live.pins} />
        )}
      </section>

      <footer className="footer">
        <p>
          {live.honkCount} honks · Billy is a real goose on a real porch.
        </p>
        <button className="share" type="button" onClick={share}>
          Share Billy
        </button>
      </footer>

      {pick && (
        <div className="sheet" role="dialog" aria-label="Pick a honk">
          <div className="sheet-card">
            <h2>Honk for {OUTFIT_META[pick].name}</h2>
            <p className="lede">Pick a silly amount. Stripe takes it from here.</p>
            <div className="chips">
              {AMOUNTS.map((cents) => (
                <button
                  key={cents}
                  className="chip"
                  disabled={busy}
                  onClick={() => checkout(pick, cents)}
                >
                  <strong>
                    {AMOUNT_META[cents].dollars} · {AMOUNT_META[cents].label}
                  </strong>
                </button>
              ))}
            </div>
            <button className="ghost" type="button" onClick={() => setPick(null)}>
              never mind
            </button>
          </div>
        </div>
      )}

      {honked && (
        <div className="overlay" onClick={() => setHonked(false)} role="status">
          <div className="overlay-card">Billy felt that</div>
        </div>
      )}
    </>
  );
}
