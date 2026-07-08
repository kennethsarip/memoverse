import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { AddVerseSheet } from '@/components/AddVerseSheet';
import { Chip } from '@/components/Chip';
import { PlusIcon } from '@/components/icons/TabIcons';
import { ScreenContainer } from '@/components/ScreenContainer';
import { VerseRow } from '@/components/VerseRow';
import { useLibraryVerses } from '@/data';
import {
  isOverdue,
  matchesFilter,
  sortForLibrary,
  statusForVerse,
  type LibraryFilter,
} from '@/domain/verses';
import { radii, spacing, typography, useTheme } from '@/theme';
import { todayKey } from '@/utils/date';

const FILTERS: { key: LibraryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'learning', label: 'Learning' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'mastered', label: 'Mastered' },
];

export default function VersesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const libraryVerses = useLibraryVerses();
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [sheetVisible, setSheetVisible] = useState(false);

  const now = todayKey();
  const verses = useMemo(
    () =>
      sortForLibrary(libraryVerses, now).filter((verse) => matchesFilter(verse, filter)),
    [libraryVerses, now, filter],
  );
  const overdueCount = useMemo(
    () => libraryVerses.filter((verse) => isOverdue(verse.dueOn, now)).length,
    [libraryVerses, now],
  );

  return (
    <ScreenContainer>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ ...typography.title, color: colors.textPrimary }}>Verses</Text>
        {overdueCount > 0 ? (
          <Chip label={`${overdueCount} due`} tone="danger" selected />
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          marginTop: spacing.lg,
          flexWrap: 'wrap',
        }}
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            tone="primary"
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </View>

      <FlatList
        style={{ flex: 1, marginTop: spacing.lg }}
        data={verses}
        keyExtractor={(item) => item.userVerseId}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] * 2 }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <VerseRow
            reference={item.reference}
            snippet={item.snippet}
            status={statusForVerse(item)}
            overdue={isOverdue(item.dueOn, now)}
            onPress={() => router.push('/session')}
          />
        )}
        ListEmptyComponent={
          <View style={{ paddingTop: spacing['3xl'], alignItems: 'center' }}>
            <Text
              style={{
                ...typography.body,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              {filter === 'all'
                ? 'No verses yet. Tap + to add your first one.'
                : 'No verses in this category yet.'}
            </Text>
          </View>
        }
      />

      <Pressable
        onPress={() => setSheetVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Add a verse"
        style={({ pressed }) => ({
          position: 'absolute',
          right: spacing.xl,
          bottom: spacing['3xl'] + spacing.lg,
          width: 56,
          height: 56,
          borderRadius: radii.full,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
          shadowColor: '#125078',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 6,
        })}
      >
        <PlusIcon color={colors.onPrimary} size={26} />
      </Pressable>

      <AddVerseSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </ScreenContainer>
  );
}
