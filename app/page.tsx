import { existsSync } from "fs";
import { join } from "path";
import { cookies } from "next/headers";
import { OUTFIT_META, isOutfit } from "@/lib/outfits";
import { BOOK_COOKIE, PIN_COOKIE } from "@/lib/pin";
import { loadState } from "@/lib/state";
import { Porch } from "@/components/Porch";

export const dynamic = "force-dynamic";

export default async function Home() {
  const jar = await cookies();
  const state = await loadState(
    new Date(),
    jar.get(PIN_COOKIE)?.value === "1",
    jar.get(BOOK_COOKIE)?.value === "1",
  );
  const wearing = isOutfit(state.wearing) ? state.wearing : "football";
  const look = OUTFIT_META[wearing];
  const photo = existsSync(join(process.cwd(), "public", "billie.jpg"));

  return (
    <main className="porch">
      <header className="hero">
        <p className="eyebrow">905 Bridge · porch goose</p>
        <h1>You found Billie!</h1>
        <p className="sub">
          Plastic, dressed, and taking visitors. Chip in — the winning look gets ordered and put on her.
        </p>
        {photo ? (
          <figure className="polaroid">
            <img className="portrait" src="/billie.jpg" alt="Billie on the porch at 905 Bridge" />
            <figcaption>Billie, 905 Bridge. Currently: {look.name}.</figcaption>
          </figure>
        ) : (
          <p className="now">On her now: {look.name}</p>
        )}
      </header>

      <section className="joke" aria-label="Joke of the day">
        <p className="eyebrow">Joke of the day</p>
        <p className="punch">{state.joke}</p>
      </section>

      <Porch state={state} />
    </main>
  );
}
