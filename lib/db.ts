import { neon } from "@neondatabase/serverless";
import { emptyPots, leader, type Pot } from "./race";
import { DEFAULT_OUTFIT, isOutfit, isVoteOutfit, type OutfitId } from "./outfits";
import { raceDate } from "./detroit";
import { censorText } from "./censor";
import type { GuestNote } from "./types";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  await sql`CREATE TABLE IF NOT EXISTS races (
    race_date date PRIMARY KEY,
    winner_outfit_id text,
    rolled_at timestamptz
  )`;
  await sql`CREATE TABLE IF NOT EXISTS pots (
    race_date date NOT NULL,
    outfit_id text NOT NULL,
    amount_cents int NOT NULL DEFAULT 0,
    leading_since timestamptz,
    PRIMARY KEY (race_date, outfit_id)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS honks (
    stripe_session_id text PRIMARY KEY,
    race_date date NOT NULL,
    outfit_id text NOT NULL,
    amount_cents int NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS pins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    label text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS meta (
    key text PRIMARY KEY,
    value text
  )`;
  await sql`CREATE TABLE IF NOT EXISTS guestbook (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    note text NOT NULL,
    place text,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
}

export async function readMeta(key: string): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`SELECT value FROM meta WHERE key = ${key}`;
  return (rows[0]?.value as string | undefined) ?? null;
}

export async function writeMeta(key: string, value: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO meta (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = excluded.value
  `;
}

export async function readWearing(): Promise<OutfitId> {
  const v = await readMeta("wearing_outfit_id");
  return v && isOutfit(v) ? v : DEFAULT_OUTFIT;
}

export async function readHonkCount(): Promise<number> {
  const v = await readMeta("honk_count");
  const n = v ? Number(v) : 0;
  return Number.isFinite(n) ? n : 0;
}

export async function readPots(date: string): Promise<Pot[]> {
  const sql = getSql();
  if (!sql) return emptyPots();
  const rows = await sql`
    SELECT outfit_id, amount_cents, leading_since
    FROM pots WHERE race_date = ${date}::date
  `;
  const byId = new Map(
    rows.map((r) => [
      String(r.outfit_id),
      {
        amountCents: Number(r.amount_cents) || 0,
        leadingSince: r.leading_since
          ? new Date(r.leading_since as string).toISOString()
          : null,
      },
    ]),
  );
  return emptyPots().map((p) => {
    const hit = byId.get(p.outfitId);
    return hit
      ? { outfitId: p.outfitId, amountCents: hit.amountCents, leadingSince: hit.leadingSince }
      : p;
  });
}

export async function seedPotsIfMissing(date: string) {
  const sql = getSql();
  if (!sql) return;
  for (const pot of emptyPots()) {
    await sql`
      INSERT INTO pots (race_date, outfit_id, amount_cents)
      VALUES (${date}::date, ${pot.outfitId}, 0)
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function readLifetimePots(): Promise<Pot[]> {
  const sql = getSql();
  if (!sql) return emptyPots();
  const rows = await sql`
    SELECT outfit_id, SUM(amount_cents)::int AS amount_cents, MIN(created_at) AS first_honk
    FROM honks
    GROUP BY outfit_id
  `;
  const byId = new Map(
    rows.map((r) => [
      String(r.outfit_id),
      {
        amountCents: Number(r.amount_cents) || 0,
        leadingSince: r.first_honk ? new Date(r.first_honk as string).toISOString() : null,
      },
    ]),
  );
  return emptyPots().map((p) => {
    const hit = byId.get(p.outfitId);
    return hit
      ? { outfitId: p.outfitId, amountCents: hit.amountCents, leadingSince: hit.leadingSince }
      : p;
  });
}

export async function performRollover(now: Date = new Date()) {
  const sql = getSql();
  if (!sql) return { did: false as const };
  const today = raceDate(now);
  const stored = await readMeta("race_date");
  if (stored === today) return { did: false as const };

  const oldDate = stored;
  if (oldDate) {
    const pots = await readPots(oldDate);
    const win = leader(pots);
    await sql`
      INSERT INTO races (race_date, winner_outfit_id, rolled_at)
      VALUES (${oldDate}::date, ${win}, now())
      ON CONFLICT (race_date) DO NOTHING
    `;
    await seedPotsIfMissing(today);
    for (const pot of pots) {
      if (pot.amountCents <= 0) continue;
      await sql`
        UPDATE pots
        SET amount_cents = ${pot.amountCents},
            leading_since = ${pot.leadingSince}
        WHERE race_date = ${today}::date AND outfit_id = ${pot.outfitId}
      `;
    }
  } else {
    await seedPotsIfMissing(today);
  }

  await writeMeta("race_date", today);
  return { did: true as const, today };
}

export async function recordHonk(input: {
  sessionId: string;
  raceDate: string;
  outfitId: string;
  amountCents: number;
}): Promise<{ inserted: boolean }> {
  const sql = getSql();
  if (!sql) return { inserted: false };
  if (!isVoteOutfit(input.outfitId)) return { inserted: false };

  const inserted = await sql`
    INSERT INTO honks (stripe_session_id, race_date, outfit_id, amount_cents)
    VALUES (${input.sessionId}, ${input.raceDate}::date, ${input.outfitId}, ${input.amountCents})
    ON CONFLICT (stripe_session_id) DO NOTHING
    RETURNING stripe_session_id
  `;
  if (inserted.length === 0) return { inserted: false };

  await sql`
    INSERT INTO pots (race_date, outfit_id, amount_cents, leading_since)
    VALUES (${input.raceDate}::date, ${input.outfitId}, ${input.amountCents}, NULL)
    ON CONFLICT (race_date, outfit_id) DO UPDATE
      SET amount_cents = pots.amount_cents + excluded.amount_cents
  `;

  const pots = await readPots(input.raceDate);
  const thisPot = pots.find((p) => p.outfitId === input.outfitId);
  const maxOther = Math.max(
    0,
    ...pots.filter((p) => p.outfitId !== input.outfitId).map((p) => p.amountCents),
  );
  if (thisPot && thisPot.amountCents > maxOther) {
    const previous = thisPot.amountCents - input.amountCents;
    if (previous <= maxOther) {
      await sql`
        UPDATE pots
        SET leading_since = now()
        WHERE race_date = ${input.raceDate}::date AND outfit_id = ${input.outfitId}
      `;
    }
  }

  const count = (await readHonkCount()) + 1;
  await writeMeta("honk_count", String(count));
  return { inserted: true };
}

export async function insertPin(lat: number, lng: number, label: string | null) {
  const sql = getSql();
  if (!sql) throw new Error("no db");
  await sql`
    INSERT INTO pins (lat, lng, label) VALUES (${lat}, ${lng}, ${label})
  `;
}

export async function readPins() {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`
    SELECT lat, lng, label
    FROM pins
    ORDER BY created_at DESC
    LIMIT 500
  `;
  return rows.map((r) => ({
    lat: Number(r.lat),
    lng: Number(r.lng),
    label: (r.label as string | null) ?? null,
  }));
}

export async function flockCount() {
  const sql = getSql();
  if (!sql) return 0;
  const rows = await sql`SELECT count(*)::int AS n FROM pins`;
  return Number(rows[0]?.n ?? 0);
}

export async function insertGuest(name: string, note: string, place: string | null) {
  const sql = getSql();
  if (!sql) throw new Error("no db");
  await sql`
    INSERT INTO guestbook (name, note, place) VALUES (${name}, ${note}, ${place})
  `;
}

export async function readGuestbook(): Promise<GuestNote[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`
    SELECT name, note, place
    FROM guestbook
    ORDER BY created_at DESC
    LIMIT 80
  `;
  return rows.map((r) => ({
    name: censorText(String(r.name)) || "A visitor",
    note: censorText(String(r.note)),
    place: r.place ? censorText(String(r.place)) || null : null,
  }));
}

export async function markDressed(date: string) {
  await writeMeta("dressed_for", date);
}

export async function dressedFor(): Promise<string | null> {
  return readMeta("dressed_for");
}
