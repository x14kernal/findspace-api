import sharp from 'sharp';
import { UnsupportedMediaTypeError } from '../errors/unsupported-media-type.error';

const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];

export async function processAvatar(buffer: Buffer): Promise<Buffer> {
  const image = sharp(buffer, { limitInputPixels: 16_000_000 });

  try {
    const { format } = await image.metadata();
    if (!ALLOWED_FORMATS.includes(format)) throw new UnsupportedMediaTypeError();
    return await image.rotate().resize(256, 256, { fit: 'cover' }).webp({ quality: 80 }).toBuffer();
  } catch (err) {
    throw new UnsupportedMediaTypeError();
  }
}
