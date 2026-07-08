import { supabase } from '@/lib/supabase';

import type { ScriptureRef } from './types';

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

  return (data ?? []).map((row) => ({
    id: row.id,
    book: row.book,
    chapter: row.chapter,
    verseStart: row.verse_start,
    verseEnd: row.verse_end,
    canonicalRef: row.canonical_ref,
    osis: row.osis,
  }));
}
