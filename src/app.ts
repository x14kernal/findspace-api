import express, { type Express, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { errorHandler } from './middleware/error-handler.js';
import { requestId } from './middleware/request-id.js';

import routes from './routes';

import { sendSuccess } from './responses/response-helpers.js';
import { env } from './config/env.js';

const healthHandler = (_: Request, res: Response) =>
  sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });

const app: Express = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocal || origin === env.FRONTEND_URL) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(requestId);

app.get('/health', healthHandler);
app.use('/api', routes);

app.use(errorHandler);
export default app;
