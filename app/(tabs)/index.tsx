import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { radii, spacing, typography, useTheme } from '@/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

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

      <Pressable
        onPress={() => router.push('/session')}
        accessibilityRole="button"
        accessibilityLabel="Start today's session"
        style={({ pressed }) => ({
          marginTop: spacing.xl,
          backgroundColor: colors.primary,
          borderRadius: radii.xl,
          padding: spacing.xl,
          opacity: pressed ? 0.9 : 1,
        })}
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
          Tap to memorize today&apos;s verse with the first-letter method.
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}
