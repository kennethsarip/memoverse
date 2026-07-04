import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FirstLetterInput } from '@/components/FirstLetterInput';
import { SessionCompleteCard } from '@/components/SessionCompleteCard';
import { SessionHeader } from '@/components/SessionHeader';
import { VerseCard } from '@/components/VerseCard';
import {
  applyKey,
  attemptAccuracy,
  SAMPLE_VERSE,
  startVerseAttempt,
} from '@/features/memorization';
import { spacing, useTheme } from '@/theme';

// Placeholders until gamification (Phase 1.7) computes real XP, streak, badges.
const PLACEHOLDER_XP = 0;
const PLACEHOLDER_STREAK = 0;

export default function SessionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();

  const [attempt, setAttempt] = useState(() =>
    startVerseAttempt(SAMPLE_VERSE.text, SAMPLE_VERSE.reference, SAMPLE_VERSE.tier),
  );
  // Bumping this each wrong key re-triggers the current chip's shake.
  const [shakeSignal, setShakeSignal] = useState(0);

  const isComplete = attempt.status === 'complete';
  const progress = useMemo(
    () =>
      attempt.tokens.length === 0 ? 1 : attempt.currentIndex / attempt.tokens.length,
    [attempt.currentIndex, attempt.tokens.length],
  );

  function handleKey(key: string) {
    const outcome = applyKey(attempt, key);
    if (outcome.result === 'ignored') return;
    setAttempt(outcome.attempt);
    if (outcome.result === 'incorrect') {
      setShakeSignal((signal) => signal + 1);
    }
  }

  function goHome() {
    router.replace('/');
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'bottom']}
    >
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <SessionHeader
          reference={SAMPLE_VERSE.reference}
          tier={SAMPLE_VERSE.tier}
          progress={progress}
          onClose={goHome}
        />
      </View>

      {isComplete ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <SessionCompleteCard
            accuracy={attemptAccuracy(attempt)}
            xpEarned={PLACEHOLDER_XP}
            currentStreak={PLACEHOLDER_STREAK}
            verseReference={SAMPLE_VERSE.reference}
            onContinue={goHome}
            reducedMotion={reducedMotion}
          />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{
              padding: spacing.xl,
              flexGrow: 1,
              justifyContent: 'center',
            }}
            keyboardShouldPersistTaps="handled"
          >
            <VerseCard
              attempt={attempt}
              shakeSignal={shakeSignal}
              reducedMotion={reducedMotion}
            />
          </ScrollView>
          <View style={{ padding: spacing.xl }}>
            <FirstLetterInput onKey={handleKey} />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
