/** Public, read-only content shapes (Section 5.1), camelCased from the DB rows. */

export interface PackSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  ageBandHint: string | null;
}

export interface PackItemRef {
  scriptureRefId: string;
  position: number;
}

export interface ScriptureRef {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  canonicalRef: string;
  osis: string | null;
}

export interface VerseText {
  scriptureRefId: string;
  translationId: string;
  text: string;
  wordCount: number;
}
