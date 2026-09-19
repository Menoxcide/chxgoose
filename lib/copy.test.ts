import { describe, expect, it } from "vitest";
import { HONK_CHECKOUT_NOTE, HONK_DISCLAIMER } from "./copy";

describe("honk legal copy", () => {
  it("says gifts are not tax-deductible and not refundable", () => {
    expect(HONK_DISCLAIMER).toMatch(/not tax-deductible/i);
    expect(HONK_DISCLAIMER).toMatch(/no refunds/i);
    expect(HONK_CHECKOUT_NOTE).toMatch(/no refunds/i);
  });
});
