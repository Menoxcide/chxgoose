import { OUTFIT_META, isOutfit } from "@/lib/outfits";
import { loadState } from "@/lib/state";
import { Porch } from "@/components/Porch";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await loadState();
  const wearing = isOutfit(state.wearing) ? state.wearing : "bowtie";
  const art = OUTFIT_META[wearing];

  return (
    <main className="porch">
      <div className="rail" />
      <header className="hero">
        <p className="eyebrow">905 Bridge · porch goose · honk</p>
        <h1>You found Billy</h1>
        <p className="sub">Silly billy. A real goose on a real porch in a Michigan vacation town.</p>
        <div className="billy-wrap">
          <img className="billy" src={art.src} alt={`Billy wearing ${art.name}`} />
        </div>
        {state.dressedToday ? (
          <span className="badge">Billy is actually wearing this on the porch today</span>
        ) : (
          <span className="badge">Wearing now: {art.name}</span>
        )}
      </header>

      <section className="joke" aria-label="Joke of the day">
        <p className="eyebrow">joke of the day</p>
        <p>{state.joke}</p>
      </section>

      <Porch state={state} />
    </main>
  );
}
