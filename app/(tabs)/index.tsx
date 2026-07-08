import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { LevelCard } from '@/components/LevelCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { StatTile } from '@/components/StatTile';
import { StreakCard } from '@/components/StreakCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VerseRow } from '@/components/VerseRow';
import { useLibraryVerses } from '@/data';
import {
  isDueForReview,
  libraryStats,
  sortForLibrary,
  statusForVerse,
} from '@/domain/verses';
import { SAMPLE_VERSE } from '@/features/memorization';
import { fontFamily, radii, spacing, typography, useTheme } from '@/theme';
import { formatDateKey } from '@/utils/date';

// Placeholders until gamification (Section 7, Phase 1.12) computes real values.
const PLACEHOLDER_STREAK = 0;
const PLACEHOLDER_LEVEL = 1;
const PLACEHOLDER_XP = 0;
const PLACEHOLDER_XP_TO_NEXT_LEVEL = 100;

const MAX_CONTINUE_CARDS = 3;

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const libraryVerses = useLibraryVerses();

  // UI-only clock reads (Section 10 bars this in domain code, not here — see
  // src/utils/date.ts's todayKey, which this mirrors).
  const nowDate = new Date();
  const now = formatDateKey(nowDate);
  const greeting = greetingForHour(nowDate.getHours());
  const todayIndex = nowDate.getDay();
  const dayOfYear = Math.floor(
    (nowDate.getTime() - new Date(nowDate.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  const stats = useMemo(() => libraryStats(libraryVerses, now), [libraryVerses, now]);
  const continueVerses = useMemo(
    () =>
      sortForLibrary(libraryVerses, now)
        .filter((verse) => isDueForReview(verse.dueOn, now))
        .slice(0, MAX_CONTINUE_CARDS),
    [libraryVerses, now],
  );

  // A verse of the day: deterministic pick from the user's own library so it
  // stays stable across a single day; falls back to the seeded sample verse
  // (Section 7, Phase 1.3) when the library is empty.
  const verseOfDay =
    libraryVerses.length === 0
      ? { reference: SAMPLE_VERSE.reference, snippet: SAMPLE_VERSE.text }
      : (() => {
          const verse = libraryVerses[dayOfYear % libraryVerses.length];
          return { reference: verse.reference, snippet: verse.snippet };
        })();

  function goToVerses() {
    router.push('/verses');
  }

  function goToSession() {
    router.push('/session');
  }

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] * 2 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ ...typography.display, color: colors.textPrimary }}>Fount</Text>
          <ThemeToggle />
        </View>
        <Text
          style={{
            ...typography.body,
            color: colors.textSecondary,
            marginTop: spacing.sm,
          }}
        >
          {greeting}. Ready to hide God&apos;s word in your heart?
        </Text>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <StreakCard
            currentStreak={PLACEHOLDER_STREAK}
            todayIndex={todayIndex}
            reducedMotion={reducedMotion}
          />
          <LevelCard
            level={PLACEHOLDER_LEVEL}
            xp={PLACEHOLDER_XP}
            xpIntoLevel={PLACEHOLDER_XP}
            xpToNextLevel={PLACEHOLDER_XP_TO_NEXT_LEVEL}
          />
        </View>

        <Pressable
          onPress={goToVerses}
          accessibilityRole="button"
          accessibilityLabel={
            stats.dueCount > 0
              ? `Start review, ${stats.dueCount} verses to review`
              : 'Start review'
          }
          style={({ pressed }) => ({
            marginTop: spacing.lg,
            backgroundColor: colors.primary,
            borderRadius: radii.card,
            padding: spacing.lg,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={{ ...typography.heading, color: colors.onPrimary }}>
            {stats.dueCount > 0
              ? `${stats.dueCount} verse${stats.dueCount === 1 ? '' : 's'} to review`
              : "You're all caught up"}
          </Text>
          <Text
            style={{
              ...typography.body,
              color: colors.onPrimary,
              marginTop: spacing.xs,
              opacity: 0.9,
            }}
          >
            {stats.dueCount > 0 ? 'Tap to start your review' : 'Tap to see your verses'}
          </Text>
        </Pressable>

        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            marginTop: spacing.lg,
          }}
        >
          <StatTile value={stats.learning} label="Learning" />
          <StatTile value={stats.reviewing} label="Reviewing" />
          <StatTile value={stats.mastered} label="Mastered" />
        </View>

        {continueVerses.length > 0 ? (
          <View style={{ marginTop: spacing.xl }}>
            <SectionHeader title="Continue learning" />
            <View style={{ gap: spacing.sm }}>
              {continueVerses.map((verse) => (
                <VerseRow
                  key={verse.userVerseId}
                  reference={verse.reference}
                  snippet={verse.snippet}
                  status={statusForVerse(verse)}
                  overdue={verse.dueOn < now}
                  onPress={goToSession}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title="Verse of the day" />
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.card,
              padding: spacing.lg,
            }}
          >
            <Text style={{ ...typography.heading, color: colors.textPrimary }}>
              {verseOfDay.reference}
            </Text>
            <Text
              style={{
                ...typography.verse,
                fontFamily: fontFamily.verse,
                color: colors.textSecondary,
                marginTop: spacing.xs,
              }}
            >
              {verseOfDay.snippet}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
