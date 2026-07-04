import { Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { radii, spacing, typography, useTheme } from '@/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  return (
    <ScreenContainer>
      <Text style={{ ...typography.display, color: colors.textPrimary }}>MemoVerse</Text>
      <Text
        style={{
          ...typography.body,
          color: colors.textSecondary,
          marginTop: spacing.sm,
        }}
      >
        Hide God&apos;s word in your heart, one first letter at a time.
      </Text>

      <View
        style={{
          marginTop: spacing.xl,
          backgroundColor: colors.primary,
          borderRadius: radii.xl,
          padding: spacing.xl,
        }}
      >
        <Text style={{ ...typography.heading, color: colors.onPrimary }}>
          Your daily session
        </Text>
        <Text
          style={{
            ...typography.body,
            color: colors.onPrimary,
            marginTop: spacing.xs,
            opacity: 0.9,
          }}
        >
          Sessions land here in an upcoming phase. Foundations are ready.
        </Text>
      </View>
    </ScreenContainer>
  );
}
