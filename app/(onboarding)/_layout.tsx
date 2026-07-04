import { Stack } from 'expo-router';

// Guest-first onboarding (taster, age gate, sign-up prompt) is built in Phases
// 1.3 and 1.6. This stack is scaffolded now so routes are ready to fill in.
export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
