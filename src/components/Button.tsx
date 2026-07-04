import { Pressable, Text } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/theme';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Overrides the visible title for screen readers when the title is not enough. */
  accessibilityLabel?: string;
}

/**
 * Themed, accessible button. Hit target stays >= 44px (Section 10) and colors
 * come from tokens so it works in light and dark.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        minHeight: 48,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radii.full,
        backgroundColor: isPrimary ? colors.primary : colors.surfaceMuted,
        borderWidth: isPrimary ? 0 : 1,
        borderColor: colors.border,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          ...typography.heading,
          color: isPrimary ? colors.onPrimary : colors.textPrimary,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
