import { describe, expect, it } from "vitest";
import {
  fillPlaceDetails,
  geocodeAttempts,
  labelFromNominatim,
  parseNominatim,
} from "./geocode";

describe("geocode", () => {
  it("shortens a Nominatim display name", () => {
    expect(
      labelFromNominatim("Charlevoix, Charlevoix County, Michigan, 49720, United States", "49720"),
    ).toBe("49720, Charlevoix, MI");
  });

  it("keeps ZIP 49720 on Charlevoix", () => {
    expect(
      labelFromNominatim(
        "49720, Charlevoix Township, Charlevoix County, Michigan, United States",
        "49720",
      ),
    ).toBe("49720, Charlevoix, MI");
  });

  it("parses the first hit", () => {
    const hit = parseNominatim(
      [{ lat: "45.318", lon: "-85.258", display_name: "Charlevoix, Michigan, USA" }],
      "49720",
    );
    expect(hit?.lat).toBeCloseTo(45.318);
    expect(hit?.lng).toBeCloseTo(-85.258);
    expect(hit?.label).toBe("49720, Charlevoix, MI");
  });

  it("fills city, state, and ZIP from address details", () => {
    const hit = parseNominatim(
      [
        {
          lat: "35.42",
          lon: "-97.42",
          display_name: "73145, Oklahoma City, Oklahoma County, Oklahoma, United States",
          address: {
            city: "Oklahoma City",
            state: "Oklahoma",
            postcode: "73145",
            "ISO3166-2-lvl4": "US-OK",
            country_code: "us",
          },
        },
      ],
      "73145",
    );
    expect(hit?.label).toBe("73145, Oklahoma City, OK");
    expect(hit?.state).toBe("OK");
  });

  it("uses a US city search before free text", () => {
    const urls = geocodeAttempts("Charlevoix").map((u) => u.searchParams.toString());
    expect(urls[0]).toContain("city=Charlevoix");
    expect(urls[0]).toContain("countrycodes=us");
    expect(urls[0]).toContain("addressdetails=1");
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

describe("fillPlaceDetails", () => {
  it("adds a missing state to a ZIP city", () => {
    expect(
      fillPlaceDetails("73145, Oklahoma City", {
        zip: "73145",
        city: "Oklahoma City",
        state: "OK",
        country: null,
      }),
    ).toBe("73145, Oklahoma City, OK");
  });

  it("adds ZIP and state to a bare city", () => {
    expect(
      fillPlaceDetails("Charlevoix", {
        zip: "49720",
        city: "Charlevoix",
        state: "MI",
        country: null,
      }),
    ).toBe("49720, Charlevoix, MI");
  });

  it("keeps a township name and appends state", () => {
    expect(
      fillPlaceDetails("49713, Melrose Township", {
        zip: "49713",
        city: "Melrose",
        state: "MI",
        country: null,
      }),
    ).toBe("49713, Melrose Township, MI");
  });
});
