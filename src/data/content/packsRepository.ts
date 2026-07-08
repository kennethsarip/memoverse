import { supabase } from '@/lib/supabase';

import type { PackItemRef, PackSummary } from './types';

/** List curated packs for the add-verse sheet's "start a pack" tab, in their
 * curated display order. */
export async function listPacks(): Promise<PackSummary[]> {
  const { data, error } = await supabase
    .from('packs')
    .select('id, slug, title, description, category, age_band_hint')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error("Couldn't load verse packs right now.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    ageBandHint: row.age_band_hint,
  }));
}

/** A pack's scripture references in curated order, for "start this pack". */
export async function getPackItems(packId: string): Promise<PackItemRef[]> {
  const { data, error } = await supabase
    .from('pack_items')
    .select('scripture_ref_id, position')
    .eq('pack_id', packId)
    .order('position', { ascending: true });

  if (error) {
    throw new Error("Couldn't load that pack's verses right now.");
  }

  return (data ?? []).map((row) => ({
    scriptureRefId: row.scripture_ref_id,
    position: row.position,
  }));
}
