/**
 * Gera os PNGs do PWA a partir de public/icon.svg.
 * Roda uma vez (`npm run icons`) e os PNGs são commitados — não faz parte do build.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const source = await readFile(resolve(root, "public/icon.svg"));

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/apple-touch-icon.png", size: 180 },
  // Maskable: o sistema recorta as bordas, então o glifo precisa caber na
  // zona segura de 80% — o SVG é reduzido a 60% e centralizado.
  { file: "public/icons/icon-512-maskable.png", size: 512, inset: 0.6 },
];

for (const { file, size, inset } of targets) {
  const out = resolve(root, file);
  await mkdir(dirname(out), { recursive: true });

  let image;
  if (inset) {
    const inner = Math.round(size * inset);
    const glyph = await sharp(source, { density: 512 })
      .resize(inner, inner)
      .png()
      .toBuffer();

    image = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: "#0b1017",
      },
    }).composite([{ input: glyph, gravity: "centre" }]);
  } else {
    image = sharp(source, { density: 512 }).resize(size, size);
  }

  await writeFile(out, await image.png().toBuffer());
  console.log(`✓ ${file} (${size}px)`);
}
