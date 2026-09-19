import { describe, expect, it } from "vitest";
import { e164 } from "./sms";

describe("e164", () => {
  it("formats a US 10-digit number", () => {
    expect(e164("2313732017")).toBe("+12313732017");
  });

  it("keeps an already international number", () => {
    expect(e164("+1 (231) 373-2017")).toBe("+12313732017");
  });
});
