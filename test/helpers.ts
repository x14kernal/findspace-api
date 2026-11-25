import { db } from '../src/prisma/db';
import app from '../src/app';
import request from 'supertest';
import { authRepository } from '../src/modules/auth/auth.repository';
import { hashToken } from '../src/utils/refresh-token';
import type { Char } from '@prisma/orm-postgres/target/codec-types';
import sharp from 'sharp';
import { randomBytes } from 'node:crypto';
import { PATHS } from './constants';

const createdEmails: string[] = [];
const createdTokens: string[] = [];
const createdWorkspaces: string[] = [];

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

export const loginUser = async (role: string = 'customer') => {
  const email = newEmail();
  const body = { email, password: '12345678', role };

  await request(app).post(PATHS.signup).send(body);
  const res = await request(app).post(PATHS.login).send(body);

  const refreshToken = cookieValue(res.headers['set-cookie'], 'refreshToken');
  trackToken(refreshToken);

  return {
    email,
    refreshToken,
    accessToken: res.body.data.accessToken as string,
    id: res.body.data.user.id as string,
  };
};

export const userWithProfile = async (role: string = 'customer') => {
  const { accessToken } = await loginUser(role);
  const country = await getTestCountry();
  const body = {
    firstName: 'Muhammed',
    lastName: 'Ahmed',
    bio: 'Backend learner',
    phoneNumber: '+201001234567',
    location: { countryId: country!.id },
  };

  await request(app).post(PATHS.profile).set('Authorization', `Bearer ${accessToken}`).send(body);

  return { accessToken, body, country };
};

export const logoutWith = (token: string) => {
  return request(app).post(PATHS.logout).set('Cookie', `refreshToken=${token}`);
};

export const deleteCreatedUsers = async () => {
  for (const email of createdEmails) {
    await db.orm.public.User.where({ email }).delete();
  }
};

export const refreshWith = (token: string) => {
  return request(app).post(PATHS.refresh).set('Cookie', `refreshToken=${token}`);
};

export const trackToken = (token: string) => {
  createdTokens.push(token);
};

export const trackEmail = (email: string) => {
  createdEmails.push(email);
};

export const getTestCountry = () => {
  return db.orm.public.Country.where({ iso2Code: 'EG' as Char<2> }).first();
};

export const trackWorkspace = (id: string) => {
  createdWorkspaces.push(id);
};

export const deleteWorkspacesAndLocations = async () => {
  for (const id of createdWorkspaces) {
    const ws = await db.orm.public.Workspace.where({ id }).first();
    await db.orm.public.Workspace.where({ id }).delete();
    if (ws) await db.orm.public.Location.where({ id: ws.locationId }).delete();
  }
};

export const validWorkspaceBody = async (overrides: Record<string, unknown> = {}) => {
  const country = await getTestCountry();
  return {
    name: 'Test Space',
    description: 'A quiet place to work',
    floorCount: 3,
    timezone: 'Africa/Cairo',
    location: { countryId: country!.id, city: 'Cairo', area: 'Maadi' },
    ...overrides,
  };
};

export const addWorkspace = async (accessToken: string) => {
  const body = await validWorkspaceBody();
  const c = await request(app)
    .post(PATHS.workspace)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(body);
  trackWorkspace(c.body.data.id);
  return c;
};

export const validAvailabilityBody = (overrides: Record<string, unknown> = {}) => ({
  availabilities: [
    { dayOfWeek: '1', startAt: '09:00', endAt: '17:00' },
    { dayOfWeek: '2', startAt: '09:00', endAt: '17:00' },
  ],
  ...overrides,
});

export const validRoomBody = (overrides: Record<string, unknown> = {}) => ({
  code: randomBytes(3).toString('hex').toUpperCase(),
  pricePerHour: '120',
  capacity: 4,
  floorNumber: 1,
  widthM: '5.00',
  lengthM: '4.00',
  ...overrides,
});

export const addRoom = async (accessToken: string, overrides = {}) => {
  const res = await request(app)
    .post(PATHS.rooms)
    .set('Authorization', `Bearer ${accessToken}`)
    .send(validRoomBody(overrides));
  return res.body.data;
};

export const cleanup = async () => {
  for (const token of createdTokens) {
    const data = await authRepository.findToken(hashToken(token));
    if (data) await authRepository.deleteFamily(data.familyId);
  }
  await deleteWorkspacesAndLocations();
  await deleteCreatedUsers();
};

export const makePng = (width = 300, height = 300) =>
  sharp({ create: { width, height, channels: 3, background: '#3b82f6' } })
    .png()
    .toBuffer();

export const uploadAvatar = async (token: string) => {
  const png = await makePng();
  return request(app)
    .put(PATHS.avatar)
    .set('Authorization', `Bearer ${token}`)
    .attach('avatar', png, {
      filename: 'me.png',
      contentType: 'image/png',
    });
};

export const authed = (
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  token: string,
) => request(app)[method](path).set('Authorization', `Bearer ${token}`);
