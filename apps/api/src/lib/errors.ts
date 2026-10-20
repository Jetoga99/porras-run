import type { ApiError } from '@porras/shared';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { z } from 'zod';

/** Error con código HTTP que el manejador central convierte en respuesta JSON. */
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const notFound = (what = 'Recurso') =>
  new HttpError(404, 'not_found', `${what} no encontrado`);

/** Valida con un esquema de zod y devuelve los datos limpios, o lanza un 400 con el error por campo. */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  throw new HttpError(400, 'validation', 'Revisa los datos enviados', fields);
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Ruta no encontrada' } satisfies ApiError);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = { error: err.code, message: err.message };
    if (err.fields) body.fields = err.fields;
    res.status(err.status).json(body);
    return;
  }
  // JSON mal formado en el cuerpo de la petición.
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'bad_json', message: 'El cuerpo no es JSON válido' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'too_large', message: 'La petición es demasiado grande' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'internal', message: 'Ocurrió un error en el servidor' });
};
