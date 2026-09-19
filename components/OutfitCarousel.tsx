"use client";

import { OUTFIT_META, VOTE_OUTFIT_IDS, type VoteOutfitId } from "@/lib/outfits";

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function OutfitCarousel({
  winning,
  potMap,
  degraded,
  busy,
  onHonk,
}: {
  winning: VoteOutfitId | null;
  potMap: Map<VoteOutfitId, number>;
  degraded: boolean;
  busy: boolean;
  onHonk: (id: VoteOutfitId) => void;
}) {
  return (
    <div className="carousel" aria-label="Billie outfits">
      {VOTE_OUTFIT_IDS.map((id) => {
        const meta = OUTFIT_META[id];
        return (
          <article key={id} className={id === winning ? "slide lead" : "slide"}>
            <img className="slide-photo" src={meta.image} alt={meta.name} draggable={false} />
            <div className="slide-meta">
              <div className="name">
                {meta.name}
                {id === winning ? <span className="lead-tag">winning</span> : null}
                <a href={meta.amazon} target="_blank" rel="noopener noreferrer">
                  Amazon
                </a>
              </div>
              <span className="pot">{dollars(potMap.get(id) ?? 0)}</span>
              <button
                className="honk"
                disabled={degraded || busy}
                onClick={() => onHonk(id)}
              >
                Honk
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
