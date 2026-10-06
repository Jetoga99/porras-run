import { LIMITS } from '@porras/shared';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

/** Pantalla provisional de la Fase 0: confirma que la app corre en las 3 plataformas. */
export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" themeColor="accent" style={styles.center}>
          PorraRun
        </ThemedText>
        <ThemedText style={styles.center}>Tus amigos te mandan porras mientras corres.</ThemedText>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Fase 0 lista</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Plataforma: {Platform.OS}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Mensajes de hasta {LIMITS.messageMaxChars} caracteres y audios de{' '}
            {LIMITS.audioMaxSeconds} s (paquete compartido OK).
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
});
