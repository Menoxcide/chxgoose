# chxgoose.com — Silly Billy the porch goose

**Date:** 2026-09-18
**Repo:** `/root/chxgoose` → https://chxgoose.com
**Status:** approved in conversation, awaiting spec review
**Domain:** already on Vercel team `menoxcides-projects` (registered 2026-09-18, expires 2027-09-18). Not assigned to a project yet.

## Problem

There is a real porch goose at **905 Bridge** in a Michigan vacation town. People walk past it. There is no place for them to land, laugh, chip in, or leave a mark. The domain `chxgoose.com` exists and serves `DEPLOYMENT_NOT_FOUND`.

## Goals

1. A phone-first single page that a sidewalk QR scan can finish in under a minute.
2. The goose has a name and a voice: **Billy**, silly billy, goosy, not corporate.
3. Visitors **vote with dollars** on tomorrow’s outfit. Highest pot wins. The owner dresses the real goose in the morning.
4. Real Stripe Checkout; money actually moves. The browser never increments a pot.
5. A **joke of the day** (one, not an archive).
6. A **flock map**: tap where you’re from; dots accumulate.
7. Extra porch bits that still fit on one page: honk counter, share, a slot for a real photo.

## Non-goals

- Accounts, logins, notifications, outfit history beyond “wearing now” + “winning tomorrow.”
- Multi-page app (Wardrobe / Map / About as separate routes). One URL: `/`.
- Live re-dressing on every payment. The owner is not changing clothes all afternoon.
- Joke archive, merch store, blog, Northern Forge cross-promo, marketing-queue jobs.
- Custom card form (Payment Element). Checkout Session hosted page only.
- Stripe Connect / marketplaces. Direct charges to the owner’s Stripe account.
- Names required on the map. Town/state or a tap is enough.

## Constraints

- **QR is the primary entry.** First paint must make sense on a phone in sun glare. Thumb-sized targets. No hover-only.
- **Timezone is `America/Detroit`.** Midnight there is the rollover.
- **Voice.** Buttons say *Honk*, not *Submit*. Copy is short, dumb, affectionate. Never “Donate today.”
- **Never report a honk that did not pay.** Webhook `checkout.session.completed` is the only pot increment. Idempotent on Stripe session id.
- **Do not invent a town name.** Copy says “905 Bridge” and “a Michigan vacation town.” If a real town is supplied later, it is a one-line copy change.
- **Illustrated Billy on day one.** Distinct outfit art for every look. If `/public/billy-real.jpg` exists, show it as a small “the real goose” still; do not block launch on a photo.
- **Vercel only.** Project deploys to `chxgoose.com`. No JUSTIN/MEG runtime.

---

## 1. Visitor experience

One scrolling page, this order:

1. **Hero.** Giant Billy wearing *today’s* outfit (yesterday’s winner, or the default bow tie if the site is new). Headline: “You found Billy.” Sub: “905 Bridge · porch goose · honk.”
2. **Joke of the day.** One line, one joke. Index = day-of-year in Detroit `%` joke list length.
3. **Dress Billy (dollar vote).** Heading: “Dress Billy tomorrow.” 8 outfit cards. Each card: illustration, name, live pot, a *Honk* button. Tapping opens amount chips, then Stripe Checkout.
4. **Flock map.** Heading: “Where’d you honk from?” Full-width map. Tap to drop a pin. After the tap, an optional 40-character label (e.g. “Traverse City”). No geocoding, no typed-address lookup. Under the map: “N in the flock” (pin count).
5. **Footer.** Share (Web Share API, fallback copy link). All-time paid honks: “N honks.” One sentence that Billy is a real goose on a real porch. No nav.

Success return from Stripe: `/?honk=1` plays a tiny honk moment (overlay + copy “Billy felt that”) then clears the query with `history.replaceState`.

## 2. Wardrobe and money

Fixed catalog. Do not add a CMS in v1.

| id | name | billy wears |
|---|---|---|
| `bowtie` | Bow tie | default / empty-race fallback; not a vote target |
| `rain-hat` | Rain hat | yellow slicker + hat |
| `tigers` | Tigers cap | Detroit Tigers cap |
| `santa` | Santa | red hat + beard |
| `swimsuit` | Swimsuit | tiny trunks + sunglasses |
| `flannel` | Flannel | buffalo plaid |
| `life-jacket` | Life jacket | orange PFD |
| `snowsuit` | Snowsuit | puffy winter suit |
| `tuxedo` | Tuxedo | black tie |

Amounts (USD, set prices, not free-form):

| cents | chip label |
|---|---|
| 300 | $3 nibble of corn |
| 700 | $7 a good honk |
| 2100 | $21 full raincoat |

**Race rules**

- Vote targets are the 8 outfits above. `bowtie` is never on the ballot.
- Each outfit has a pot for the **current race day** (`YYYY-MM-DD` in Detroit).
- Highest pot at rollover wins. Ties break by **first to reach that amount** (`leading_since`). If the race is empty, Billy stays in whatever he is wearing (bow tie on day one).
- **Wearing now** = previous race’s winner (or bow tie).
- **Winning for tomorrow** = current race leader (or “nobody yet — Billy’s in a bow tie until you honk”).

Rollover job: first request after midnight Detroit, or a daily cron hitting `/api/rollover`, is enough. Both must be idempotent for a given `race_date`.

## 3. Architecture

```
phone QR → chxgoose.com
  GET /                 page + current state (wear, pots, joke, pins, honk count)
  POST /api/checkout    { outfitId, amountCents } → Stripe Checkout Session URL
  POST /api/stripe      webhook; verified signature; increment pot
  POST /api/pin         { lat, lng, label? } → flock pin (tap only; no geocoder)
  GET  /api/state       JSON for client refresh after return from Stripe
  POST /api/rollover    idempotent daily lock (cron + lazy)
```

**App:** Next.js on Vercel (App Router). Domain `chxgoose.com` + `www` redirect to apex.

**Payments:** Stripe Checkout Sessions, API version `2026-06-24.dahlia`. No `payment_method_types` (dynamic payment methods). `mode: payment`. Success URL `https://chxgoose.com/?honk=1`, cancel URL `https://chxgoose.com/`. Session metadata: `outfitId`, `amountCents`, `raceDate`. `integration_identifier` set (label + 8 random letters). Restricted secret key (`rk_`) in env; webhook secret in env. Never a secret key in the client.

**Store:** Neon serverless Postgres (one database, this project only).

Tables:

- `races(race_date date primary key, winner_outfit_id text, rolled_at timestamptz)`
- `pots(race_date date, outfit_id text, amount_cents int not null default 0, leading_since timestamptz, primary key (race_date, outfit_id))`
- `honks(stripe_session_id text primary key, race_date date, outfit_id text, amount_cents int, created_at timestamptz)`
- `pins(id uuid primary key, lat double precision, lng double precision, label text, created_at timestamptz)`
- `meta(key text primary key, value text)` — `honk_count`, `wearing_outfit_id`

Webhook writes `honks` first (unique session id). On conflict, return 200 and do nothing. On insert, increment `pots` and `honk_count` in the same transaction, and set `leading_since` if this outfit is now strictly ahead.

**Map:** Leaflet + OSM tiles. No Mapbox token. A pin is a tap (`lat`, `lng`) plus optional `label`. Pins are public. Cap display at the most recent 500 pins; still store all of them. Label max 40 chars, stripped of HTML. No Nominatim / geocoder in v1.

**Jokes:** `lib/jokes.ts` — a static array of ≥31 original, clean, goose/porch/Michigan-vacation one-liners. No network call.

**Art:** generated illustrated Billy per outfit, committed under `public/billy/<id>.png` (or svg/webp). Same goose identity, different clothes. Transparent or porch-colored ground so the hero can layer.

**Owner confirm (tiny):** `POST /api/dressed` with header `x-owner-key` matching `OWNER_KEY`. Sets a `dressed_for` date in `meta` so the page can show “Billy is actually wearing this on the porch today.” If the key is unset, the endpoint 404s and the badge is hidden. No admin UI.

## 4. Error handling

| event | visitor sees |
|---|---|
| Stripe Checkout fails to create | “Billy didn’t get that honk, try again.” Stay on page. |
| Payment cancelled | Back on the porch, no overlay, pots unchanged. |
| Webhook signature bad | 400. Stripe retries. Pots unchanged. |
| Duplicate session | 200. Pots unchanged. |
| Unknown `outfitId` or amount not in {300,700,2100} | 400, no session. |
| Pin missing lat/lng or off the globe | 400. |
| Rollover already done for today | 200 no-op. |
| DB down | Page still renders Billy + joke from static fallback; vote and map buttons show “honk later.” Never a blank white error as the QR landing. |

## 5. Testing

- Unit: race leader + tie-break (`leading_since`); rollover idempotency; amount/outfit allowlists; joke index in Detroit.
- Webhook handler: valid event increments once; replay of the same `session.id` does not double-count.
- Page: outfit cards render 8 vote targets; bow tie is wearing-now only.
- Stripe: test-mode Checkout, then a live key only at go-live. Do not claim live payments work until a $3 test honk is confirmed in the Dashboard.

## 6. Look

Silly and goosy, not a fudge-shop brochure and not a startup landing page. Big type, round shapes, a porch-light palette (warm wood, cream, goose orange, lake blue used as accent not as “brand guidelines”). Motion is small: a bob on Billy, a honk overlay. No glassmorphism kit, no Inter/Roboto defaults, no “AI slop” purple gradients.

## 7. Launch

1. New Vercel project `chxgoose`, assign `chxgoose.com`.
2. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `DATABASE_URL`, `OWNER_KEY` (optional).
3. Stripe webhook endpoint `https://chxgoose.com/api/stripe` for `checkout.session.completed`.
4. Cron `0 5 * * *` (05:00 UTC ≈ midnight EDT, 04:00 UTC in EST) calling `/api/rollover` — plus lazy rollover on GET `/` so DST cannot skip a day.
5. Print a QR to `https://chxgoose.com` for the porch. The site does not host a QR generator in v1.

## Deferred (explicit)

- Real porch photos per outfit.
- Names required on the map. A tap plus optional short label is enough.
- Custom dollar amount.
- Email when a new leader takes tomorrow.
- “I met Billy” postcard download.
- www copy on stickers / a physical guestbook.
