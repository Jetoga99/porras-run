import {
  createRaceSchema,
  updateMessageSchema,
  updateRaceSchema,
  type Message,
  type Race,
} from '@porras/shared';
import { Router, type Request } from 'express';

import { query } from '../db';
import { notFound, parse } from '../lib/errors';
import { isUuid, makeSlug } from '../lib/util';
import { requireAuth, runnerIdOf } from '../middleware/auth';

/** Rutas del corredor: todas requieren sesión y solo tocan datos de su propia cuenta. */
export const racesRouter = Router();
racesRouter.use(requireAuth);

type RaceRow = {
  id: string;
  event_name: string;
  starts_at: Date;
  city: string | null;
  distance_km: number | null;
  share_slug: string;
  messages_open: boolean;
  message_count: string;
  pending_count: string;
};

type MessageRow = {
  id: string;
  sender_name: string;
  body: string | null;
  status: Message['status'];
  listened_at: Date | null;
  created_at: Date;
};

const RACE_SELECT = `
  SELECT r.id, r.event_name, r.starts_at, r.city, r.distance_km, r.share_slug, r.messages_open,
         count(m.id) FILTER (WHERE m.status <> 'hidden')                          AS message_count,
         count(m.id) FILTER (WHERE m.status <> 'hidden' AND m.listened_at IS NULL) AS pending_count
    FROM races r
    LEFT JOIN messages m ON m.race_id = r.id`;

const toRace = (row: RaceRow): Race => ({
  id: row.id,
  eventName: row.event_name,
  startsAt: row.starts_at.toISOString(),
  city: row.city,
  distanceKm: row.distance_km,
  shareSlug: row.share_slug,
  messagesOpen: row.messages_open,
  messageCount: Number(row.message_count),
  pendingCount: Number(row.pending_count),
});

const toMessage = (row: MessageRow): Message => ({
  id: row.id,
  senderName: row.sender_name,
  body: row.body,
  status: row.status,
  listened: row.listened_at !== null,
  createdAt: row.created_at.toISOString(),
});

async function findOwnRace(req: Request, id: string) {
  if (!isUuid(id)) throw notFound('Carrera');
  const { rows } = await query<RaceRow>(
    `${RACE_SELECT} WHERE r.id = $1 AND r.runner_id = $2 GROUP BY r.id`,
    [id, runnerIdOf(req)],
  );
  if (!rows[0]) throw notFound('Carrera');
  return rows[0];
}

racesRouter.get('/races', async (req, res) => {
  const { rows } = await query<RaceRow>(
    `${RACE_SELECT} WHERE r.runner_id = $1 GROUP BY r.id ORDER BY r.starts_at DESC`,
    [runnerIdOf(req)],
  );
  res.json(rows.map(toRace));
});

racesRouter.post('/races', async (req, res) => {
  const input = parse(createRaceSchema, req.body);
  // Reintento por si el sufijo aleatorio del link ya existiera (muy improbable).
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { rows } = await query<{ id: string }>(
        `INSERT INTO races (runner_id, event_name, starts_at, city, distance_km, share_slug)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          runnerIdOf(req),
          input.eventName,
          input.startsAt,
          input.city || null,
          input.distanceKm ?? null,
          makeSlug(input.eventName),
        ],
      );
      const race = await findOwnRace(req, rows[0]!.id);
      res.status(201).json(toRace(race));
      return;
    } catch (err) {
      if ((err as { code?: string }).code !== '23505') throw err;
    }
  }
  throw new Error('No se pudo generar un link único');
});

racesRouter.get('/races/:id', async (req, res) => {
  res.json(toRace(await findOwnRace(req, req.params.id as string)));
});

racesRouter.patch('/races/:id', async (req, res) => {
  const race = await findOwnRace(req, req.params.id as string);
  const input = parse(updateRaceSchema, req.body);
  if (input.messagesOpen !== undefined) {
    await query('UPDATE races SET messages_open = $1 WHERE id = $2', [input.messagesOpen, race.id]);
  }
  res.json(toRace(await findOwnRace(req, race.id)));
});

racesRouter.delete('/races/:id', async (req, res) => {
  const race = await findOwnRace(req, req.params.id as string);
  await query('DELETE FROM races WHERE id = $1', [race.id]);
  res.status(204).end();
});

racesRouter.get('/races/:id/messages', async (req, res) => {
  const race = await findOwnRace(req, req.params.id as string);
  const { rows } = await query<MessageRow>(
    `SELECT id, sender_name, body, status, listened_at, created_at
       FROM messages
      WHERE race_id = $1 AND status <> 'hidden'
      ORDER BY created_at DESC`,
    [race.id],
  );
  res.json(rows.map(toMessage));
});

/** Busca una porra validando que pertenezca a una carrera del corredor en sesión. */
async function findOwnMessage(req: Request, id: string) {
  if (!isUuid(id)) throw notFound('Porra');
  const { rows } = await query<MessageRow>(
    `SELECT m.id, m.sender_name, m.body, m.status, m.listened_at, m.created_at
       FROM messages m JOIN races r ON r.id = m.race_id
      WHERE m.id = $1 AND r.runner_id = $2`,
    [id, runnerIdOf(req)],
  );
  if (!rows[0]) throw notFound('Porra');
  return rows[0];
}

racesRouter.patch('/messages/:id', async (req, res) => {
  const message = await findOwnMessage(req, req.params.id as string);
  const input = parse(updateMessageSchema, req.body);
  const { rows } = await query<MessageRow>(
    `UPDATE messages
        SET listened_at = CASE WHEN $2::boolean IS NULL THEN listened_at
                               WHEN $2 THEN coalesce(listened_at, now()) ELSE NULL END,
            status      = CASE WHEN $3::boolean IS NULL THEN status
                               WHEN $3 THEN 'hidden' ELSE 'visible' END
      WHERE id = $1
      RETURNING id, sender_name, body, status, listened_at, created_at`,
    [message.id, input.listened ?? null, input.hidden ?? null],
  );
  res.json(toMessage(rows[0]!));
});

racesRouter.post('/messages/:id/report', async (req, res) => {
  const message = await findOwnMessage(req, req.params.id as string);
  const { rows } = await query<MessageRow>(
    `UPDATE messages SET status = 'reported' WHERE id = $1
     RETURNING id, sender_name, body, status, listened_at, created_at`,
    [message.id],
  );
  res.json(toMessage(rows[0]!));
});

racesRouter.delete('/messages/:id', async (req, res) => {
  const message = await findOwnMessage(req, req.params.id as string);
  await query('DELETE FROM messages WHERE id = $1', [message.id]);
  res.status(204).end();
});
