export type Testament = 'old' | 'new';

/** One canonical Bible book, for the Bible tab's picker (Section 7, Phase
 * 1.8). Chapter counts are fixed canon facts, not content that lives in
 * Supabase — scripture_refs/verse_texts only cover the small seeded subset
 * of verses (Section 5.1), so the picker needs the full book/chapter shape
 * independent of what has been seeded. */
export interface BibleBook {
  name: string;
  testament: Testament;
  chapterCount: number;
}
