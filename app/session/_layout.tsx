import { Stack } from 'expo-router';

/** The active session runs as its own full-screen stack (no header chrome). */
export default function SessionLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
