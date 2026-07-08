import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ChapterGrid } from '@/components/ChapterGrid';
import { ChevronLeftIcon } from '@/components/icons/TabIcons';
import { ScreenContainer } from '@/components/ScreenContainer';
import {
  addRefsToLibrary,
  getScriptureRefsForChapter,
  getVerseTexts,
  getWebTranslationId,
  type ScriptureRef,
} from '@/data';
import { BIBLE_BOOKS, type BibleBook } from '@/domain/bible';
import { fontFamily, spacing, typography, useTheme } from '@/theme';
import { todayKey } from '@/utils/date';

type BookListItem = { type: 'divider' } | { type: 'book'; book: BibleBook };

const BOOK_LIST_DATA: BookListItem[] = BIBLE_BOOKS.reduce<BookListItem[]>(
  (items, book, index) => {
    if (book.testament === 'new' && BIBLE_BOOKS[index - 1]?.testament === 'old') {
      items.push({ type: 'divider' });
    }
    items.push({ type: 'book', book });
    return items;
  },
  [],
);

type PassageState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; refs: ScriptureRef[]; textByRefId: Map<string, string> };

/** Back-header shared by the chapters and passage steps of the Bible picker. */
function StepHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onBack}
      accessibilityRole="button"
      accessibilityLabel="Back"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <ChevronLeftIcon color={colors.textPrimary} size={22} />
      <Text style={{ ...typography.title, color: colors.textPrimary }}>{title}</Text>
    </Pressable>
  );
}

export default function BibleScreen() {
  const { colors } = useTheme();
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [passage, setPassage] = useState<PassageState>({ status: 'loading' });
  const [selectedRefIds, setSelectedRefIds] = useState<Set<string>>(new Set());
  const [addState, setAddState] = useState<
    { status: 'idle' } | { status: 'adding' } | { status: 'added'; count: number }
  >({ status: 'idle' });

  useEffect(() => {
    if (!selectedBook || selectedChapter === null) return;

    let cancelled = false;
    setPassage({ status: 'loading' });
    setSelectedRefIds(new Set());
    setAddState({ status: 'idle' });

    (async () => {
      try {
        const refs = await getScriptureRefsForChapter(selectedBook.name, selectedChapter);
        if (refs.length === 0) {
          if (!cancelled) setPassage({ status: 'empty' });
          return;
        }
        const translationId = await getWebTranslationId();
        const texts = await getVerseTexts(
          refs.map((ref) => ref.id),
          translationId,
        );
        if (cancelled) return;
        const textByRefId = new Map(
          texts.map((text) => [text.scriptureRefId, text.text]),
        );
        setPassage({ status: 'ready', refs, textByRefId });
      } catch (error) {
        if (!cancelled) {
          setPassage({
            status: 'error',
            message:
              error instanceof Error
                ? error.message
                : "Couldn't load that chapter right now.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBook, selectedChapter]);

  function goToBooks() {
    setSelectedBook(null);
    setSelectedChapter(null);
  }

  function goToChapters() {
    setSelectedChapter(null);
  }

  function toggleVerse(refId: string) {
    setAddState({ status: 'idle' });
    setSelectedRefIds((prev) => {
      const next = new Set(prev);
      if (next.has(refId)) {
        next.delete(refId);
      } else {
        next.add(refId);
      }
      return next;
    });
  }

  async function handleAddSelected() {
    setAddState({ status: 'adding' });
    try {
      const result = await addRefsToLibrary(Array.from(selectedRefIds), todayKey());
      setSelectedRefIds(new Set());
      setAddState({ status: 'added', count: result.added });
    } catch (error) {
      setAddState({ status: 'idle' });
      setPassage((prev) =>
        prev.status === 'ready'
          ? prev
          : {
              status: 'error',
              message:
                error instanceof Error
                  ? error.message
                  : "Couldn't add that verse right now.",
            },
      );
    }
  }

  // Step 1: full book list, single grey rule dividing Old and New Testament.
  if (!selectedBook) {
    return (
      <ScreenContainer>
        <Text style={{ ...typography.title, color: colors.textPrimary }}>Bible</Text>
        <FlatList
          style={{ flex: 1, marginTop: spacing.lg }}
          data={BOOK_LIST_DATA}
          keyExtractor={(item, index) =>
            item.type === 'divider' ? `divider-${index}` : item.book.name
          }
          contentContainerStyle={{ paddingBottom: spacing['3xl'] * 2 }}
          renderItem={({ item }) =>
            item.type === 'divider' ? (
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginVertical: spacing.md,
                }}
              />
            ) : (
              <Pressable
                onPress={() => setSelectedBook(item.book)}
                accessibilityRole="button"
                accessibilityLabel={item.book.name}
                style={({ pressed }) => ({
                  paddingVertical: spacing.md,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ ...typography.body, color: colors.textPrimary }}>
                  {item.book.name}
                </Text>
              </Pressable>
            )
          }
        />
      </ScreenContainer>
    );
  }

  // Step 2: chapter number grid for the selected book.
  if (selectedChapter === null) {
    return (
      <ScreenContainer>
        <StepHeader title={selectedBook.name} onBack={goToBooks} />
        <ScrollView
          style={{ marginTop: spacing.lg }}
          contentContainerStyle={{ paddingBottom: spacing['3xl'] * 2 }}
          showsVerticalScrollIndicator={false}
        >
          <ChapterGrid
            chapterCount={selectedBook.chapterCount}
            onSelect={setSelectedChapter}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Step 3: continuous passage view with superscript verse numbers; tap a
  // verse (or several, for a range) to select it, then add to my verses.
  return (
    <ScreenContainer>
      <StepHeader
        title={`${selectedBook.name} ${selectedChapter}`}
        onBack={goToChapters}
      />
      <ScrollView
        style={{ flex: 1, marginTop: spacing.lg }}
        contentContainerStyle={{ paddingBottom: spacing['3xl'] * 2 }}
        showsVerticalScrollIndicator={false}
      >
        {passage.status === 'loading' ? (
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            Loading...
          </Text>
        ) : passage.status === 'error' ? (
          <Text style={{ ...typography.body, color: colors.danger }}>
            {passage.message}
          </Text>
        ) : passage.status === 'empty' ? (
          <Text style={{ ...typography.body, color: colors.textSecondary }}>
            This chapter isn&apos;t in Fount yet. More of the Bible is coming soon.
          </Text>
        ) : (
          <Text style={{ ...typography.verse, fontFamily: fontFamily.verse }}>
            {passage.refs.map((ref) => {
              const text = passage.textByRefId.get(ref.id);
              if (!text) return null;
              const selected = selectedRefIds.has(ref.id);
              return (
                <Text
                  key={ref.id}
                  onPress={() => toggleVerse(ref.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Verse ${ref.verseStart}${selected ? ', selected' : ''}`}
                  accessibilityState={{ selected }}
                  style={{
                    color: colors.textPrimary,
                    backgroundColor: selected ? colors.primarySoft : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fontFamily.medium,
                      fontSize: 13,
                      color: colors.primary,
                      top: -6,
                    }}
                  >
                    {ref.verseStart}
                  </Text>{' '}
                  {text}{' '}
                </Text>
              );
            })}
          </Text>
        )}

        {addState.status === 'added' ? (
          <Text
            style={{
              ...typography.caption,
              color: colors.success,
              marginTop: spacing.lg,
            }}
          >
            {addState.count > 0 ? `Added to your verses.` : 'Already in your verses.'}
          </Text>
        ) : null}
      </ScrollView>

      {selectedRefIds.size > 0 ? (
        <View style={{ marginTop: spacing.md }}>
          <Button
            title={
              addState.status === 'adding'
                ? 'Adding...'
                : `Add ${selectedRefIds.size} verse${selectedRefIds.size === 1 ? '' : 's'} to my verses`
            }
            onPress={handleAddSelected}
            disabled={addState.status === 'adding'}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
