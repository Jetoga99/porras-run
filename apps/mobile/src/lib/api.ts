import type { ApiError } from '@porras/shared';

import { apiUrl } from '@/constants/config';

/** Error de la API con el código HTTP y, si aplica, el mensaje de cada campo del formulario. */
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export async function api<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}) {
  let response: Response;
  try {
    response = await fetch(`${apiUrl()}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(0, 'No pudimos conectar con el servidor. Revisa tu conexión.');
  }

  if (response.status === 204) return undefined as T;
  const data = (await response.json().catch(() => null)) as T | ApiError | null;
  if (!response.ok) {
    const error = data as ApiError | null;
    throw new ApiRequestError(
      response.status,
      error?.message ?? 'Ocurrió un error inesperado',
      error?.fields,
    );
  }
  return data as T;
}

/** Mensaje legible para mostrar en pantalla a partir de cualquier error. */
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
}
