import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  table[n] = c >>> 0;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function makePng(size, bg, fg) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + size * 3;
  const raw = Buffer.alloc(rowSize * size);
  // simple radial gradient: center = fg, edge = bg, using squared distance
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const r2max = cx * cx + cy * cy;
  for (let y = 0; y < size; y++) {
    raw[y * rowSize] = 0;
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt((dx * dx + dy * dy) / r2max);
      // corners rounded visually via alpha... just ramp
      const t = Math.min(1, r * 1.1);
      const p = y * rowSize + 1 + x * 3;
      raw[p] = Math.round(fg[0] * (1 - t) + bg[0] * t);
      raw[p + 1] = Math.round(fg[1] * (1 - t) + bg[1] * t);
      raw[p + 2] = Math.round(fg[2] * (1 - t) + bg[2] * t);
    }
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const outDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(outDir, { recursive: true });

const BG = [26, 22, 37];
const FG = [148, 102, 212];

for (const [name, size] of [
  ['pwa-192x192.png', 192],
  ['pwa-512x512.png', 512],
  ['apple-touch-icon.png', 180]
]) {
  fs.writeFileSync(path.join(outDir, name), makePng(size, BG, FG));
  console.log('wrote', name);
}
