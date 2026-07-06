import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { radii, spacing, typography, useTheme, type ThemeColors } from '@/theme';

import { Button } from './Button';

interface SessionCompleteCardProps {
  /** Real value from the engine (attemptAccuracy), 0..1. */
  accuracy: number;
  /** Placeholder until gamification (Phase 1.7) wires real XP/streak/badges. */
  xpEarned: number;
  currentStreak: number;
  newBadge?: { title: string } | null;
  verseReference?: string;
  onContinue: () => void;
  reducedMotion: boolean;
}

function StatTile({
  value,
  label,
  colors,
}: {
  value: string;
  label: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: colors.surfaceMuted,
      }}
    >
      <Text style={{ ...typography.title, color: colors.textPrimary }}>{value}</Text>
      <Text
        style={{
          ...typography.caption,
          color: colors.textSecondary,
          marginTop: spacing.xs,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** A checkmark drawn from Views (no emoji/glyph) inside a success circle. */
function SuccessCheck({ colors }: { colors: ThemeColors }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: 88,
        height: 88,
        borderRadius: radii.full,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 22,
          height: 40,
          marginTop: -6,
          borderRightWidth: 6,
          borderBottomWidth: 6,
          borderColor: colors.onPrimary,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/**
 * The end-of-session celebration. Accuracy is real (from the engine); XP,
 * streak, and badges are placeholders wired live in the gamification phase
 * (1.7), so the caption says so rather than implying they are final.
 */
export function SessionCompleteCard({
  accuracy,
  xpEarned,
  currentStreak,
  newBadge,
  verseReference,
  onContinue,
  reducedMotion,
}: SessionCompleteCardProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    if (!reducedMotion) {
      progress.value = withSpring(1, { damping: 12 });
    }
  }, [reducedMotion, progress]);

  const entranceStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value, { duration: 200 }),
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  return (
    <Animated.View
      style={[{ alignItems: 'center', gap: spacing.xl, width: '100%' }, entranceStyle]}
    >
      <SuccessCheck colors={colors} />

      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text style={{ ...typography.title, color: colors.textPrimary }}>
          Session complete
        </Text>
        {verseReference ? (
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            You worked through {verseReference}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.md, width: '100%' }}>
        <StatTile value={`${xpEarned}`} label="XP earned" colors={colors} />
        <StatTile value={`${currentStreak}`} label="Day streak" colors={colors} />
        <StatTile
          value={`${Math.round(accuracy * 100)}%`}
          label="Accuracy"
          colors={colors}
        />
      </View>

      {newBadge ? (
        <View
          style={{
            width: '100%',
            padding: spacing.lg,
            borderRadius: radii.lg,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
          }}
        >
          <Text style={{ ...typography.caption, color: colors.textPrimary }}>
            New badge
          </Text>
          <Text style={{ ...typography.heading, color: colors.textPrimary }}>
            {newBadge.title}
          </Text>
        </View>
      ) : null}

      <Text
        style={{
          ...typography.caption,
          color: colors.textMuted,
          textAlign: 'center',
        }}
      >
        XP, streak, and badges go live in the gamification phase.
      </Text>

      <Button title="Continue" onPress={onContinue} />
    </Animated.View>
  );
}
