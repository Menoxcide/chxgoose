import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "public");

const jobs = [
  ["billie.jpg", "billie.webp", 1280, 72],
  ["looks/football.jpg", "looks/football.webp", 480, 72],
  ["outfits/football/0.jpg", "outfits/football/0.webp", 800, 72],
  ["outfits/farmer/0.jpg", "outfits/farmer/0.webp", 800, 72],
  ["outfits/scarecrow/0.jpg", "outfits/scarecrow/0.webp", 800, 72],
  ["outfits/maple/0.jpg", "outfits/maple/0.webp", 800, 72],
  ["outfits/maple-dress/0.jpg", "outfits/maple-dress/0.webp", 800, 72],
  ["outfits/leaves/0.jpg", "outfits/leaves/0.webp", 800, 72],
  ["outfits/overalls/0.jpg", "outfits/overalls/0.webp", 800, 72],
  ["outfits/wizard/0.jpg", "outfits/wizard/0.webp", 800, 72],
  ["ui/goose-pot.jpg", "ui/goose-pot.webp", 400, 75],
  ["ui/goose-hang.jpg", "ui/goose-hang.webp", 400, 75],
  ["ui/pin.jpg", "ui/pin.webp", 256, 75],
  ["ui/stamp.jpg", "ui/stamp.webp", 256, 75],
  ["ui/wood.jpg", "ui/wood.webp", 840, 70],
  ["ui/plaque.jpg", "ui/plaque.webp", 980, 72],
  ["ui/paper.jpg", "ui/paper.webp", 780, 72],
];

const served = {};
for (const [src, dest, width, quality] of jobs) {
  const out = path.join(pub, dest);
  await mkdir(path.dirname(out), { recursive: true });
  const image = sharp(path.join(pub, src)).rotate().resize({ width, withoutEnlargement: true });
  const buf = await image.webp({ quality }).toBuffer();
  await writeFile(out, buf);
  const meta = await sharp(buf).metadata();
  served["/" + dest] = { width: meta.width, height: meta.height, bytes: buf.length };
}

const icon = await sharp(path.join(pub, "billie.jpg"))
  .rotate()
  .resize(32, 32, { fit: "cover", position: "attention" })
  .ensureAlpha()
  .png()
  .toBuffer();
const apple = await sharp(path.join(pub, "billie.jpg"))
  .rotate()
  .resize(180, 180, { fit: "cover", position: "attention" })
  .ensureAlpha()
  .png()
  .toBuffer();
const appDir = path.join(root, "app");
await writeFile(path.join(appDir, "icon.png"), icon);
await writeFile(path.join(appDir, "apple-icon.png"), apple);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(icon.length, 8);
entry.writeUInt32LE(22, 12);
await writeFile(path.join(appDir, "favicon.ico"), Buffer.concat([header, entry, icon]));

console.log(JSON.stringify(served, null, 2));
