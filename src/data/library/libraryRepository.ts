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

function existingScriptureRefIds(): Set<string> {
  return new Set(
    useLocalLibraryStore
      .getState()
      .userVerses.flatMap((v) => (v.scriptureRefId ? [v.scriptureRefId] : [])),
  );
}

/**
 * Add a set of scripture references to the library, each as its own
 * user_verse + fresh verse_progress, skipping refs already in the library
 * and refs whose content has not been seeded yet. Shared by "start a pack"
 * (Section 7, Phase 1.6) and the Bible tab's "add to my verses" (Phase 1.8) —
 * both add structured (non-free-text) verses, so both use source: 'pack' per
 * the user_verses.source check constraint (Section 5.1: 'pack' | 'custom').
 */
async function addScriptureRefsToLibrary(
  refIds: string[],
  now: string,
): Promise<{ added: number }> {
  const existingRefIds = existingScriptureRefIds();
  const newRefIds = refIds.filter((id) => !existingRefIds.has(id));
  if (newRefIds.length === 0) return { added: 0 };

  const translationId = await getWebTranslationId();
  const [refs, texts] = await Promise.all([
    getScriptureRefsByIds(newRefIds),
    getVerseTexts(newRefIds, translationId),
  ]);
  const refById = new Map(refs.map((ref) => [ref.id, ref]));
  const textByRefId = new Map(texts.map((text) => [text.scriptureRefId, text]));

  let added = 0;
  for (const refId of newRefIds) {
    const ref = refById.get(refId);
    const text = textByRefId.get(refId);
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
    added += 1;
  }

  return { added };
}

/**
 * Start a curated pack: add every scripture reference in the pack that is not
 * already in the library (Section 7, Phase 1.6 — "Start pack" creates the
 * initial SRS queue entries).
 */
export async function addPackToLibrary(
  packId: string,
  now: string,
): Promise<{ added: number }> {
  const items = await getPackItems(packId);
  return addScriptureRefsToLibrary(
    items.map((item) => item.scriptureRefId),
    now,
  );
}

/**
 * Add one or more scripture references picked from the Bible tab (a single
 * verse or a contiguous range) to the library (Section 7, Phase 1.8).
 */
export async function addRefsToLibrary(
  refIds: string[],
  now: string,
): Promise<{ added: number }> {
  return addScriptureRefsToLibrary(refIds, now);
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
