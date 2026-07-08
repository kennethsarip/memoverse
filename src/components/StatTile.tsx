import { Text, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/theme';

interface StatTileProps {
  value: number;
  label: string;
}

/** One tile in the Home stats row (Section 7, Phase 1.7): a count over a label. */
export function StatTile({ value, label }: StatTileProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radii.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
      }}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <Text style={{ ...typography.title, color: colors.textPrimary }}>{value}</Text>
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}
