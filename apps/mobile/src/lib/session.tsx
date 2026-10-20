import type { AuthResponse, Runner } from '@porras/shared';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearSession, loadSession, saveSession } from '@/lib/session-storage';

type Session = {
  /** false mientras se lee la sesión guardada (y siempre en el HTML pre-generado). */
  ready: boolean;
  token: string | null;
  runner: Runner | null;
  signIn: (auth: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [auth, setAuth] = useState<AuthResponse | null>(null);

  useEffect(() => {
    loadSession()
      .then((stored) => {
        if (stored) setAuth(JSON.parse(stored) as AuthResponse);
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (next: AuthResponse) => {
    await saveSession(JSON.stringify(next));
    setAuth(next);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setAuth(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<Session>(
    () => ({ ready, token: auth?.token ?? null, runner: auth?.runner ?? null, signIn, signOut }),
    [ready, auth, signIn, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const session = use(SessionContext);
  if (!session) throw new Error('useSession debe usarse dentro de SessionProvider');
  return session;
}
