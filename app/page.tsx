import { existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { JsonLd } from "@/components/JsonLd";
import { Porch } from "@/components/Porch";
import { servedSize } from "@/lib/images";
import { PORCH_LOOKS } from "@/lib/looks";
import { OUTFIT_META, isOutfit } from "@/lib/outfits";
import { BOOK_COOKIE, PIN_COOKIE } from "@/lib/pin";
import { wearingLine } from "@/lib/porch";
import { homeJsonLd } from "@/lib/seo";
import { loadState } from "@/lib/state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function Home() {
  const jar = await cookies();
  const state = await loadState(
    new Date(),
    jar.get(PIN_COOKIE)?.value === "1",
    jar.get(BOOK_COOKIE)?.value === "1",
  );
  const wearing = isOutfit(state.wearing) ? state.wearing : "football";
  const look = OUTFIT_META[wearing];
  const onHer = wearingLine(state.wearingCaption, look.name);
  const jpg = existsSync(join(process.cwd(), "public", "billie.jpg"));
  const webp = existsSync(join(process.cwd(), "public", "billie.webp"));
  const photo = jpg || webp;
  const portrait = webp
    ? { src: "/billie.webp", ...servedSize("/billie.webp") }
    : { src: "/billie.jpg", width: 1800, height: 2400 };
  const pot = servedSize("/ui/goose-pot.webp");
  const hang = servedSize("/ui/goose-hang.webp");

  return (
    <main className="porch">
      <JsonLd data={homeJsonLd()} />
      <header className="hero">
        <div className="baskets" aria-hidden="true">
          <img
            src="/ui/goose-pot.webp"
            alt=""
            width={pot.width}
            height={pot.height}
            className="basket"
            decoding="async"
            fetchPriority="low"
          />
          <img
            src="/ui/goose-hang.webp"
            alt=""
            width={hang.width}
            height={hang.height}
            className="basket"
            decoding="async"
            fetchPriority="low"
          />
        </div>
        <p className="eyebrow">905 Bridge · porch goose</p>
        <h1>You found Billie!</h1>
        <p className="sub">
          Plastic, dressed, and taking visitors. Chip in — the winning look gets ordered and put on her.
        </p>
        {photo ? (
          <figure className="polaroid">
            <img
              className="portrait"
              src={portrait.src}
              alt="Billie the porch goose on the porch at 905 Bridge"
              width={portrait.width}
              height={portrait.height}
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>Billie, 905 Bridge. Currently: {onHer}.</figcaption>
          </figure>
        ) : (
          <p className="now">On her now: {onHer}</p>
        )}
        <section className="looks" aria-label="Past looks">
          <h2>Past looks</h2>
          <div className="look-row">
            {PORCH_LOOKS.map((item) => (
              <figure key={item.src} className="look">
                <img
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </header>

      <section className="joke" aria-label="Joke of the day">
        <p className="eyebrow">
          {state.jokeKind === "mom" ? "Mom joke of the day" : "Dad joke of the day"}
        </p>
        <p className="punch">{state.joke}</p>
      </section>

      <Porch state={state} />
    </main>
  );
}
