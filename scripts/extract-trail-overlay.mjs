import sharp from "sharp";

const input = "public/frontier-hero-headlands-view-v3.png";
const output = "public/frontier-hero-trail-overlay.png";

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const pixelCount = info.width * info.height;
const candidate = new Uint8Array(pixelCount);
const walkable = new Uint8Array(pixelCount);
const selected = new Uint8Array(pixelCount);
const trail = Buffer.alloc(data.length);
const minX = 250;
const maxX = 620;
const minY = 568;

// Isolate warm, high-luminance pixels in the ground region containing the trail.
for (let y = minY; y < info.height; y += 1) {
  for (let x = minX; x < maxX; x += 1) {
    const pixel = y * info.width + x;
    const offset = pixel * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    if (r > 165 && g > 85 && r + g - b > 230) {
      candidate[pixel] = 1;
    }
  }
}

// Bridge tiny antialiasing gaps while preserving the source pixels for output.
for (let y = minY + 2; y < info.height - 2; y += 1) {
  for (let x = minX + 2; x < maxX - 2; x += 1) {
    let nearby = false;
    for (let dy = -2; dy <= 2 && !nearby; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        if (candidate[(y + dy) * info.width + x + dx]) {
          nearby = true;
          break;
        }
      }
    }
    if (nearby) walkable[y * info.width + x] = 1;
  }
}

// Flood-fill only the connected feature that begins at the foreground trail.
let seed = 886 * info.width + 309;
if (!walkable[seed]) {
  outer:
  for (let radius = 1; radius <= 20; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const pixel = (886 + dy) * info.width + 309 + dx;
        if (walkable[pixel]) {
          seed = pixel;
          break outer;
        }
      }
    }
  }
}

const queue = new Int32Array(pixelCount);
let head = 0;
let tail = 0;
queue[tail++] = seed;
selected[seed] = 1;

while (head < tail) {
  const pixel = queue[head++];
  const x = pixel % info.width;
  const y = Math.floor(pixel / info.width);

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < minX + 2 || nx >= maxX - 2 || ny < minY + 2 || ny >= info.height) continue;
      const next = ny * info.width + nx;
      if (walkable[next] && !selected[next]) {
        selected[next] = 1;
        queue[tail++] = next;
      }
    }
  }
}

for (let pixel = 0; pixel < pixelCount; pixel += 1) {
  if (!selected[pixel] || !candidate[pixel]) continue;

  const offset = pixel * 4;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const alpha = Math.round(255 * Math.max(0.2, Math.min(1, (r + g - b - 190) / 260)));

  trail[offset] = r;
  trail[offset + 1] = Math.min(255, Math.round(g * 1.06));
  trail[offset + 2] = Math.min(255, Math.round(Math.max(b, 36) * 1.04));
  trail[offset + 3] = alpha;
}

await sharp(trail, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(output);

console.log(output);
