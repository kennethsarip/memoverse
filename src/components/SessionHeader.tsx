import { Pressable, Text, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/theme';

interface SessionHeaderProps {
  reference: string;
  tier: number;
  /** Fraction of the verse completed, 0..1, driving the progress bar. */
  progress: number;
  onClose: () => void;
}

/** Top bar for the session: close control, reference, tier badge, progress. */
export function SessionHeader({
  reference,
  tier,
  progress,
  onClose,
}: SessionHeaderProps) {
  const { colors } = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={{ gap: spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close session"
          hitSlop={12}
        >
          <Text style={{ ...typography.body, color: colors.textSecondary }}>Close</Text>
        </Pressable>

        <Text style={{ ...typography.heading, color: colors.textPrimary }}>
          {reference}
        </Text>

        <View
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radii.full,
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <Text style={{ ...typography.caption, color: colors.primary }}>
            Tier {tier}
          </Text>
        </View>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
        style={{
          height: 8,
          borderRadius: radii.full,
          backgroundColor: colors.surfaceMuted,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped * 100}%`,
            height: '100%',
            borderRadius: radii.full,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}
