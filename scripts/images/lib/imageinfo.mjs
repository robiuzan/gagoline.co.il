/**
 * imageinfo.mjs — dependency-free image header reads for the images gate.
 *
 * A trimmed copy of Media Studio `src/lib/imageinfo.js` (`sniffFormat`, `inspect`, `EXT`, `MIME`):
 * the format is identified from magic bytes — never the extension — and the intrinsic dimensions
 * are read from the container. The metadata-stripping and SVG-sanitising halves of the original are
 * not needed here: this repo never re-encodes, it only PROVES that the width/height the manifest
 * bakes into every <img> are the pixels actually shipped. A wrong value silently reintroduces
 * layout shift on every page, which is why the gate reads the file rather than trusting the JSON.
 *
 * Plain ESM, no sharp, no Worker runtime — runs under `node` in postbuild and in CI.
 */

/** @typedef {"jpeg"|"png"|"webp"|"gif"|"avif"} ImageFormat */
/** @typedef {{ format: ImageFormat, width: number, height: number }} ImageInfo */

const td = new TextDecoder();

/** ASCII tag at a byte offset, for container magic. */
function tag(b, off, len = 4) {
  return td.decode(b.subarray(off, off + len));
}

const u16be = (b, o) => (b[o] << 8) | b[o + 1];
const u32be = (b, o) =>
  ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const u16le = (b, o) => b[o] | (b[o + 1] << 8);
const u24le = (b, o) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);

/**
 * Identify the format from magic bytes only.
 * @param {Uint8Array} b
 * @returns {ImageFormat|null}
 */
export function sniffFormat(b) {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b[0] === 0x89 && tag(b, 1, 3) === "PNG") return "png";
  if (tag(b, 0) === "RIFF" && tag(b, 8) === "WEBP") return "webp";
  if (tag(b, 0, 3) === "GIF") return "gif";
  if (tag(b, 4) === "ftyp") {
    const brand = tag(b, 8);
    if (brand === "avif" || brand === "avis") return "avif";
  }
  return null;
}

/** PNG: IHDR is always the first chunk, so width/height sit at fixed offsets. */
function pngSize(b) {
  if (b.length < 24 || tag(b, 12) !== "IHDR") return null;
  return { width: u32be(b, 16), height: u32be(b, 20) };
}

/** GIF: logical screen descriptor, little-endian, right after the 6-byte signature. */
function gifSize(b) {
  if (b.length < 10) return null;
  return { width: u16le(b, 6), height: u16le(b, 8) };
}

/**
 * JPEG: walk the segment chain to a Start-Of-Frame marker. Dimensions are NOT at a fixed offset —
 * they follow whatever APPn/EXIF/ICC segments the camera or editor emitted.
 */
function jpegSize(b) {
  let o = 2; // skip SOI
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) {
      o++; // resync on padding
      continue;
    }
    const marker = b[o + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      o += 2;
      continue;
    }
    const len = u16be(b, o + 2);
    // SOF0..SOF15, excluding DHT(c4), JPG(c8) and DAC(cc) which share the range.
    const isSOF =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isSOF) return { height: u16be(b, o + 5), width: u16be(b, o + 7) };
    if (len < 2) return null;
    o += 2 + len;
  }
  return null;
}

/** WebP has three sub-formats and each stores its size differently. */
function webpSize(b) {
  const chunk = tag(b, 12);
  if (chunk === "VP8X") {
    // Extended: canvas size is stored minus-one as 24-bit little-endian.
    return { width: u24le(b, 24) + 1, height: u24le(b, 27) + 1 };
  }
  if (chunk === "VP8 ") {
    // Lossy: 14 significant bits each, after the 3-byte start code.
    if (b.length < 30) return null;
    return { width: u16le(b, 26) & 0x3fff, height: u16le(b, 28) & 0x3fff };
  }
  if (chunk === "VP8L") {
    // Lossless: 14-bit width then 14-bit height, bit-packed, both minus-one.
    if (b.length < 25) return null;
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

/**
 * AVIF: ISOBMFF. Scan for the `ispe` (image spatial extents) box, whose payload is version+flags
 * then width,height as 32-bit big-endian. The first one is the primary item in practice.
 */
function avifSize(b) {
  for (let o = 0; o + 20 < b.length; o++) {
    if (b[o] === 0x69 && b[o + 1] === 0x73 && b[o + 2] === 0x70 && b[o + 3] === 0x65) {
      const w = u32be(b, o + 8);
      const h = u32be(b, o + 12);
      if (w > 0 && h > 0 && w < 100000 && h < 100000) return { width: w, height: h };
    }
  }
  return null;
}

/**
 * Full inspection. Throws with an operator-readable reason rather than returning null: an image
 * whose intrinsic size cannot be verified must never pass the gate.
 * @param {Uint8Array} bytes
 * @returns {ImageInfo}
 */
export function inspect(bytes) {
  const format = sniffFormat(bytes);
  if (!format)
    throw new Error("Unrecognised image format (magic bytes matched no supported type)");
  const size =
    format === "png"
      ? pngSize(bytes)
      : format === "jpeg"
        ? jpegSize(bytes)
        : format === "webp"
          ? webpSize(bytes)
          : format === "gif"
            ? gifSize(bytes)
            : avifSize(bytes);
  if (!size || !size.width || !size.height) {
    throw new Error(`Could not read intrinsic dimensions from ${format}`);
  }
  return { format, width: size.width, height: size.height };
}

export const EXT = { jpeg: "jpg", png: "png", webp: "webp", gif: "gif", avif: "avif" };
export const MIME = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};
