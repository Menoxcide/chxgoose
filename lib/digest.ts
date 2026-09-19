export type DayStats = {
  date: string;
  people: number;
  visits: number;
  honks: number;
  honkCents: number;
  pins: number;
  notes: number;
  winning: string | null;
};

export function formatDigestSms(s: DayStats): string {
  const dollars = Math.round(s.honkCents / 100);
  const lines = [
    `Billie ${s.date}`,
    `${s.visits} visits / ${s.people} people`,
    `${s.honks} honks ($${dollars})`,
    `${s.pins} pin${s.pins === 1 ? "" : "s"} · ${s.notes} note${s.notes === 1 ? "" : "s"}`,
  ];
  if (s.winning) lines.push(`winning: ${s.winning}`);
  return lines.join("\n");
}
