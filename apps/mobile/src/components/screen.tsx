import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  /** Pantallas con header de navegación: el header ya respeta el área segura superior. */
  withHeader?: boolean;
};

/** Contenedor común: fondo del tema, scroll y ancho máximo legible en pantallas grandes. */
export function Screen({ children, withHeader = false }: ScreenProps) {
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={withHeader ? ['bottom'] : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.content}>{children}</ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
});
