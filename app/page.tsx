import { existsSync } from "fs";
import { join } from "path";
import { OUTFIT_META, isOutfit } from "@/lib/outfits";
import { loadState } from "@/lib/state";
import { Porch } from "@/components/Porch";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await loadState();
  const wearing = isOutfit(state.wearing) ? state.wearing : "football";
  const look = OUTFIT_META[wearing];
  const photo = existsSync(join(process.cwd(), "public", "billie.jpg"));

  return (
    <main className="porch">
      <header className="hero">
        <p className="eyebrow">905 Bridge</p>
        <h1>Billie</h1>
        <p className="sub">
          Plastic porch goose. Chip in; the winning look gets ordered and put on her.
        </p>
        {photo ? (
          <img className="portrait" src="/billie.jpg" alt="Billie on the porch at 905 Bridge" />
        ) : null}
        <p className="now">
          On her now: {look.name}
          {look.amazon ? (
            <>
              {" · "}
              <a href={look.amazon} target="_blank" rel="noopener noreferrer">
                Amazon
              </a>
            </>
          ) : null}
        </p>
      </header>

      <p className="joke">{state.joke}</p>

      <Porch state={state} />
    </main>
  );
}
