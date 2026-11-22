export function getBlogImageSrcset(src?: string) {
  const base = src?.match(/^(https:\/\/picsum\.photos\/id\/\d+)\/640\/360$/)?.[1];
  if (!base) return undefined;

  return [640, 960, 1280, 1920, 2304]
    .map(width => `${base}/${width}/${width * 9 / 16} ${width}w`)
    .join(", ");
}
