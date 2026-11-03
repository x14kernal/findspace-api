import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { deleteCreatedUsers, newEmail } from '../helpers';
import { ERROR_CODES, SUCCESS_CODES } from '../../src/i18n';
import { SIGNUP_PATH } from '../constants';

describe('POST /api/auth/signup', () => {
  // Validation
  it.each([
    ['invalid email', { email: 'bad', password: '12345678' }, 'email', 'INVALID_FORMAT'],
    ['short password', { email: 'a@e.com', password: '1' }, 'password', 'TOO_SMALL'],
    ['long password', { email: 'a@e.com', password: '1'.repeat(37) }, 'password', 'TOO_BIG'],
    [
      'admin role',
      { email: 'a@e.com', password: '12345678', role: 'admin' },
      'role',
      'INVALID_VALUE',
    ],
  ])('rejects %s (400)', async (_name, body, field, code) => {
    const res = await request(app).post(SIGNUP_PATH).send(body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(res.body.error.details[0]).toMatchObject({ field, code });
  });

  // Creation
  it('create a customer (201)', async () => {
    const email = newEmail();

    const res = await request(app)
      .post(SIGNUP_PATH)
      .send({ email, password: '12345678', role: 'customer' });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(SUCCESS_CODES.AUTH_SIGNUP_SUCCESS);
    expect(res.body.data).toMatchObject({ email, role: 'customer' });
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  // Duplication
  it('rejects a duplicate email (409)', async () => {
    const email = newEmail();
    const body = { email, password: '12345678' };

    await request(app).post(SIGNUP_PATH).send(body);
    const res = await request(app).post(SIGNUP_PATH).send(body);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe(ERROR_CODES.AUTH_EMAIL_TAKEN);
  });
});

afterAll(async () => await deleteCreatedUsers());
