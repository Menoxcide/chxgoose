import { describe, expect, it } from "vitest";
import { hasPinCookie } from "./pin";

describe("hasPinCookie", () => {
  it("is false with no cookie", () => {
    expect(hasPinCookie(null)).toBe(false);
    expect(hasPinCookie("")).toBe(false);
  });

  it("finds billie_pin=1 among other cookies", () => {
    expect(hasPinCookie("sid=abc; billie_pin_v2=1; theme=tan")).toBe(true);
  });

  it("ignores a different value", () => {
    expect(hasPinCookie("billie_pin_v2=0")).toBe(false);
  });
});
