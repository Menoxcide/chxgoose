const TZ = "America/Detroit";

export function raceDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function previousRaceDate(now: Date = new Date()): string {
  const [year, month, day] = raceDate(now).split("-").map(Number);
  const prior = new Date(Date.UTC(year, month - 1, day));
  prior.setUTCDate(prior.getUTCDate() - 1);
  return prior.toISOString().slice(0, 10);
}

export function dayOfYear(now: Date = new Date()): number {
  const [year, month, day] = raceDate(now).split("-").map(Number);
  const start = Date.UTC(year, 0, 0);
  const current = Date.UTC(year, month - 1, day);
  return (current - start) / 86_400_000;
}
