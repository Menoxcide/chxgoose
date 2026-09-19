"use client";

import { useRef, useState } from "react";
import { OUTFIT_META, VOTE_OUTFIT_IDS, type VoteOutfitId } from "@/lib/outfits";

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function PhotoStrip({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [i, setI] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    const n = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    setI(Math.max(0, Math.min(images.length - 1, n)));
  }

  return (
    <div className="photos-wrap">
      <div
        className="photos"
        ref={scroller}
        onScroll={onScroll}
        aria-label={`${alt} photos`}
      >
        {images.map((src) => (
          <img key={src} src={src} alt={alt} draggable={false} />
        ))}
      </div>
      <div className="dots" aria-hidden>
        {images.map((_, n) => (
          <span key={n} className={n === i ? "dot on" : "dot"} />
        ))}
      </div>
    </div>
  );
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
            <PhotoStrip images={meta.images} alt={meta.name} />
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
