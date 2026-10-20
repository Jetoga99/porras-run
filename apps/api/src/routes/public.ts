import { sendMessageSchema, type PublicRace } from '@porras/shared';
import { Router } from 'express';

import { query } from '../db';
import { HttpError, notFound, parse } from '../lib/errors';
import { firstName, hashIp } from '../lib/util';
import { sendMessageLimiter } from '../middleware/rate-limit';

/** Rutas del link público: las usa quien manda una porra, sin cuenta. */
export const publicRouter = Router();

type PublicRaceRow = {
  id: string;
  event_name: string;
  starts_at: Date;
  city: string | null;
  distance_km: number | null;
  messages_open: boolean;
  runner_name: string;
};

async function findBySlug(slug: string) {
  const { rows } = await query<PublicRaceRow>(
    `SELECT r.id, r.event_name, r.starts_at, r.city, r.distance_km, r.messages_open,
            u.name AS runner_name
       FROM races r JOIN runners u ON u.id = r.runner_id
      WHERE r.share_slug = $1`,
    [slug],
  );
  if (!rows[0]) throw notFound('Carrera');
  return rows[0];
}

publicRouter.get('/public/races/:slug', async (req, res) => {
  const race = await findBySlug(req.params.slug as string);
  res.json({
    eventName: race.event_name,
    startsAt: race.starts_at.toISOString(),
    city: race.city,
    distanceKm: race.distance_km,
    messagesOpen: race.messages_open,
    runnerName: firstName(race.runner_name),
  } satisfies PublicRace);
});

publicRouter.post('/public/races/:slug/messages', sendMessageLimiter, async (req, res) => {
  const race = await findBySlug(req.params.slug as string);
  const input = parse(sendMessageSchema, req.body);
  // Mientras no exista el audio (Fase 3), el texto es obligatorio.
  if (!input.body) {
    throw new HttpError(400, 'validation', 'Revisa los datos enviados', {
      body: 'Escribe tu porra',
    });
  }
  if (!race.messages_open) {
    throw new HttpError(409, 'messages_closed', 'La recepción de porras está cerrada');
  }
  await query(
    `INSERT INTO messages (race_id, sender_name, body, sender_hash, terms_accepted_at)
     VALUES ($1, $2, $3, $4, now())`,
    [race.id, input.senderName, input.body, hashIp(req.ip)],
  );
  res.status(201).json({ ok: true });
});
