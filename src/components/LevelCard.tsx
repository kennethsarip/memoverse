import { Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { radii, spacing, typography, useTheme } from '@/theme';

import { ProgressRing } from './ProgressRing';

interface LevelCardProps {
  level: number;
  xp: number;
  /** XP earned so far within the current level (0..xpToNextLevel). */
  xpIntoLevel: number;
  xpToNextLevel: number;
}

/** Home Level/XP card (Section 7, Phase 1.7): a progress ring toward the next
 * level plus total XP. Values are placeholders until gamification (1.12). */
export function LevelCard({ level, xp, xpIntoLevel, xpToNextLevel }: LevelCardProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = xpToNextLevel === 0 ? 0 : xpIntoLevel / xpToNextLevel;

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
      accessibilityLabel={`Level ${level}, ${xp} total XP, ${xpIntoLevel} of ${xpToNextLevel} XP to next level`}
    >
      <ProgressRing
        progress={progress}
        size={64}
        strokeWidth={6}
        reducedMotion={reducedMotion}
      >
        <Text style={{ ...typography.heading, color: colors.textPrimary }}>{level}</Text>
      </ProgressRing>
      <View style={{ flex: 1 }}>
        <Text style={{ ...typography.title, color: colors.textPrimary }}>{xp} XP</Text>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>
          {xpToNextLevel - xpIntoLevel} XP to level {level + 1}
        </Text>
      </View>
    </View>
  );
}
