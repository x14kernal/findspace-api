import express, { type Express } from 'express';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { sendSuccess } from './responses/response-helpers.js';
import { errorHandler } from './middleware/error-handler.middleware.js';

const app: Express = express();
app.use(express.json());
app.use(requestIdMiddleware);

app.get('/health', (_req, res) =>
  sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }),
);

app.use(errorHandler);
export default app;
