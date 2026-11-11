import { db } from '../src/prisma/db';
import { LOGIN_PATH, LOGOUT_PATH, REFRESH_PATH, SIGNUP_PATH } from './constants';
import app from '../src/app';
import request from 'supertest';
import { authRepository } from '../src/modules/auth/auth.repository';
import { hashToken } from '../src/utils/refresh-token';
import type { Char } from '@prisma/orm-postgres/target/codec-types';

const createdEmails: string[] = [];
const createdTokens: string[] = [];

export const newEmail = () => {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  trackEmail(email);
  return email;
};

export const findCookie = (setCookie: string | string[] | undefined, name: string) =>
  ([] as string[]).concat(setCookie ?? []).find((c) => c.startsWith(`${name}=`));

export const cookieValue = (setCookie: string | string[] | undefined, name: string): string => {
  const value = findCookie(setCookie, name)?.split(';')[0]?.split('=')[1];
  if (!value) throw new Error(`Cookie "${name}" not found or empty`);
  return value;
};

export const loginUser = async () => {
  const email = newEmail();
  const body = { email, password: '12345678' };

  await request(app).post(SIGNUP_PATH).send(body);
  const res = await request(app).post(LOGIN_PATH).send(body);

  const refreshToken = cookieValue(res.headers['set-cookie'], 'refreshToken');
  trackToken(refreshToken);

  return {
    email,
    refreshToken,
    accessToken: res.body.data.accessToken as string,
    id: res.body.data.user.id as string,
  };
};

export const logoutWith = (token: string) =>
  request(app).post(LOGOUT_PATH).set('Cookie', `refreshToken=${token}`);

export const deleteCreatedUsers = async () => {
  for (const email of createdEmails) {
    await db.orm.public.User.where({ email }).delete();
  }
};

export const refreshWith = (token: string) =>
  request(app).post(REFRESH_PATH).set('Cookie', `refreshToken=${token}`);

export const trackToken = (token: string) => {
  createdTokens.push(token);
};

export const trackEmail = (email: string) => {
  createdEmails.push(email);
};

export const getTestCountry = () =>
  db.orm.public.Country.where({ iso2Code: 'EG' as Char<2> }).first();

export const cleanup = async () => {
  for (const token of createdTokens) {
    const data = await authRepository.findToken(hashToken(token));
    if (data) await authRepository.deleteFamily(data.familyId);
  }
  await deleteCreatedUsers();
};
