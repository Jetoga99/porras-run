import { ipKeyGenerator, rateLimit } from 'express-rate-limit';

const message = (text: string) => ({ error: 'rate_limited', message: text });

/** Registro e inicio de sesión: frena intentos de adivinar contraseñas. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: message('Demasiados intentos. Espera unos minutos y vuelve a intentar.'),
});

/** Link público: cada persona puede mandar hasta 5 porras por carrera cada 10 minutos. */
export const sendMessageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // ipKeyGenerator agrupa las IPv6 por subred para que no se pueda saltar el límite.
  keyGenerator: (req) => `${ipKeyGenerator(req.ip ?? '')}:${req.params.slug}`,
  message: message('Ya mandaste varias porras. Espera unos minutos para mandar otra.'),
});
