import { Text, View } from 'react-native';

import { radii, spacing, typography, useTheme } from '@/theme';

import { StreakFlame } from './StreakFlame';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface StreakCardProps {
  currentStreak: number;
  /** Weekday index (0 = Sunday) of "today", so the strip can mark it. */
  todayIndex: number;
  reducedMotion?: boolean;
}

/** Home streak card (Section 7, Phase 1.7): animated flame, day count, and a
 * Sun-Sat strip marking today. Streak value is a placeholder until 1.12. */
export function StreakCard({
  currentStreak,
  todayIndex,
  reducedMotion,
}: StreakCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.card,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
      }}
      accessible
      accessibilityLabel={`${currentStreak} day streak`}
    >
      <StreakFlame reducedMotion={reducedMotion} />
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.title, color: colors.textPrimary }}>
          {currentStreak} day{currentStreak === 1 ? '' : 's'}
        </Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>
          Current streak
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.xs,
            marginTop: spacing.sm,
          }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {DAY_LABELS.map((label, index) => {
            const isToday = index === todayIndex;
            return (
              <View
                key={`${label}-${index}`}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: radii.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isToday ? colors.primarySoft : 'transparent',
                  borderWidth: isToday ? 1.5 : 1,
                  borderColor: isToday ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    ...typography.tabLabel,
                    color: isToday ? colors.primaryStrong : colors.textMuted,
                  }}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
