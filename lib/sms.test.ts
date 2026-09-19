import { describe, expect, it } from "vitest";
import { attMmsEmail, e164 } from "./sms";

describe("e164", () => {
  it("formats a US 10-digit number", () => {
    expect(e164("2313732017")).toBe("+12313732017");
  });

  it("keeps an already international number", () => {
    expect(e164("+1 (231) 373-2017")).toBe("+12313732017");
  });
});

describe("attMmsEmail", () => {
  it("routes a US number through AT&T MMS", () => {
    expect(attMmsEmail("2313732017")).toBe("2313732017@mms.att.net");
  });
});
