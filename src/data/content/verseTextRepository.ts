import { supabase } from '@/lib/supabase';

import type { VerseText } from './types';

/** Verse text for a set of scripture references in one translation (Section 6.6:
 * the engine reads text via verse_texts keyed by translation_id). */
export async function getVerseTexts(
  scriptureRefIds: string[],
  translationId: string,
): Promise<VerseText[]> {
  if (scriptureRefIds.length === 0) return [];

  const { data, error } = await supabase
    .from('verse_texts')
    .select('scripture_ref_id, translation_id, text, word_count')
    .in('scripture_ref_id', scriptureRefIds)
    .eq('translation_id', translationId);

  if (error) {
    throw new Error("Couldn't load verse text right now.");
  }

  return (data ?? []).map((row) => ({
    scriptureRefId: row.scripture_ref_id,
    translationId: row.translation_id,
    text: row.text,
    wordCount: row.word_count,
  }));
}
