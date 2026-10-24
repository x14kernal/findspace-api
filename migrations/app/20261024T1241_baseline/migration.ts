#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/3b1143de1eef85db26aa72a4594c7e0d821d52de8d18f8a0718ef584a712bd10/contract';
import endContract from '../../snapshots/3b1143de1eef85db26aa72a4594c7e0d821d52de8d18f8a0718ef584a712bd10/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'booking_status',
        members: ['pending', 'confirmed', 'cancelled'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'day_of_week',
        members: ['1', '2', '3', '4', '5', '6', '7'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'user_role',
        members: ['customer', 'owner', 'admin'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'workspace_status',
        members: ['active', 'inactive'],
      }),
      this.createTable({
        schema: 'public',
        table: 'bookings',
        columns: [
          col('cancellation_reason', 'character varying', {
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('cancelled_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('cancelled_by_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('confirmed_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('customer_phone_number', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('date', 'date', { notNull: true, codecRef: { codecId: 'pg/date-temporal@1' } }),
          col('expires_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('room_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('start_at', 'time', { notNull: true, codecRef: { codecId: 'pg/time-temporal@1' } }),
          col('status', '"booking_status"', {
            notNull: true,
            default: lit('pending'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'booking_status' } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'countries',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('currency_code', 'character(3)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 3 } },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('iso2_code', 'character(2)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 2 } },
          }),
          col('iso3_code', 'character(3)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 3 } },
          }),
          col('name', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('phone_code', 'character varying(6)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 6 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'features',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('icon_name', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('name', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('slug', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'images',
        columns: [
          col('alt_text', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('is_primary', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('url', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('workspace_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'locations',
        columns: [
          col('area', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('city', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('country_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('latitude', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('longitude', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('locations_latitude_range_9dd11892', sql`latitude BETWEEN -90 AND 90`),
          checkExpression(
            'locations_longitude_range_5fbf98d2',
            sql`longitude BETWEEN -180 AND 180`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'notifications',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('data', 'jsonb', {
            notNull: true,
            default: lit({}),
            codecRef: { codecId: 'pg/jsonb@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('message', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('read_at', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('recipient_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('type', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'profiles',
        columns: [
          col('avatar_url', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('bio', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('first_name', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('last_name', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('location_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('phone_number', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'room_availabilities',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('day_of_week', '"day_of_week"', {
            notNull: true,
            default: lit('1'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'day_of_week' } },
          }),
          col('end_at', 'time', { notNull: true, codecRef: { codecId: 'pg/time-temporal@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('room_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('start_at', 'time', { notNull: true, codecRef: { codecId: 'pg/time-temporal@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('room_availabilities_start_before_end_56d95790', sql`start_at < end_at`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'room_features',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('feature_details', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('feature_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('room_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'room_unavailabilities',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('day_date', 'date', { notNull: true, codecRef: { codecId: 'pg/date-temporal@1' } }),
          col('end_at', 'time', { notNull: true, codecRef: { codecId: 'pg/time-temporal@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('reason', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('room_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('start_at', 'time', { notNull: true, codecRef: { codecId: 'pg/time-temporal@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'room_unavailabilities_start_before_end_56d95790',
            sql`start_at < end_at`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'rooms',
        columns: [
          col('capacity', 'int2', { notNull: true, codecRef: { codecId: 'pg/int2@1' } }),
          col('code', 'character varying(25)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 25 } },
          }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('floor_number', 'int2', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int2@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('length_m', 'numeric(4,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 4, scale: 2 } },
          }),
          col('name', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('price_per_hour', 'numeric(12,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 12, scale: 2 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('width_m', 'numeric(4,2)', {
            notNull: true,
            codecRef: { codecId: 'pg/numeric@1', typeParams: { precision: 4, scale: 2 } },
          }),
          col('workspace_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('rooms_capacity_positive_2e07dccc', sql`capacity > 0`),
          checkExpression('rooms_floor_number_positive_4e1289c1', sql`floor_number > 0`),
          checkExpression('rooms_length_positive_819b3405', sql`length_m > 0`),
          checkExpression('rooms_price_per_hour_positive_4c36d805', sql`price_per_hour > 0`),
          checkExpression('rooms_width_positive_4e0dd25f', sql`width_m > 0`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('google_id', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('last_login_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('password_hash', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('role', '"user_role"', {
            notNull: true,
            default: lit('customer'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'user_role' } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'workspace_availabilities',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('day_of_week', '"day_of_week"', {
            notNull: true,
            default: lit('1'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'day_of_week' } },
          }),
          col('end_at', 'time', { notNull: true, codecRef: { codecId: 'pg/time-temporal@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('start_at', 'time', { notNull: true, codecRef: { codecId: 'pg/time-temporal@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
          col('workspace_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'workspace_availabilities_start_before_end_56d95790',
            sql`start_at < end_at`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'workspaces',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'character varying', { codecRef: { codecId: 'sql/varchar@1' } }),
          col('floor_count', 'int2', { notNull: true, codecRef: { codecId: 'pg/int2@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('location_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('owner_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('slug', 'character varying', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1' },
          }),
          col('status', '"workspace_status"', {
            notNull: true,
            default: lit('active'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'workspace_status' } },
          }),
          col('timezone', 'character varying(50)', {
            notNull: true,
            default: lit('UTC'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('workspaces_floor_count_positive_5fcd4619', sql`floor_count > 0`),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'bookings',
        constraint: 'bookings_room_id_date_start_at_key',
        columns: ['room_id', 'date', 'start_at'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'countries',
        constraint: 'countries_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'countries',
        constraint: 'countries_iso2_code_key',
        columns: ['iso2_code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'countries',
        constraint: 'countries_iso3_code_key',
        columns: ['iso3_code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'features',
        constraint: 'features_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'profiles',
        constraint: 'profiles_user_id_key',
        columns: ['user_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'room_availabilities',
        constraint: 'room_availabilities_room_id_day_of_week_key',
        columns: ['room_id', 'day_of_week'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'room_features',
        constraint: 'room_features_room_id_feature_id_key',
        columns: ['room_id', 'feature_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'room_unavailabilities',
        constraint: 'room_unavailabilities_room_id_day_date_start_at_key',
        columns: ['room_id', 'day_date', 'start_at'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'rooms',
        constraint: 'rooms_workspace_id_code_key',
        columns: ['workspace_id', 'code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_google_id_key',
        columns: ['google_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'workspace_availabilities',
        constraint: 'workspace_availabilities_workspace_id_day_of_week_key',
        columns: ['workspace_id', 'day_of_week'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'workspaces',
        constraint: 'workspaces_owner_id_key',
        columns: ['owner_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'workspaces',
        constraint: 'workspaces_slug_key',
        columns: ['slug'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_cancelled_by_id_idx_192cdc4a',
        columns: ['cancelled_by_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_date_idx_b4ca319c',
        columns: ['date'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_room_id_idx_c32a1e8c',
        columns: ['room_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'bookings',
        index: 'bookings_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'images',
        index: 'images_workspace_id_idx_90a9f461',
        columns: ['workspace_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'images',
        index: 'images_workspace_primary_unique_6eade911',
        columns: ['workspace_id'],
        extras: { where: sql`is_primary = true`, unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'locations',
        index: 'locations_area_idx_07b38026',
        columns: ['area'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'locations',
        index: 'locations_city_idx_40fed80d',
        columns: ['city'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'locations',
        index: 'locations_country_id_idx_30642658',
        columns: ['country_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'locations',
        index: 'locations_latitude_idx_b328255f',
        columns: ['latitude'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'locations',
        index: 'locations_longitude_idx_490a27bf',
        columns: ['longitude'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_recipient_id_created_at_idx_fb9c4b0b',
        columns: ['recipient_id', 'created_at'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'notifications',
        index: 'notifications_recipient_id_idx_1e4ca6fd',
        columns: ['recipient_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'profiles',
        index: 'profiles_location_id_idx_6316b129',
        columns: ['location_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'room_availabilities',
        index: 'room_availabilities_room_id_idx_c32a1e8c',
        columns: ['room_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'room_features',
        index: 'room_features_feature_id_idx_652e89a5',
        columns: ['feature_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'room_features',
        index: 'room_features_room_id_idx_c32a1e8c',
        columns: ['room_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'room_unavailabilities',
        index: 'room_unavailabilities_room_id_idx_c32a1e8c',
        columns: ['room_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'rooms',
        index: 'rooms_workspace_id_idx_90a9f461',
        columns: ['workspace_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'workspace_availabilities',
        index: 'workspace_availabilities_workspace_id_idx_90a9f461',
        columns: ['workspace_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'workspaces',
        index: 'workspaces_location_id_idx_6316b129',
        columns: ['location_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'workspaces',
        index: 'workspaces_name_idx_ce87e6ba',
        columns: ['name'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'bookings',
        foreignKey: {
          name: 'bookings_room_id_fkey',
          columns: ['room_id'],
          references: { schema: 'public', table: 'rooms', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'bookings',
        foreignKey: {
          name: 'bookings_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'bookings',
        foreignKey: {
          name: 'bookings_cancelled_by_id_fkey',
          columns: ['cancelled_by_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'images',
        foreignKey: {
          name: 'images_workspace_id_fkey',
          columns: ['workspace_id'],
          references: { schema: 'public', table: 'workspaces', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'locations',
        foreignKey: {
          name: 'locations_country_id_fkey',
          columns: ['country_id'],
          references: { schema: 'public', table: 'countries', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'notifications',
        foreignKey: {
          name: 'notifications_recipient_id_fkey',
          columns: ['recipient_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'profiles',
        foreignKey: {
          name: 'profiles_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'profiles',
        foreignKey: {
          name: 'profiles_location_id_fkey',
          columns: ['location_id'],
          references: { schema: 'public', table: 'locations', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'room_availabilities',
        foreignKey: {
          name: 'room_availabilities_room_id_fkey',
          columns: ['room_id'],
          references: { schema: 'public', table: 'rooms', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'room_features',
        foreignKey: {
          name: 'room_features_room_id_fkey',
          columns: ['room_id'],
          references: { schema: 'public', table: 'rooms', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'room_features',
        foreignKey: {
          name: 'room_features_feature_id_fkey',
          columns: ['feature_id'],
          references: { schema: 'public', table: 'features', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'room_unavailabilities',
        foreignKey: {
          name: 'room_unavailabilities_room_id_fkey',
          columns: ['room_id'],
          references: { schema: 'public', table: 'rooms', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'rooms',
        foreignKey: {
          name: 'rooms_workspace_id_fkey',
          columns: ['workspace_id'],
          references: { schema: 'public', table: 'workspaces', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'workspace_availabilities',
        foreignKey: {
          name: 'workspace_availabilities_workspace_id_fkey',
          columns: ['workspace_id'],
          references: { schema: 'public', table: 'workspaces', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'workspaces',
        foreignKey: {
          name: 'workspaces_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'workspaces',
        foreignKey: {
          name: 'workspaces_location_id_fkey',
          columns: ['location_id'],
          references: { schema: 'public', table: 'locations', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
