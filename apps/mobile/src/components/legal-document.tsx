import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalDocumentProps = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

/** Formato común para el Aviso de Privacidad y los Términos de uso. */
export function LegalDocument({ title, updatedAt, intro, sections }: LegalDocumentProps) {
  return (
    <View style={styles.document}>
      <View style={styles.header}>
        <ThemedText type="subtitle" role="heading" aria-level={2}>
          {title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Última actualización: {updatedAt}
        </ThemedText>
      </View>
      <ThemedText>{intro}</ThemedText>
      {sections.map((section, index) => (
        <View key={section.title} style={styles.section}>
          <ThemedText type="smallBold" role="heading" aria-level={3}>
            {index + 1}. {section.title}
          </ThemedText>
          {section.paragraphs?.map((paragraph) => (
            <ThemedText key={paragraph} type="small">
              {paragraph}
            </ThemedText>
          ))}
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bullet}>
              <ThemedText type="small">•</ThemedText>
              <ThemedText type="small" style={styles.bulletText}>
                {bullet}
              </ThemedText>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  document: {
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.two,
  },
  bullet: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingLeft: Spacing.two,
  },
  bulletText: {
    flex: 1,
  },
});
