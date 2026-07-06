import { Pressable, Text } from 'react-native';

import { radii, spacing, typography, useTheme, type ThemeColors } from '@/theme';

type ChipTone = 'neutral' | 'primary' | 'success' | 'danger';

interface ChipProps {
  label: string;
  tone?: ChipTone;
  /** Filled state (e.g. the active filter, or an overdue status pill). */
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

function toneColor(colors: ThemeColors, tone: ChipTone): string {
  switch (tone) {
    case 'primary':
      return colors.primary;
    case 'success':
      return colors.success;
    case 'danger':
      return colors.danger;
    case 'neutral':
      return colors.textSecondary;
  }
}

/** Pill used for filters (All/Learning/Mastered) and status badges (Overdue). */
export function Chip({
  label,
  tone = 'neutral',
  selected = false,
  onPress,
  accessibilityLabel,
}: ChipProps) {
  const { colors } = useTheme();
  const color = toneColor(colors, tone);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={onPress ? { selected } : undefined}
      style={({ pressed }) => ({
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radii.full,
        borderWidth: tone === 'neutral' ? 1 : 1.5,
        borderColor: tone === 'neutral' ? colors.border : color,
        backgroundColor: selected ? color : 'transparent',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          ...typography.caption,
          color: selected ? colors.onPrimary : color,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
