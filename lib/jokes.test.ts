import { describe, expect, it } from "vitest";
import { DAD_JOKES, MOM_JOKES, formatFetchedJoke, jokeKindFor, jokeOfTheDay } from "./jokes";

describe("jokes", () => {
  it("has at least 31 dad jokes and 31 mom jokes", () => {
    expect(DAD_JOKES.length).toBeGreaterThanOrEqual(31);
    expect(MOM_JOKES.length).toBeGreaterThanOrEqual(31);
  });

  it("alternates dad and mom by Detroit day", () => {
    expect(jokeKindFor(new Date("2026-09-18T16:00:00Z"))).toBe("mom");
    expect(jokeKindFor(new Date("2026-09-19T16:00:00Z"))).toBe("dad");
  });

  it("picks a stable fallback joke for a Detroit day", () => {
    const a = jokeOfTheDay(new Date("2026-09-18T16:00:00Z"));
    const b = jokeOfTheDay(new Date("2026-09-18T20:00:00Z"));
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(10);
  });

  it("formats dad-joke payloads", () => {
    expect(formatFetchedJoke({ joke: "I only know 25 letters of the alphabet. I don't know y." })).toContain(
      "alphabet",
    );
    expect(formatFetchedJoke({ joke: "no" })).toBeNull();
  });
});
