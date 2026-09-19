import { describe, expect, it } from "vitest";
import { geocodeAttempts, labelFromNominatim, parseNominatim } from "./geocode";

describe("geocode", () => {
  it("shortens a Nominatim display name", () => {
    expect(
      labelFromNominatim("Charlevoix, Charlevoix County, Michigan, 49720, United States", "49720"),
    ).toBe("Charlevoix, Charlevoix County");
  });

  it("parses the first hit", () => {
    const hit = parseNominatim(
      [{ lat: "45.318", lon: "-85.258", display_name: "Charlevoix, Michigan, USA" }],
      "49720",
    );
    expect(hit?.lat).toBeCloseTo(45.318);
    expect(hit?.lng).toBeCloseTo(-85.258);
    expect(hit?.label).toBe("Charlevoix, Michigan");
  });

  it("rejects empty results", () => {
    expect(parseNominatim([], "nowhere")).toBeNull();
  });

  it("tries US ZIP before a free-text search", () => {
    const urls = geocodeAttempts("49720").map((u) => u.searchParams.toString());
    expect(urls[0]).toContain("postalcode=49720");
    expect(urls[0]).toContain("countrycodes=us");
  });
});
