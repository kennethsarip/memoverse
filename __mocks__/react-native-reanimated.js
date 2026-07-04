// Manual jest mock for reanimated. The real package initializes the native
// worklets runtime on import, which cannot load in Node, so we stub only the
// small surface our components use. Animations are no-ops here; tests pass
// reducedMotion and assert behavior, not motion.
const { View, Text, ScrollView } = require('react-native');

const Animated = {
  View,
  Text,
  ScrollView,
  createAnimatedComponent: (component) => component,
};

module.exports = {
  __esModule: true,
  default: Animated,
  useSharedValue: (initial) => ({ value: initial }),
  useAnimatedStyle: (factory) => factory(),
  useAnimatedRef: () => ({ current: null }),
  useReducedMotion: () => false,
  withTiming: (toValue) => toValue,
  withSpring: (toValue) => toValue,
  withSequence: (...steps) => steps[steps.length - 1],
  withDelay: (_delay, animation) => animation,
  Easing: { linear: (t) => t },
};
