import { INITIAL_SRS_STATE } from '@/domain/srs';
import type { CustomVerseInput, LibraryVerse } from '@/domain/verses';

import {
  getPackItems,
  getScriptureRefsByIds,
  getVerseTexts,
  getWebTranslationId,
} from '../content';
import { useLocalLibraryStore } from './localLibraryStore';
import type { UserVerseRecord, VerseProgressRecord } from './types';

function generateLocalId(): string {
  return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function createInitialProgress(userVerseId: string, now: string): VerseProgressRecord {
  return {
    id: generateLocalId(),
    userVerseId,
    difficultyTier: 1,
    easeFactor: INITIAL_SRS_STATE.easeFactor,
    intervalDays: INITIAL_SRS_STATE.intervalDays,
    repetitions: INITIAL_SRS_STATE.repetitions,
    dueOn: now,
    lastReviewedAt: null,
    lastGrade: null,
    isMastered: false,
  };
}

/** Add one free-text custom verse (Section 7, Phase 1.6). Callers should
 * validate with validateCustomVerseInput first; this does not re-validate. */
export function addCustomVerseToLibrary(input: CustomVerseInput, now: string): void {
  const userVerse: UserVerseRecord = {
    id: generateLocalId(),
    scriptureRefId: null,
    translationId: null,
    source: 'custom',
    customRef: input.reference.trim(),
    customText: input.text.trim(),
    cachedReference: input.reference.trim(),
    cachedSnippet: input.text.trim(),
    addedAt: now,
    archived: false,
  };
  useLocalLibraryStore
    .getState()
    .addVerse(userVerse, createInitialProgress(userVerse.id, now));
}

/**
 * Start a curated pack: add every scripture reference in the pack that is not
 * already in the library, each as its own user_verse + fresh verse_progress
 * (Section 7, Phase 1.6 — "Start pack" creates the initial SRS queue entries).
 */
export async function addPackToLibrary(
  packId: string,
  now: string,
): Promise<{ added: number }> {
  const items = await getPackItems(packId);
  const existingRefIds = new Set(
    useLocalLibraryStore
      .getState()
      .userVerses.filter((v) => v.scriptureRefId !== null)
      .map((v) => v.scriptureRefId),
  );
  const newItems = items.filter((item) => !existingRefIds.has(item.scriptureRefId));
  if (newItems.length === 0) return { added: 0 };

  const refIds = newItems.map((item) => item.scriptureRefId);
  const translationId = await getWebTranslationId();
  const [refs, texts] = await Promise.all([
    getScriptureRefsByIds(refIds),
    getVerseTexts(refIds, translationId),
  ]);
  const refById = new Map(refs.map((ref) => [ref.id, ref]));
  const textByRefId = new Map(texts.map((text) => [text.scriptureRefId, text]));

  for (const item of newItems) {
    const ref = refById.get(item.scriptureRefId);
    const text = textByRefId.get(item.scriptureRefId);
    if (!ref || !text) continue; // content not yet seeded for this reference; skip gracefully

    const userVerse: UserVerseRecord = {
      id: generateLocalId(),
      scriptureRefId: ref.id,
      translationId,
      source: 'pack',
      customRef: null,
      customText: null,
      cachedReference: ref.canonicalRef,
      cachedSnippet: text.text,
      addedAt: now,
      archived: false,
    };
    useLocalLibraryStore
      .getState()
      .addVerse(userVerse, createInitialProgress(userVerse.id, now));
  }

  return { added: newItems.length };
}

function toLibraryVerse(
  userVerse: UserVerseRecord,
  progress: VerseProgressRecord,
): LibraryVerse {
  return {
    userVerseId: userVerse.id,
    reference: userVerse.cachedReference,
    snippet: userVerse.cachedSnippet,
    translationCode: userVerse.translationId ? 'WEB' : null,
    source: userVerse.source,
    srsState: {
      easeFactor: progress.easeFactor,
      intervalDays: progress.intervalDays,
      repetitions: progress.repetitions,
    },
    lastGrade: progress.lastGrade,
    dueOn: progress.dueOn,
  };
}

/** Reactive read of the guest library, joined with SRS state, for the Verses screen. */
export function useLibraryVerses(): LibraryVerse[] {
  const userVerses = useLocalLibraryStore((state) => state.userVerses);
  const verseProgress = useLocalLibraryStore((state) => state.verseProgress);
  const progressByVerseId = new Map(
    verseProgress.map((progress) => [progress.userVerseId, progress]),
  );

  return userVerses
    .filter((userVerse) => !userVerse.archived)
    .map((userVerse) => {
      const progress = progressByVerseId.get(userVerse.id);
      return progress ? toLibraryVerse(userVerse, progress) : null;
    })
    .filter((verse): verse is LibraryVerse => verse !== null);
}
