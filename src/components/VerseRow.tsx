import { Pressable, Text, View } from 'react-native';

import type { LibraryStatus } from '@/domain/verses';
import { fontFamily, radii, spacing, typography, useTheme } from '@/theme';

import { Chip } from './Chip';

interface VerseRowProps {
  reference: string;
  snippet: string;
  status: LibraryStatus;
  overdue: boolean;
  onPress?: () => void;
}

const STATUS_LABEL: Record<LibraryStatus, string> = {
  learning: 'Learning',
  reviewing: 'Reviewing',
  mastered: 'Mastered',
};

/** One row in the Verses collection (Section 7, Phase 1.6): reference in
 * Poppins, verse snippet in serif, status + overdue badges. */
export function VerseRow({
  reference,
  snippet,
  status,
  overdue,
  onPress,
}: VerseRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${reference}, ${STATUS_LABEL[status]}${overdue ? ', overdue' : ''}`}
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radii.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        }}
      >
        <Text style={{ ...typography.heading, color: colors.textPrimary, flexShrink: 1 }}>
          {reference}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          {overdue ? <Chip label="Overdue" tone="danger" selected /> : null}
          <Chip
            label={STATUS_LABEL[status]}
            tone={status === 'mastered' ? 'success' : 'primary'}
          />
        </View>
      </View>
      <Text
        style={{
          ...typography.body,
          fontFamily: fontFamily.verse,
          color: colors.textSecondary,
          marginTop: spacing.xs,
        }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {snippet}
      </Text>
    </Pressable>
  );
}
