import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
};

export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          { borderColor: theme.accent },
          checked && { backgroundColor: theme.accent },
        ]}
      >
        {checked && (
          <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
            ✓
          </ThemedText>
        )}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
