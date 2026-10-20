import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('returns a successful health response', async () => {
    const response = await request(app).get('/health');
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: { status: 'ok' } });
  });
});
