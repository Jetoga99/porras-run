import { Router } from 'express';

import { query } from '../db';

export const healthRouter = Router();

/** Comprueba que la API responde y que la conexión con PostgreSQL funciona. */
healthRouter.get('/health', async (_req, res) => {
  try {
    const { rows } = await query<{ now: Date; version: string }>(
      "SELECT now(), split_part(version(), ' ', 2) AS version",
    );
    res.json({ status: 'ok', database: 'ok', postgres: rows[0]!.version, time: rows[0]!.now });
  } catch {
    res.status(503).json({ status: 'error', database: 'unreachable' });
  }
});
