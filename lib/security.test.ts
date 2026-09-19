import { describe, expect, it } from "vitest";
import { cleanText, looksLikePlaceQuery, rateLimit, safeEqual } from "./security";

describe("cleanText", () => {
  it("strips tags and control chars", () => {
    expect(cleanText("<script>x</script>hi", 40)).toBe("xhi");
    expect(cleanText("a\u0000b", 40)).toBe("ab");
  });
});

describe("looksLikePlaceQuery", () => {
  it("allows cities and zips", () => {
    expect(looksLikePlaceQuery("49720")).toBe(true);
    expect(looksLikePlaceQuery("Charlevoix")).toBe(true);
    expect(looksLikePlaceQuery("M5V 2T6")).toBe(true);
    expect(looksLikePlaceQuery("東京")).toBe(true);
  });
  it("rejects urls and junk", () => {
    expect(looksLikePlaceQuery("https://evil.com")).toBe(false);
    expect(looksLikePlaceQuery("a")).toBe(false);
    expect(looksLikePlaceQuery("foo<script>")).toBe(false);
  });
});

describe("safeEqual", () => {
  it("matches equal secrets", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "ab")).toBe(false);
  });
});

describe("rateLimit", () => {
  it("trips after max hits", () => {
    const key = `t-${Date.now()}-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });
});
