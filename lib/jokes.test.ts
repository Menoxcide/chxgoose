import { describe, expect, it } from "vitest";
import { JOKES, formatFetchedJoke, jokeOfTheDay } from "./jokes";

describe("jokes", () => {
  it("has at least 31 fallback jokes", () => {
    expect(JOKES.length).toBeGreaterThanOrEqual(31);
  });

  it("picks a stable fallback joke for a Detroit day", () => {
    const a = jokeOfTheDay(new Date("2026-09-18T16:00:00Z"));
    const b = jokeOfTheDay(new Date("2026-09-18T20:00:00Z"));
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThan(10);
  });

  it("formats official, jokeapi, and dad-joke payloads", () => {
    expect(
      formatFetchedJoke({
        setup: "Why did the scarecrow win an award?",
        punchline: "He was outstanding in his field.",
      }),
    ).toContain("outstanding in his field");
    expect(
      formatFetchedJoke({
        setup: "I used to be addicted to soap.",
        delivery: "I'm clean now.",
      }),
    ).toContain("clean now");
    expect(formatFetchedJoke({ joke: "I only know 25 letters of the alphabet. I don’t know y." })).toContain(
      "alphabet",
    );
    expect(formatFetchedJoke({ joke: "no" })).toBeNull();
  });
});
