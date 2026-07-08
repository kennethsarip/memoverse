import { supabase } from '@/lib/supabase';

import type { ScriptureRef } from './types';

function toScriptureRef(row: {
  id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  canonical_ref: string;
  osis: string | null;
}): ScriptureRef {
  return {
    id: row.id,
    book: row.book,
    chapter: row.chapter,
    verseStart: row.verse_start,
    verseEnd: row.verse_end,
    canonicalRef: row.canonical_ref,
    osis: row.osis,
  };
}

/** Fetch scripture references by id (translation-independent addresses; Section 5.1). */
export async function getScriptureRefsByIds(ids: string[]): Promise<ScriptureRef[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('scripture_refs')
    .select('id, book, chapter, verse_start, verse_end, canonical_ref, osis')
    .in('id', ids);

  if (error) {
    throw new Error("Couldn't load that passage right now.");
  }

  return (data ?? []).map(toScriptureRef);
}

/** Fetch the seeded scripture refs for one book/chapter, in verse order, for
 * the Bible tab's passage view (Section 7, Phase 1.8). May return fewer refs
 * than the chapter actually has, or none at all, if that content has not
 * been seeded yet — callers show a "coming soon" state for the gap. */
export async function getScriptureRefsForChapter(
  book: string,
  chapter: number,
): Promise<ScriptureRef[]> {
  const { data, error } = await supabase
    .from('scripture_refs')
    .select('id, book, chapter, verse_start, verse_end, canonical_ref, osis')
    .eq('book', book)
    .eq('chapter', chapter)
    .order('verse_start', { ascending: true });

  if (error) {
    throw new Error("Couldn't load that chapter right now.");
  }

  return (data ?? []).map(toScriptureRef);
}
