import type {
  CreateRaceInput,
  Message,
  PublicRace,
  Race,
  SendMessageInput,
  UpdateMessageInput,
  UpdateRaceInput,
} from '@porras/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { api, ApiRequestError } from '@/lib/api';
import { useSession } from '@/lib/session';

/** Si la API responde 401 (sesión vencida o inválida) se cierra la sesión local. */
function useSignOutOn401(error: unknown) {
  const { signOut } = useSession();
  useEffect(() => {
    if (error instanceof ApiRequestError && error.status === 401) {
      void signOut();
    }
  }, [error, signOut]);
}

export function useRaces() {
  const { token } = useSession();
  const query = useQuery({
    queryKey: ['races'],
    queryFn: () => api<Race[]>('/races', { token }),
    enabled: !!token,
  });
  useSignOutOn401(query.error);
  return query;
}

export function useRace(id: string) {
  const { token } = useSession();
  const query = useQuery({
    queryKey: ['races', id],
    queryFn: () => api<Race>(`/races/${id}`, { token }),
    enabled: !!token && !!id,
  });
  useSignOutOn401(query.error);
  return query;
}

export function useMessages(raceId: string) {
  const { token } = useSession();
  const query = useQuery({
    queryKey: ['races', raceId, 'messages'],
    queryFn: () => api<Message[]>(`/races/${raceId}/messages`, { token }),
    enabled: !!token && !!raceId,
  });
  useSignOutOn401(query.error);
  return query;
}

export function useCreateRace() {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRaceInput) =>
      api<Race>('/races', { method: 'POST', body: input, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['races'] }),
  });
}

export function useUpdateRace(id: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRaceInput) =>
      api<Race>(`/races/${id}`, { method: 'PATCH', body: input, token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['races'] }),
  });
}

/** Marcar escuchada, ocultar o reportar una porra. */
export function useMessageAction(raceId: string) {
  const { token } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: UpdateMessageInput | 'report' }) =>
      action === 'report'
        ? api<Message>(`/messages/${id}/report`, { method: 'POST', token })
        : api<Message>(`/messages/${id}`, { method: 'PATCH', body: action, token }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['races', raceId] });
      void queryClient.invalidateQueries({ queryKey: ['races'], exact: true });
    },
  });
}

export function usePublicRace(slug: string) {
  return useQuery({
    queryKey: ['public', slug],
    queryFn: () => api<PublicRace>(`/public/races/${slug}`),
    enabled: !!slug,
    retry: (count, error) =>
      !(error instanceof ApiRequestError && error.status === 404) && count < 2,
  });
}

export function useSendMessage(slug: string) {
  return useMutation({
    mutationFn: (input: SendMessageInput) =>
      api<{ ok: true }>(`/public/races/${slug}/messages`, { method: 'POST', body: input }),
  });
}
