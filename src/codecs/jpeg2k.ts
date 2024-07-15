// TODO: Remove dependency on CDN for pdf.js source. Could use git submodule or
// `deno bundle` since the pdf.js dist does not include ESM source code (only UMD or CJS).

// @ts-ignore
import { JpxImage } from 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js@30bd5f0/src/core/jpx.js';

export default class Jpeg2k {
  kind = 'bytes_to_bytes' as const;
  static codecId = 'jpeg2k';
  static fromConfig(): Jpeg2k {
    return new Jpeg2k();
  }
  encode(_: Uint8Array): never {
    throw new Error('encode not implemented');
  }
  async decode(data: Uint8Array): Promise<Uint8Array> {
    const img = new JpxImage();
    img.failOnCorruptedImage = true;
    img.parse(data);
    return img.tiles[0].items;
  }
}
