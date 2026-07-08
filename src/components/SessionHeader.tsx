import { Pressable, Text, View } from 'react-native';

import type { Tier } from '@/domain/firstLetter';
import { radii, spacing, typography, useTheme } from '@/theme';

import { StageStepper } from './StageStepper';

interface SessionHeaderProps {
  reference: string;
  tier: Tier;
  /** Fraction of the current stage completed, 0..1, driving the progress bar. */
  progress: number;
  onClose: () => void;
  /** True for a no-stakes practice run launched from Verses (Phase 1.9). */
  isPractice?: boolean;
}

/** Top bar for the session: close control, reference + practice badge, the
 * linked stage stepper, and a progress bar for the active stage. */
export function SessionHeader({
  reference,
  tier,
  progress,
  onClose,
  isPractice = false,
}: SessionHeaderProps) {
  const { colors } = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={{ gap: spacing.lg }}>
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

        {isPractice ? (
          <View
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              borderRadius: radii.full,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text style={{ ...typography.caption, color: colors.primary }}>Practice</Text>
          </View>
        ) : (
          <View style={{ width: 52 }} />
        )}
      </View>

      <StageStepper currentTier={tier} />

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
