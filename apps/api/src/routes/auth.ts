import {
  deleteAccountSchema,
  loginSchema,
  registerSchema,
  type AuthResponse,
  type Runner,
} from '@porras/shared';
import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { query } from '../db';
import { HttpError, parse } from '../lib/errors';
import { requireAuth, runnerIdOf, signToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rate-limit';

export const authRouter = Router();

type RunnerRow = { id: string; name: string; email: string; password_hash: string };

const toRunner = (row: RunnerRow): Runner => ({ id: row.id, name: row.name, email: row.email });

authRouter.post('/auth/register', authLimiter, async (req, res) => {
  const input = parse(registerSchema, req.body);
  const passwordHash = await bcrypt.hash(input.password, 10);
  try {
    const { rows } = await query<RunnerRow>(
      `INSERT INTO runners (name, email, password_hash) VALUES ($1, $2, $3)
       RETURNING id, name, email, password_hash`,
      [input.name, input.email, passwordHash],
    );
    const runner = toRunner(rows[0]!);
    res.status(201).json({ token: signToken(runner.id), runner } satisfies AuthResponse);
  } catch (err) {
    // 23505 = violación de índice único: el correo ya está registrado.
    if ((err as { code?: string }).code === '23505') {
      throw new HttpError(409, 'email_taken', 'Ya existe una cuenta con ese correo', {
        email: 'Ya existe una cuenta con ese correo',
      });
    }
    throw err;
  }
});

authRouter.post('/auth/login', authLimiter, async (req, res) => {
  const input = parse(loginSchema, req.body);
  const { rows } = await query<RunnerRow>(
    'SELECT id, name, email, password_hash FROM runners WHERE lower(email) = $1',
    [input.email],
  );
  const row = rows[0];
  // Mismo mensaje si no existe el correo o si la contraseña es incorrecta: no revelar cuentas.
  if (!row || !(await bcrypt.compare(input.password, row.password_hash))) {
    throw new HttpError(401, 'invalid_credentials', 'Correo o contraseña incorrectos');
  }
  res.json({ token: signToken(row.id), runner: toRunner(row) } satisfies AuthResponse);
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query<RunnerRow>(
    'SELECT id, name, email, password_hash FROM runners WHERE id = $1',
    [runnerIdOf(req)],
  );
  if (!rows[0]) throw new HttpError(401, 'unauthorized', 'La cuenta ya no existe');
  res.json(toRunner(rows[0]));
});

/**
 * Elimina la cuenta y, en cascada, todas sus carreras y porras (ON DELETE CASCADE).
 * Se pide la contraseña para que nadie con el teléfono desbloqueado la borre por accidente.
 */
authRouter.delete('/me', authLimiter, requireAuth, async (req, res) => {
  const input = parse(deleteAccountSchema, req.body);
  const { rows } = await query<RunnerRow>(
    'SELECT id, name, email, password_hash FROM runners WHERE id = $1',
    [runnerIdOf(req)],
  );
  const row = rows[0];
  if (!row) throw new HttpError(401, 'unauthorized', 'La cuenta ya no existe');
  if (!(await bcrypt.compare(input.password, row.password_hash))) {
    throw new HttpError(401, 'invalid_credentials', 'La contraseña no es correcta', {
      password: 'La contraseña no es correcta',
    });
  }
  await query('DELETE FROM runners WHERE id = $1', [row.id]);
  res.status(204).end();
});
