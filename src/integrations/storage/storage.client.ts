import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '../../config/env';
import { ERROR_CODES } from '../../i18n';
import { BadGatewayError } from '../../errors/bad-gateway.error';

const s3 = new S3Client({
  forcePathStyle: true,
  region: env.SUPABASE_REGION,
  endpoint: env.SUPABASE_S3_ENDPOINT,
  credentials: {
    accessKeyId: env.SUPABASE_ACCESS_KEY_ID,
    secretAccessKey: env.SUPABASE_SECRET_ACCESS_KEY,
  },
});

type UploadInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

async function upload({ key, body, contentType }: UploadInput): Promise<void> {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.SUPABASE_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  } catch (err) {
    console.error(err); // Maybe replace it later with a real logger service
    throw new BadGatewayError('File upload failed.', ERROR_CODES.STORAGE_UPLOAD_FAILED);
  }
}

async function remove(key: string): Promise<void> {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.SUPABASE_BUCKET,
        Key: key,
      }),
    );
  } catch (err) {
    console.error(err);
  }
}

function getPublicUrl(key: string): string {
  return `${env.SUPABASE_PUBLIC_URL}/${key}`;
}

function getKeyFromUrl(url: string): string | null {
  const prefix = `${env.SUPABASE_PUBLIC_URL}/`;
  if (!url.startsWith(prefix)) return null;
  const key = url.slice(prefix.length);
  return key || null;
}

export const storage = { upload, remove, getPublicUrl, getKeyFromUrl };
