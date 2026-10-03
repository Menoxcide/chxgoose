export const SERVED_IMAGES = {
  "/billie.webp": { width: 1280, height: 1707 },
  "/looks/football.webp": { width: 480, height: 1039 },
  "/outfits/football/0.webp": { width: 800, height: 793 },
  "/outfits/farmer/0.webp": { width: 767, height: 1200 },
  "/outfits/scarecrow/0.webp": { width: 800, height: 997 },
  "/outfits/maple/0.webp": { width: 731, height: 1200 },
  "/outfits/maple-dress/0.webp": { width: 800, height: 782 },
  "/outfits/leaves/0.webp": { width: 800, height: 877 },
  "/outfits/overalls/0.webp": { width: 709, height: 1200 },
  "/outfits/wizard/0.webp": { width: 800, height: 787 },
  "/ui/goose-pot.webp": { width: 400, height: 400 },
  "/ui/goose-hang.webp": { width: 400, height: 400 },
  "/ui/pin.webp": { width: 256, height: 256 },
  "/ui/stamp.webp": { width: 256, height: 256 },
  "/ui/wood.webp": { width: 840, height: 840 },
  "/ui/plaque.webp": { width: 980, height: 430 },
  "/ui/paper.webp": { width: 780, height: 420 },
} as const;

export type ServedSrc = keyof typeof SERVED_IMAGES;

export function servedSize(src: string): { width: number; height: number } {
  const size = SERVED_IMAGES[src as ServedSrc];
  if (!size) throw new Error(`missing image size for ${src}`);
  return size;
}
