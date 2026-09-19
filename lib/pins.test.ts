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
});
