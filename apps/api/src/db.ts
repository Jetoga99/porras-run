import pg from 'pg';

import { config } from './config';

// NUMERIC (distance_km) llega como texto por defecto; lo convertimos a número.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => Number(value));

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
});

/** Atajo para consultas parametrizadas: los valores nunca se concatenan al SQL. */
export async function query<Row extends pg.QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<Row>(text, params);
}
