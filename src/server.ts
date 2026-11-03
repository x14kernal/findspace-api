import app from './app.js';
import { env } from './config/env.js';
import { redis } from './database/redis.js';

await redis.connect();

app.listen(env.PORT, () => {
  console.log(`FindSpace API listening on port ${env.PORT}`);
});
