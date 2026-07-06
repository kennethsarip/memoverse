import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg';

import { radii, useTheme } from '@/theme';

interface StreakFlameProps {
  /** Outer badge diameter; the flame glyph scales with it. */
  size?: number;
  reducedMotion?: boolean;
}

/**
 * The animated streak flame (CLAUDE.md 1.5). Path data and gradient are
 * traced from the locked prototype for visual fidelity; the flicker is
 * simplified to a single looped scale/rotate on the whole glyph rather than
 * the prototype's two counter-animated layers, which reads the same at this
 * size with much less animation code.
 */
export function StreakFlame({ size = 46, reducedMotion = false }: StreakFlameProps) {
  const { colors } = useTheme();
  const iconSize = size * (26 / 46);

  const flicker = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) {
      flicker.value = 0;
      return;
    }
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 325 }),
        withTiming(2, { duration: 325 }),
        withTiming(3, { duration: 325 }),
        withTiming(0, { duration: 325 }),
      ),
      -1,
    );
  }, [reducedMotion, flicker]);

  const animatedStyle = useAnimatedStyle(() => {
    const steps = [
      { scale: 1, rotate: '0deg' },
      { scale: 1.08, rotate: '-3deg' },
      { scale: 0.97, rotate: '2.5deg' },
      { scale: 1.05, rotate: '-1.5deg' },
    ];
    const step = steps[Math.round(flicker.value) % steps.length];
    return {
      transform: [{ scale: step.scale }, { rotate: step.rotate }],
    };
  });

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: radii.md,
        backgroundColor: colors.streakSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View style={animatedStyle}>
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
          <Defs>
            <LinearGradient id="flameGradient" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#F5860F" />
              <Stop offset="0.55" stopColor="#F9A825" />
              <Stop offset="1" stopColor="#FFDE59" />
            </LinearGradient>
          </Defs>
          <Path
            fill="url(#flameGradient)"
            d="M12 2.5c.8 3 3.8 4.2 3.8 7.8a3.8 3.8 0 0 1-7.6 0c0-1.3.4-2.1 1.1-3-.1 1.3.6 2 1.4 2.2-.7-2.3.4-4.9 1.3-7z"
          />
          <Path
            fill="#FFF3C4"
            d="M12 9c.6 1.4 1.6 2 1.6 3.4a1.6 1.6 0 0 1-3.2 0c0-1 .7-1.7 1.6-3.4z"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
