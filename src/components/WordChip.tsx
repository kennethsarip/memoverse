import { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { Token } from '@/domain/firstLetter';
import { radii, spacing, typography, useTheme } from '@/theme';

interface WordChipProps {
  token: Token;
  /** True once the full word is shown (tier-1 words, or after a correct key). */
  revealed: boolean;
  /** The token currently awaiting input (gets the highlight and any shake). */
  isCurrent: boolean;
  /** A counter that increments on a wrong key; triggers the shake when current. */
  shakeSignal: number;
  reducedMotion: boolean;
}

// Hide letters/digits behind underscores but keep punctuation, so clause rhythm
// stays as a memory cue without revealing the first letter (matches the drill).
function maskWord(raw: string): string {
  return raw.replace(/[\p{L}\p{N}]/gu, '_');
}

/**
 * One word in the verse. Hidden tokens show a masked placeholder that "blooms"
 * into the full word with a spring pop on a correct key; a wrong key on the
 * current token triggers a gentle horizontal shake (no penalty). Both
 * animations are skipped when reduced motion is on.
 */
export function WordChip({
  token,
  revealed,
  isCurrent,
  shakeSignal,
  reducedMotion,
}: WordChipProps) {
  const { colors } = useTheme();

  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);
  const wasRevealed = useRef(revealed);

  // Pop only on the hidden -> revealed transition, never on first mount (so
  // tier-1 words that start visible do not all pop when the card loads).
  useEffect(() => {
    if (!wasRevealed.current && revealed && !reducedMotion) {
      scale.value = withSequence(withTiming(1.08, { duration: 120 }), withSpring(1));
    }
    wasRevealed.current = revealed;
  }, [revealed, reducedMotion, scale]);

  // Shake the current token when a wrong key arrives (shakeSignal changes).
  useEffect(() => {
    if (shakeSignal > 0 && isCurrent && !reducedMotion) {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 40 }),
        withTiming(6, { duration: 40 }),
        withTiming(-4, { duration: 40 }),
        withTiming(0, { duration: 40 }),
      );
    }
  }, [shakeSignal, isCurrent, reducedMotion, shakeX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeX.value }],
  }));

  const backgroundColor = revealed
    ? 'transparent'
    : isCurrent
      ? colors.surface
      : colors.surfaceMuted;

  const accessibilityLabel = revealed
    ? token.raw
    : isCurrent
      ? 'Current word, hidden. Type its first letter.'
      : 'Hidden word';

  return (
    <Animated.View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radii.sm,
          borderWidth: isCurrent ? 2 : 1,
          borderColor: isCurrent
            ? colors.primary
            : revealed
              ? 'transparent'
              : colors.border,
          backgroundColor,
        },
        animatedStyle,
      ]}
    >
      {revealed ? (
        <Text
          style={{
            ...typography.verse,
            color: token.isReference ? colors.textSecondary : colors.textPrimary,
          }}
        >
          {token.raw}
        </Text>
      ) : (
        <Text style={{ ...typography.verse, color: colors.textMuted, letterSpacing: 2 }}>
          {maskWord(token.raw)}
        </Text>
      )}
    </Animated.View>
  );
}

// Exported for tests that assert the placeholder masking.
export { maskWord };
