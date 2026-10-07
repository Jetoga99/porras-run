import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  /** Muestra "usados / máximo" debajo del campo. */
  showCounter?: boolean;
};

export function TextField({
  label,
  error,
  showCounter = false,
  maxLength,
  value,
  multiline,
  style,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        value={value}
        maxLength={maxLength}
        multiline={multiline}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.accent : theme.backgroundSelected,
          },
          style,
        ]}
        {...rest}
      />
      <View style={styles.footer}>
        <ThemedText type="small" themeColor="accent" style={styles.error}>
          {error ?? ''}
        </ThemedText>
        {showCounter && maxLength !== undefined && (
          <ThemedText type="small" themeColor="textSecondary">
            {value?.length ?? 0} / {maxLength}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.two,
    fontSize: 16,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  error: {
    flex: 1,
  },
});
