import { Text, View } from 'react-native';

import type { Tier } from '@/domain/firstLetter';
import { radii, spacing, typography, useTheme, type ThemeColors } from '@/theme';

interface StageStepperProps {
  /** The stage currently being drilled. */
  currentTier: Tier;
}

const STAGE_LABEL: Record<Tier, string> = {
  1: 'Type it',
  2: 'Memorize it',
  3: 'Master it',
};

function dotColor(colors: ThemeColors, stage: Tier, currentTier: Tier): string {
  if (stage < currentTier) return colors.primary; // completed this session
  if (stage === currentTier) return colors.primary; // active
  return colors.surfaceMuted; // upcoming
}

/**
 * The linked 1-2-3 session stepper (Section 7, Phase 1.9): Type it / Memorize
 * it / Master it, reflecting the verse's interval-driven stage (Section 8.3).
 * Completed and active stages fill solid; upcoming stages stay hollow, linked
 * by a connecting rule so the three read as one progression.
 */
export function StageStepper({ currentTier }: StageStepperProps) {
  const { colors } = useTheme();
  const stages: Tier[] = [1, 2, 3];

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={`Session stage: ${STAGE_LABEL[currentTier]}`}
      style={{ flexDirection: 'row', alignItems: 'center' }}
    >
      {stages.map((stage, index) => {
        const done = stage < currentTier;
        const active = stage === currentTier;
        return (
          <View key={stage} style={{ flex: index === stages.length - 1 ? 0 : 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                accessibilityElementsHidden
                style={{
                  width: active ? 12 : 8,
                  height: active ? 12 : 8,
                  borderRadius: radii.full,
                  backgroundColor: dotColor(colors, stage, currentTier),
                  borderWidth: done || active ? 0 : 1.5,
                  borderColor: colors.border,
                }}
              />
              {index < stages.length - 1 ? (
                <View
                  accessibilityElementsHidden
                  style={{
                    flex: 1,
                    height: 2,
                    marginHorizontal: spacing.xs,
                    backgroundColor: done ? colors.primary : colors.surfaceMuted,
                  }}
                />
              ) : null}
            </View>
            <Text
              numberOfLines={1}
              style={{
                ...typography.caption,
                marginTop: spacing.xs,
                color: active ? colors.textPrimary : colors.textMuted,
              }}
            >
              {STAGE_LABEL[stage]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
