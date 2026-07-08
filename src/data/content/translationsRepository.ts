import { supabase } from '@/lib/supabase';

let cachedWebTranslationId: string | null = null;

/** The enabled default translation's id (Section 1: WEB, public domain).
 * Cached in memory for the process lifetime since it never changes at runtime. */
export async function getWebTranslationId(): Promise<string> {
  if (cachedWebTranslationId) return cachedWebTranslationId;

  const { data, error } = await supabase
    .from('translations')
    .select('id')
    .eq('code', 'WEB')
    .eq('is_enabled', true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Couldn't load the Bible translation right now.");
  }

  cachedWebTranslationId = data.id;
  return data.id;
}
