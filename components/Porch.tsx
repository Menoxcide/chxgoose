"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { HONK_FAIL } from "@/lib/copy";
import {
  AMOUNT_META,
  AMOUNTS,
  OUTFIT_META,
  type AmountCents,
  type VoteOutfitId,
} from "@/lib/outfits";
import type { PublicState } from "@/lib/types";
import { OutfitCarousel } from "./OutfitCarousel";
import { GuestBook } from "./GuestBook";

const FlockMap = dynamic(() => import("./FlockMap").then((m) => m.FlockMap), {
  ssr: false,
});

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
    const text = "You found Billie! Porch goose at 905 Bridge.";
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
        <h2>Dress Billie</h2>
        <p className="lede">
          Dollar votes. Highest pot gets ordered from Amazon and put on her.
          {winning
            ? ` Right now ${OUTFIT_META[winning].name} is winning.`
            : " First honk starts the race."}
        </p>
        {live.degraded && <p className="warn">Honks are offline.</p>}
        {error && <p className="warn">{error}</p>}
        <p className="swipe-hint">Swipe for looks</p>
        <OutfitCarousel
          winning={winning}
          potMap={potMap}
          degraded={live.degraded}
          busy={busy}
          onHonk={setPick}
        />
      </section>

      <section className="map-block">
        <h2 className="with-mark">
          <img src="/ui/pin.jpg" alt="" />
          Where’d you honk from?
        </h2>
        <p className="lede">
          City or postal code — anywhere in the world.
          {live.flockCount ? ` ${live.flockCount} in the flock.` : ""}
        </p>
        {live.degraded ? (
          <p className="warn">Map is offline.</p>
        ) : (
          <FlockMap pins={live.pins} alreadyPinned={live.alreadyPinned} />
        )}
      </section>

      <GuestBook
        entries={live.guestbook}
        alreadySigned={live.alreadySigned}
        degraded={live.degraded}
      />

      <footer className="footer">
        <p>
          {live.honkCount} honks · 905 Bridge · outfits from Amazon
        </p>
        <button className="share" type="button" onClick={share}>
          Tell someone
        </button>
      </footer>

      {pick && (
        <div className="sheet" role="dialog" aria-label="Choose an amount">
          <div className="sheet-card">
            <h2>Honk for {OUTFIT_META[pick].name}</h2>
            <p className="lede">
              Pick an amount.{" "}
              <a href={OUTFIT_META[pick].amazon} target="_blank" rel="noopener noreferrer">
                See the listing
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
          <div className="overlay-card">
            <img src="/ui/stamp.jpg" alt="" />
            Honk! Billie felt that.
          </div>
        </div>
      )}
    </>
  );
}
