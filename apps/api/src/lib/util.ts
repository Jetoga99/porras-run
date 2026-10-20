import { createHash, randomBytes } from 'node:crypto';

import { config } from '../config';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Evita mandar a PostgreSQL ids mal formados (que provocarían un error 500). */
export function isUuid(value: string) {
  return UUID.test(value);
}

/** "Medio Maratón de Guanajuato" → "medio-maraton-de-guanaju-k7f2" */
export function makeSlug(eventName: string) {
  const base = eventName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/g, '');
  const suffix = randomBytes(3).toString('hex').slice(0, 4);
  return `${base || 'carrera'}-${suffix}`;
}

/** Hash de la IP con sal: sirve para detectar abuso sin guardar la IP original. */
export function hashIp(ip: string | undefined) {
  return createHash('sha256')
    .update(`${config.ipHashSalt}:${ip ?? 'desconocida'}`)
    .digest('hex');
}

/** Solo el primer nombre del corredor se muestra en la página pública. */
export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}
