import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().min(1).max(7),
  REDIS_URL: z.string(),
  FRONTEND_URL: z.url(),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']),
});

export const env = envSchema.parse(process.env);
