import { describe, expect, it } from "vitest";
import { clusterCaption, clusterPins } from "./pins";

describe("clusterPins", () => {
  it("counts the same town once with a tally", () => {
    const clusters = clusterPins([
      { lat: 45.32, lng: -85.26, label: "Charlevoix, Michigan" },
      { lat: 45.32, lng: -85.26, label: "Charlevoix, Michigan" },
      { lat: 45.31, lng: -85.25, label: "Charlevoix, Michigan" },
    ]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].count).toBe(3);
    expect(clusterCaption(clusters[0])).toBe("Charlevoix, Michigan (3)");
  });

  it("keeps different towns separate", () => {
    const clusters = clusterPins([
      { lat: 45.32, lng: -85.26, label: "Charlevoix, Michigan" },
      { lat: 35.68, lng: 139.76, label: "Tokyo" },
    ]);
    expect(clusters).toHaveLength(2);
    expect(clusterCaption(clusters.find((c) => c.label === "Tokyo")!)).toBe("Tokyo");
  });

  it("counts Charlevoix and Charlevoix, MI as one town", () => {
    const clusters = clusterPins([
      { lat: 32.22, lng: -110.84, label: "85710, Tucson" },
      { lat: 45.31198, lng: -85.2589, label: "Charlevoix" },
      { lat: 45.31198, lng: -85.25893, label: "Charlevoix, MI" },
      { lat: 45.31723, lng: -85.25706, label: "Charlevoix, mi" },
    ]);
    expect(clusters).toHaveLength(2);
    const chx = clusters.find((c) => /charlevoix/i.test(c.label));
    expect(chx?.count).toBe(3);
    expect(clusterCaption(chx!)).toBe("Charlevoix, MI (3)");
    expect(clusterCaption(clusters.find((c) => /tucson/i.test(c.label))!)).toBe("85710, Tucson");
  });

  it("does not merge same city names in different regions", () => {
    const clusters = clusterPins([
      { lat: 45.52, lng: -122.68, label: "Portland, OR" },
      { lat: 43.66, lng: -70.25, label: "Portland, ME" },
    ]);
    expect(clusters).toHaveLength(2);
  });
});
