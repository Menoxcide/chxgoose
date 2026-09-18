# Silly Billy Porch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a phone-first single page at https://chxgoose.com for Billy the porch goose: daily joke, dollar-vote outfits via Stripe Checkout, flock map, illustrated Billy.

**Architecture:** Next.js App Router on Vercel. Pure race logic in `lib/race.ts` (unit-tested). Neon Postgres is the source of truth for pots, honks, pins, and wearing. Stripe Checkout Sessions + webhook increment pots. Leaflet map is client-only. Page still renders Billy + joke if the DB is down.

**Tech Stack:** Next.js (App Router, TypeScript), CSS custom properties (no shadcn, no Inter), Stripe SDK `2026-06-24.dahlia`, `@neondatabase/serverless`, Leaflet, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-18-chxgoose-porch-design.md`

## Global Constraints

- Timezone: `America/Detroit` for race dates, jokes, rollover.
- Voice: *Honk* not Submit. Never “Donate today.”
- Vote outfits: `rain-hat`, `tigers`, `santa`, `swimsuit`, `flannel`, `life-jacket`, `snowsuit`, `tuxedo`. `bowtie` is wearing-now fallback only.
- Amounts: 300, 700, 2100 cents only.
- No `payment_method_types` on Stripe calls.
- Webhook is the only pot increment; idempotent on `stripe_session_id`.
- Domain: `chxgoose.com` on team `menoxcides-projects`.
- Buttons and copy stay silly billy.

## Files

```
lib/detroit.ts          raceDate(), dayOfYear()
lib/outfits.ts          catalog + amounts
lib/jokes.ts            ≥31 one-liners
lib/race.ts             leader, applyHonk, rollover
lib/db.ts               neon sql + schema ensure
lib/state.ts            load public state, lazy rollover
lib/stripe.ts           checkout session + webhook verify
app/layout.tsx          fonts, metadata
app/globals.css         tokens
app/page.tsx            server page
app/api/checkout/route.ts
app/api/stripe/route.ts
app/api/pin/route.ts
app/api/state/route.ts
app/api/rollover/route.ts
app/api/dressed/route.ts
components/Porch.tsx    client island: wardrobe, map, overlay
components/FlockMap.tsx
public/billy/<id>.png   9 illustrated Billeys
vercel.json             cron + www redirect handled in next.config
```

---

### Task 1: Race engine (pure)

**Files:**
- Create: `lib/detroit.ts`, `lib/outfits.ts`, `lib/race.ts`, `lib/detroit.test.ts`, `lib/outfits.test.ts`, `lib/race.test.ts`, `vitest.config.ts`, `package.json` scripts

**Interfaces:**
- Produces: `VOTE_OUTFIT_IDS`, `AMOUNTS`, `isVoteOutfit`, `isAmount`, `raceDate(now)`, `applyHonk(pots, outfitId, amountCents, at)`, `leader(pots)`, `rollover(wearing, pots)`

- [ ] **Step 1: Write failing tests** for allowlists, Detroit date, applyHonk increments, tie-break via `leadingSince`, rollover empty keeps wearing, rollover winner becomes wearing.

- [ ] **Step 2: Run tests, confirm fail**

- [ ] **Step 3: Implement `lib/detroit.ts`, `lib/outfits.ts`, `lib/race.ts`**

```ts
export const VOTE_OUTFIT_IDS = [
  "rain-hat", "tigers", "santa", "swimsuit",
  "flannel", "life-jacket", "snowsuit", "tuxedo",
] as const;
export type VoteOutfitId = (typeof VOTE_OUTFIT_IDS)[number];
export const DEFAULT_OUTFIT = "bowtie";
export const AMOUNTS = [300, 700, 2100] as const;

export type Pot = {
  outfitId: VoteOutfitId;
  amountCents: number;
  leadingSince: string | null;
};

export function applyHonk(pots: Pot[], outfitId: VoteOutfitId, amountCents: number, at: Date): Pot[]
export function leader(pots: Pot[]): VoteOutfitId | null
export function rollover(wearing: string, pots: Pot[]): { wearing: string; pots: Pot[] }
```

Leader = max `amountCents` > 0; ties → earliest `leadingSince`. `applyHonk` sets `leadingSince` only when the outfit is now **strictly** ahead.

- [ ] **Step 4: Tests pass**

- [ ] **Step 5: Commit** `test: race engine for dollar-vote outfits`

---

### Task 2: Next.js porch shell + look

**Files:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/page.module.css`, `lib/jokes.ts`

**Look (locked):**
- Palette: `--wood: #5C3A21`, `--cream: #F7E7C7`, `--goose: #F4B942`, `--beak: #E4572E`, `--lake: #2B6B8A`, `--night: #1C140F`
- Display: **Titan One**. Body: **Nunito**. Data: **IBM Plex Mono**.
- Signature: Billy at hero scale with a slow bob; a porch-bulb glow behind him. Not a startup hero with gradient orbs.

- [ ] Scaffold Next.js (TS, App Router, no src dir, eslint). Add fonts via `next/font/google`.
- [ ] Static page: “You found Billy.” / “905 Bridge · porch goose · honk.” Joke from `jokeOfTheDay`. 8 outfit name cards (art later). Map placeholder. Footer honk count 0.
- [ ] `prefers-reduced-motion` disables bob.
- [ ] Commit `feat: porch shell with silly billy type and tokens`

---

### Task 3: Illustrated Billy (edit-chain)

**Files:** `public/billy/bowtie.png` plus 8 vote outfits.

- [ ] Generate canonical Billy (`image_gen`, 1:1): plastic porch goose, cream body, orange beak, round black eye, tiny bow tie, front 3/4, isolated on warm porch-cream, stylized painted illustration, clean silhouette.
- [ ] For each vote outfit, `image_edit` from the bowtie original: freeze pose/framing/goose; change only clothes. Keep style words.
- [ ] Verify identity: same beak, eye, body shape. Flag defects; retry once per miss.
- [ ] Wire hero + cards to `/billy/<id>.png`.
- [ ] Commit `feat: illustrated Billy wardrobe`

---

### Task 4: DB + public state

**Files:** `lib/db.ts`, `lib/state.ts`, `app/api/state/route.ts`, `app/api/rollover/route.ts`

Schema as spec. `ensureSchema()` on first connect. `loadState()` lazy-rollsover if `race_date` in meta is behind Detroit today. If `DATABASE_URL` missing or query throws, return static fallback (`wearing: bowtie`, empty pots, empty pins, honkCount 0, `degraded: true`).

- [ ] Tests for `loadState` fallback (mock db throw).
- [ ] Implement.
- [ ] Commit `feat: neon state with lazy rollover and degraded fallback`

---

### Task 5: Stripe Checkout + webhook

**Files:** `lib/stripe.ts`, `app/api/checkout/route.ts`, `app/api/stripe/route.ts`

Checkout: validate outfit + amount, `mode: 'payment'`, no `payment_method_types`, metadata `{outfitId, amountCents, raceDate}`, success `/?honk=1`, `integration_identifier: chxgoose_<8 letters>`.

Webhook: verify signature; only `checkout.session.completed`; insert `honks`; on conflict 200; else increment pot + honk_count; update `leading_since` if strictly ahead.

- [ ] Unit test allowlist rejection and duplicate session no-op (in-memory).
- [ ] Commit `feat: stripe checkout and idempotent honks`

---

### Task 6: Flock map + pin API

**Files:** `components/FlockMap.tsx`, `app/api/pin/route.ts`

Leaflet OSM. Tap → POST `{lat,lng,label?}`. Reject missing/out-of-range coords. Label max 40, strip tags. Display most recent 500.

- [ ] Commit `feat: flock map pins`

---

### Task 7: Client porch island

**Files:** `components/Porch.tsx`

Honk on card → amount chips → POST `/api/checkout` → redirect. Failure copy: “Billy didn’t get that honk, try again.” `?honk=1` overlay “Billy felt that” then `replaceState`. If `degraded`, vote/map show “honk later.” `POST /api/dressed` only if we never expose UI (owner curl).

- [ ] Commit `feat: honk flow and overlay`

---

### Task 8: Deploy to chxgoose.com

**Files:** `vercel.json` cron `0 5 * * *` → `/api/rollover`; `.env.example`; README with env list.

- [ ] `vercel link` / create project `chxgoose` on `menoxcides-projects`
- [ ] Assign `chxgoose.com` (and www → apex)
- [ ] Env: Stripe, DATABASE_URL, OWNER_KEY optional
- [ ] `vercel --prod`
- [ ] Confirm HTTP 200 (not DEPLOYMENT_NOT_FOUND). Do not claim live payments until a $3 test honk exists.

---

## Execution

This session: inline (user asked plan and build). Generate Billy in parallel with the race engine and scaffold.
