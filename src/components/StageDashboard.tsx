import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { Tier } from '@/domain/firstLetter';
import { radii, spacing, typography, useTheme } from '@/theme';

import { Button } from './Button';
import { Chip } from './Chip';

/** Accuracy needed to unlock the next, harder stage (Section 1 UI direction). */
export const ADVANCE_ACCURACY_GATE = 0.9;

interface StageDashboardProps {
  accuracy: number;
  finishedTier: Tier;
  isFinalStage: boolean;
  onRepeat: () => void;
  onContinue: () => void;
  /** Ends the session at the current (unadvanced) stage without meeting the gate. */
  onFinishEarly: () => void;
  reducedMotion: boolean;
}

const STAGE_LABEL: Record<Tier, string> = {
  1: 'Type it',
  2: 'Memorize it',
  3: 'Master it',
};

/**
 * Between-stage dashboard (Section 7, Phase 1.9): shown after a stage
 * completes. Continue is gated at the 90% accuracy threshold when a harder
 * stage remains — below it, only Repeat is offered outright, with a quieter
 * "finish for today" escape hatch so a learner is never fully stuck.
 */
export function StageDashboard({
  accuracy,
  finishedTier,
  isFinalStage,
  onRepeat,
  onContinue,
  onFinishEarly,
  reducedMotion,
}: StageDashboardProps) {
  const { colors } = useTheme();
  const passed = accuracy >= ADVANCE_ACCURACY_GATE;
  const canContinue = isFinalStage || passed;

  const opacity = useSharedValue(reducedMotion ? 1 : 0);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: reducedMotion ? 0 : 200 });
  }, [opacity, reducedMotion]);
  const entranceStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ alignItems: 'center', gap: spacing.lg, width: '100%' }, entranceStyle]}
    >
      <Chip
        label={`${Math.round(accuracy * 100)}% accuracy`}
        tone={passed ? 'success' : 'danger'}
        selected
      />

      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text style={{ ...typography.title, color: colors.textPrimary }}>
          {STAGE_LABEL[finishedTier]} complete
        </Text>
        <Text
          style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}
        >
          {isFinalStage
            ? 'Nice work. Finish up whenever you are ready.'
            : passed
              ? 'Great recall. Ready for the next stage?'
              : `Get to ${Math.round(ADVANCE_ACCURACY_GATE * 100)}% to move on, or repeat this stage.`}
        </Text>
      </View>

      <View
        style={{
          width: '100%',
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          padding: spacing.lg,
          gap: spacing.sm,
        }}
      >
        <Button title="Repeat this stage" variant="ghost" onPress={onRepeat} />
        <Button
          title={isFinalStage ? 'Finish' : 'Continue'}
          onPress={onContinue}
          disabled={!canContinue}
        />
      </View>

      {!isFinalStage && !passed ? (
        <Pressable
          onPress={onFinishEarly}
          accessibilityRole="button"
          accessibilityLabel="Finish for today without advancing this stage"
        >
          <Text style={{ ...typography.caption, color: colors.textMuted }}>
            Finish for today instead
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
