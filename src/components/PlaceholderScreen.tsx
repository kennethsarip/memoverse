import { Text } from 'react-native';

import { ScreenContainer } from './ScreenContainer';
import { spacing, typography, useTheme } from '@/theme';

interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
}

/** Themed placeholder for tabs whose real content ships in later phases. */
export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  const { colors } = useTheme();
  return (
    <ScreenContainer center>
      <Text style={{ ...typography.title, color: colors.textPrimary }}>{title}</Text>
      <Text
        style={{
          ...typography.body,
          color: colors.textSecondary,
          marginTop: spacing.sm,
          textAlign: 'center',
        }}
      >
        {subtitle}
      </Text>
    </ScreenContainer>
  );
}
