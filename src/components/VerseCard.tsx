import { View } from 'react-native';

import { isRevealed, type VerseAttempt } from '@/features/memorization';
import { radii, spacing, useTheme } from '@/theme';

import { WordChip } from './WordChip';

interface VerseCardProps {
  attempt: VerseAttempt;
  /** Increments on a wrong key; passed through so the current chip shakes. */
  shakeSignal: number;
  reducedMotion: boolean;
}

/**
 * The hero surface of the session: the verse laid out as wrapping word chips.
 * Each chip reveals or shakes based on the attempt state; the reference tokens
 * flow at the end (styled distinctly inside WordChip).
 */
export function VerseCard({ attempt, shakeSignal, reducedMotion }: VerseCardProps) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="text"
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.xl,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
      }}
    >
      {attempt.tokens.map((token, index) => (
        <WordChip
          key={index}
          token={token}
          revealed={isRevealed(attempt, index)}
          isCurrent={index === attempt.currentIndex}
          shakeSignal={shakeSignal}
          reducedMotion={reducedMotion}
        />
      ))}
    </View>
  );
}
