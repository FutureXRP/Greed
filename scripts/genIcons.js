// Generates branded placeholder PNG assets (icon, adaptive-icon, splash)
// with no external deps: a gilded tile on the ink table. Run: node scripts/genIcons.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const INK = [0xfb, 0xf3, 0xe2]; // cream table
const FELT = [0x1f, 0x1b, 0x15];
const GOLD = [0xd9, 0xa4, 0x41];
const GOLD_HI = [0xff, 0xc9, 0x4d];
const GOLD_DIM = [0xe8, 0x93, 0x0c];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function writePNG(file, size, draw) {
  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y);
      const o = (y * size + x) * 4;
      px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = a;
    }
  }
  // add filter byte (0) per scanline
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
  console.log('wrote', file, `${size}x${size}`);
}

// Rounded tile drawing helper.
function tilePixel(x, y, size, tileFrac, bg) {
  const cx = size / 2;
  const cy = size / 2;
  const half = (size * tileFrac) / 2;
  const radius = half * 0.28;
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  // rounded-rect signed distance
  const qx = dx - (half - radius);
  const qy = dy - (half - radius);
  let inside;
  if (qx <= 0 || qy <= 0) inside = dx <= half && dy <= half;
  else inside = Math.hypot(qx, qy) <= radius;
  if (!inside) return bg;
  // border band
  const borderHalf = half * 0.9;
  const bqx = dx - (borderHalf - radius * 0.9);
  const bqy = dy - (borderHalf - radius * 0.9);
  let innerInside;
  if (bqx <= 0 || bqy <= 0) innerInside = dx <= borderHalf && dy <= borderHalf;
  else innerInside = Math.hypot(bqx, bqy) <= radius * 0.9;
  if (!innerInside) return [...GOLD_HI, 255];
  // gilded gradient (top lighter)
  const t = (y - (cy - half)) / (2 * half);
  const mix = (a, b, f) => Math.round(a + (b - a) * f);
  const r = mix(GOLD_HI[0], GOLD_DIM[0], t);
  const g = mix(GOLD_HI[1], GOLD_DIM[1], t);
  const b = mix(GOLD_HI[2], GOLD_DIM[2], t);
  return [r, g, b, 255];
}

const dir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

// App icon: opaque ink table, gold tile.
writePNG(path.join(dir, 'icon.png'), 1024, (x, y) =>
  tilePixel(x, y, 1024, 0.6, [...INK, 255]),
);

// Adaptive icon foreground: transparent bg, smaller tile within safe zone.
writePNG(path.join(dir, 'adaptive-icon.png'), 1024, (x, y) =>
  tilePixel(x, y, 1024, 0.44, [0, 0, 0, 0]),
);

// Splash: ink bg, centered tile.
writePNG(path.join(dir, 'splash.png'), 1024, (x, y) =>
  tilePixel(x, y, 1024, 0.34, [...INK, 255]),
);

// Favicon for web.
writePNG(path.join(dir, 'favicon.png'), 196, (x, y) =>
  tilePixel(x, y, 196, 0.62, [...INK, 255]),
);
