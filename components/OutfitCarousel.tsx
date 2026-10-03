"use client";

import { servedSize } from "@/lib/images";
import { OUTFIT_META, VOTE_OUTFIT_IDS, type OutfitId, type VoteOutfitId } from "@/lib/outfits";
import { outfitAlt } from "@/lib/seo";

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export function OutfitCarousel({
  wearing,
  winning,
  potMap,
  degraded,
  busy,
  onHonk,
}: {
  wearing: OutfitId;
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
            <img
              className="slide-photo"
              src={meta.image}
              alt={outfitAlt(meta.name)}
              width={servedSize(meta.image).width}
              height={servedSize(meta.image).height}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            <div className="slide-meta">
              <div className="name">
                {meta.name}
                {id === wearing ? <span className="now-tag">on her now</span> : null}
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
