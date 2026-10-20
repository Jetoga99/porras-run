import { z } from 'zod';

/** Límites de negocio: la app y la API usan exactamente los mismos. */
export const LIMITS = {
  runnerNameMaxChars: 80,
  passwordMinChars: 8,
  // bcrypt solo considera los primeros 72 bytes de la contraseña.
  passwordMaxChars: 72,
  eventNameMaxChars: 120,
  cityMaxChars: 80,
  senderNameMaxChars: 60,
  messageMaxChars: 500,
  audioMaxSeconds: 60,
} as const;

// ---------------------------------------------------------------------------
// Cuentas de corredor
// ---------------------------------------------------------------------------

// Primero se limpia (espacios y mayúsculas) y después se valida el formato.
const email = z
  .string({ error: 'Escribe tu correo' })
  .trim()
  .toLowerCase()
  .max(160)
  .pipe(z.email({ error: 'Escribe un correo válido' }));

export const registerSchema = z.object({
  name: z.string().trim().min(2, { error: 'Escribe tu nombre' }).max(LIMITS.runnerNameMaxChars),
  email,
  password: z
    .string()
    .min(LIMITS.passwordMinChars, {
      error: `La contraseña debe tener al menos ${LIMITS.passwordMinChars} caracteres`,
    })
    .max(LIMITS.passwordMaxChars),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Escribe tu contraseña' }).max(LIMITS.passwordMaxChars),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Confirmación para eliminar la cuenta (exigida por Google Play y la App Store). */
export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, { error: 'Escribe tu contraseña para confirmar' })
    .max(LIMITS.passwordMaxChars),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// ---------------------------------------------------------------------------
// Carreras
// ---------------------------------------------------------------------------

/** Datos que captura el corredor al crear una carrera. */
export const createRaceSchema = z.object({
  eventName: z
    .string()
    .trim()
    .min(3, { error: 'El nombre del evento debe tener al menos 3 caracteres' })
    .max(LIMITS.eventNameMaxChars),
  startsAt: z.iso.datetime({ offset: true, error: 'Fecha y hora de salida inválidas' }),
  city: z.string().trim().max(LIMITS.cityMaxChars).optional(),
  distanceKm: z
    .number({ error: 'Escribe la distancia en kilómetros' })
    .positive({ error: 'La distancia debe ser mayor a 0' })
    .max(500)
    .optional(),
});
export type CreateRaceInput = z.infer<typeof createRaceSchema>;

/** Cambios que el corredor puede hacer a su carrera (por ahora, abrir o cerrar la recepción). */
export const updateRaceSchema = z
  .object({ messagesOpen: z.boolean() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, { error: 'No hay cambios' });
export type UpdateRaceInput = z.infer<typeof updateRaceSchema>;

// ---------------------------------------------------------------------------
// Porras
// ---------------------------------------------------------------------------

/** Campos de texto del formulario público donde un amigo manda su porra. */
export const sendMessageSchema = z.object({
  senderName: z
    .string()
    .trim()
    .min(1, { error: 'Escribe tu nombre' })
    .max(LIMITS.senderNameMaxChars),
  body: z.string().trim().max(LIMITS.messageMaxChars).optional(),
  acceptedTerms: z.literal(true, {
    error: 'Debes aceptar los Términos y el Aviso de Privacidad',
  }),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/** Acciones del corredor sobre una porra recibida. */
export const updateMessageSchema = z
  .object({ listened: z.boolean(), hidden: z.boolean() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, { error: 'No hay cambios' });
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

// ---------------------------------------------------------------------------
// Respuestas de la API (contrato entre la app y el servidor)
// ---------------------------------------------------------------------------

export type Runner = { id: string; name: string; email: string };

export type AuthResponse = { token: string; runner: Runner };

export type Race = {
  id: string;
  eventName: string;
  startsAt: string;
  city: string | null;
  distanceKm: number | null;
  shareSlug: string;
  messagesOpen: boolean;
  messageCount: number;
  pendingCount: number;
};

export type MessageStatus = 'visible' | 'hidden' | 'reported';

export type Message = {
  id: string;
  senderName: string;
  body: string | null;
  status: MessageStatus;
  listened: boolean;
  createdAt: string;
};

/** Lo mínimo que ve un amigo al abrir el link: sin correo ni datos de la cuenta. */
export type PublicRace = {
  eventName: string;
  startsAt: string;
  city: string | null;
  distanceKm: number | null;
  messagesOpen: boolean;
  runnerName: string;
};

/** Forma de todos los errores de la API. `fields` trae el mensaje por campo cuando es validación. */
export type ApiError = { error: string; message: string; fields?: Record<string, string> };
