import type { ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

interface ScreenContainerProps {
  children: ReactNode;
  /** Center content vertically and horizontally (used for simple placeholder screens). */
  center?: boolean;
}

/** Theme-aware page wrapper: safe-area padding + themed background. */
export function ScreenContainer({ children, center = false }: ScreenContainerProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.lg,
          justifyContent: center ? 'center' : 'flex-start',
          alignItems: center ? 'center' : 'stretch',
        }}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
