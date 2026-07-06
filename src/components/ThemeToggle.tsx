import { Pressable, Text } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/theme';

/** Pins the app to the opposite of its current scheme (drops system-follow). */
export function ThemeToggle() {
  const { scheme, colors, toggleScheme } = useTheme();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      onPress={toggleScheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      hitSlop={8}
      style={({ pressed }) => ({
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceMuted,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ ...typography.caption, color: colors.textPrimary }}>
        {isDark ? 'Dark' : 'Light'}
      </Text>
    </Pressable>
  );
}
