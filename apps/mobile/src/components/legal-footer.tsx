import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Pie visible en todas las pantallas con el Aviso de Privacidad y los Términos de uso. */
export function LegalFooter() {
  const theme = useTheme();
  return (
    <View role="contentinfo" style={[styles.footer, { borderTopColor: theme.backgroundSelected }]}>
      <View style={styles.links}>
        <Link href="/privacidad">
          <ThemedText type="small" themeColor="accent" style={styles.link}>
            Aviso de Privacidad
          </ThemedText>
        </Link>
        <ThemedText type="small" themeColor="textSecondary">
          ·
        </ThemedText>
        <Link href="/terminos">
          <ThemedText type="small" themeColor="accent" style={styles.link}>
            Términos de uso
          </ThemedText>
        </Link>
      </View>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        © 2026 PorraRun · Proyecto académico UVEG
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    gap: Spacing.one,
    alignItems: 'center',
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  link: {
    textDecorationLine: 'underline',
  },
  center: {
    textAlign: 'center',
  },
});
