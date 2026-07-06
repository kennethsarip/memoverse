import { Pressable, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

/** Row heading for a list section (e.g. "Continue learning"), with an optional trailing action. */
export function SectionHeader({ title, actionLabel, onActionPress }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
      }}
    >
      <Text style={{ ...typography.heading, color: colors.textPrimary }}>{title}</Text>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} accessibilityRole="button" hitSlop={8}>
          <Text style={{ ...typography.caption, color: colors.primary }}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
