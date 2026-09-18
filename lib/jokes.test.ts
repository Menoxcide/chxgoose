import { describe, expect, it } from "vitest";
import { JOKES, jokeOfTheDay } from "./jokes";

describe("jokes", () => {
  it("has at least 31 jokes", () => {
    expect(JOKES.length).toBeGreaterThanOrEqual(31);
  });

  it("picks a stable joke for a Detroit day", () => {
    const a = jokeOfTheDay(new Date("2026-09-18T16:00:00Z"));
    const b = jokeOfTheDay(new Date("2026-09-18T20:00:00Z"));
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(10);
  });
});
