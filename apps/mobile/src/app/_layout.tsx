import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
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
        <Stack.Screen name="c/[slug]" options={{ title: 'Manda tu porra' }} />
        <Stack.Screen name="carreras/index" options={{ title: 'Mis carreras' }} />
        <Stack.Screen name="carreras/[id]" options={{ title: 'Carrera' }} />
      </Stack>
    </ThemeProvider>
  );
}
