import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FirstLetterInput } from '@/components/FirstLetterInput';
import { SessionCompleteCard } from '@/components/SessionCompleteCard';
import { SessionHeader } from '@/components/SessionHeader';
import { StageDashboard } from '@/components/StageDashboard';
import { VerseCard } from '@/components/VerseCard';
import { getSessionVerse, recordSessionOutcome } from '@/data';
import type { Tier } from '@/domain/firstLetter';
import {
  applyKey,
  attemptAccuracy,
  SAMPLE_VERSE,
  startVerseAttempt,
} from '@/features/memorization';
import { spacing, useTheme } from '@/theme';
import { todayKey } from '@/utils/date';

// Placeholders until gamification (Phase 1.12) computes real XP and streak.
const PLACEHOLDER_XP = 0;
const PLACEHOLDER_STREAK = 0;

type ScreenPhase = 'active' | 'dashboard' | 'complete';

/** The stages a session drills, starting from the verse's persisted stage
 * (Section 8.3) through Tier 3 — a learner may practice up through harder
 * stages in one sitting without that changing the persisted tier. */
function stagesFrom(startTier: Tier): Tier[] {
  const all: Tier[] = [1, 2, 3];
  return all.filter((tier) => tier >= startTier);
}

export default function SessionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const params = useLocalSearchParams<{ userVerseId?: string; practice?: string }>();

  const isPractice = params.practice === '1';

  // Resolve which verse this session runs. A real library verse resumes at
  // its persisted stage; the seeded demo verse (no id passed) is a no-stakes
  // fallback so /session always has something to run.
  const sessionVerse = useMemo(() => {
    if (params.userVerseId) {
      const found = getSessionVerse(params.userVerseId);
      if (found) return found;
    }
    return {
      userVerseId: null as string | null,
      reference: SAMPLE_VERSE.reference,
      text: SAMPLE_VERSE.text,
      startTier: SAMPLE_VERSE.tier,
    };
  }, [params.userVerseId]);

  const canPersist = !isPractice && sessionVerse.userVerseId !== null;
  const stages = useMemo(
    () => stagesFrom(sessionVerse.startTier),
    [sessionVerse.startTier],
  );

  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase] = useState<ScreenPhase>('active');
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const currentTier = stages[stageIndex];

  const [attempt, setAttempt] = useState(() =>
    startVerseAttempt(sessionVerse.text, sessionVerse.reference, currentTier),
  );
  // Bumping this each wrong key re-triggers the current chip's shake.
  const [shakeSignal, setShakeSignal] = useState(0);

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
    } else if (outcome.attempt.status === 'complete') {
      setFinalAccuracy(attemptAccuracy(outcome.attempt));
      setPhase('dashboard');
    }
  }

  const restartStage = useCallback(
    (tier: Tier) => {
      setAttempt(startVerseAttempt(sessionVerse.text, sessionVerse.reference, tier));
      setShakeSignal(0);
      setPhase('active');
    },
    [sessionVerse.text, sessionVerse.reference],
  );

  function finishSession(tierReached: Tier, accuracy: number) {
    if (canPersist && sessionVerse.userVerseId) {
      recordSessionOutcome(sessionVerse.userVerseId, tierReached, accuracy, todayKey());
    }
    setPhase('complete');
  }

  function handleRepeat() {
    restartStage(currentTier);
  }

  function handleContinue() {
    const isFinalStage = stageIndex === stages.length - 1;
    if (isFinalStage) {
      finishSession(currentTier, finalAccuracy);
      return;
    }
    const nextIndex = stageIndex + 1;
    setStageIndex(nextIndex);
    restartStage(stages[nextIndex]);
  }

  function handleFinishEarly() {
    finishSession(currentTier, finalAccuracy);
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
          reference={sessionVerse.reference}
          tier={currentTier}
          progress={phase === 'active' ? progress : 1}
          onClose={goHome}
          isPractice={isPractice || !canPersist}
        />
      </View>

      {phase === 'complete' ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <SessionCompleteCard
            accuracy={finalAccuracy}
            xpEarned={PLACEHOLDER_XP}
            currentStreak={PLACEHOLDER_STREAK}
            verseReference={sessionVerse.reference}
            onContinue={goHome}
            reducedMotion={reducedMotion}
            isPractice={isPractice || !canPersist}
          />
        </ScrollView>
      ) : phase === 'dashboard' ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <StageDashboard
            accuracy={finalAccuracy}
            finishedTier={currentTier}
            isFinalStage={stageIndex === stages.length - 1}
            onRepeat={handleRepeat}
            onContinue={handleContinue}
            onFinishEarly={handleFinishEarly}
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
