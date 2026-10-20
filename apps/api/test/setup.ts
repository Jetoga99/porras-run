import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll } from 'vitest';

import { pool } from '../src/db';

const schema = readFileSync(
  fileURLToPath(new URL('../../../db/01-schema.sql', import.meta.url)),
  'utf8',
);

beforeAll(async () => {
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await pool.query(schema);
});

afterAll(async () => {
  await pool.end();
});
