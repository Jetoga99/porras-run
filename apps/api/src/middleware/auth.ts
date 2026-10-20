import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config';
import { HttpError } from '../lib/errors';

type TokenPayload = { sub: string };

declare module 'express-serve-static-core' {
  interface Request {
    /** id del corredor autenticado; lo asigna requireAuth. */
    runnerId?: string;
  }
}

export function signToken(runnerId: string) {
  return jwt.sign({ sub: runnerId } satisfies TokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** Exige un header `Authorization: Bearer <token>` válido. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'unauthorized', 'Inicia sesión para continuar');
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.runnerId = payload.sub;
    next();
  } catch {
    throw new HttpError(401, 'unauthorized', 'Tu sesión expiró, vuelve a iniciar sesión');
  }
};

/** Para usar después de requireAuth en handlers donde TypeScript necesita el id seguro. */
export function runnerIdOf(req: { runnerId?: string }) {
  if (!req.runnerId) throw new HttpError(401, 'unauthorized', 'Inicia sesión para continuar');
  return req.runnerId;
}
