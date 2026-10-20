import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { SessionProvider } from '@/lib/session';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 15_000 } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              headerTintColor: theme.accent,
              headerStyle: { backgroundColor: theme.background },
              headerTitleStyle: { color: theme.text },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: theme.background },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false, title: 'PorraRun' }} />
            <Stack.Screen name="login" options={{ title: 'Entrar' }} />
            <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
            <Stack.Screen name="c/[slug]" options={{ title: 'Manda tu porra' }} />
            <Stack.Screen name="carreras/index" options={{ title: 'Mis carreras' }} />
            <Stack.Screen name="carreras/nueva" options={{ title: 'Nueva carrera' }} />
            <Stack.Screen name="carreras/[id]" options={{ title: 'Carrera' }} />
            <Stack.Screen name="privacidad" options={{ title: 'Aviso de Privacidad' }} />
            <Stack.Screen name="terminos" options={{ title: 'Términos de uso' }} />
            <Stack.Screen name="cuenta/eliminar" options={{ title: 'Eliminar cuenta' }} />
          </Stack>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
