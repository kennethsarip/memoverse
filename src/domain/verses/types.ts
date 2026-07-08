import type { Grade, SrsState } from '@/domain/srs';

/** Verses screen filter chips (Section 7, Phase 1.6). 'all' is not a status
 * value on a verse; it is the absence of a status filter. */
export type LibraryStatus = 'learning' | 'reviewing' | 'mastered';
export type LibraryFilter = 'all' | LibraryStatus;

/** A row in the Verses collection screen: pack- or custom-sourced verse,
 * joined with its current SRS state for status/overdue display. */
export interface LibraryVerse {
  userVerseId: string;
  reference: string;
  snippet: string;
  translationCode: string | null;
  source: 'pack' | 'custom';
  srsState: SrsState;
  lastGrade: Grade | null;
  dueOn: string;
}

/** Raw fields for the free-text custom-verse form (Section 6.1's "paste free text" path). */
export interface CustomVerseInput {
  reference: string;
  text: string;
}

export interface CustomVerseValidation {
  valid: boolean;
  errors: {
    reference?: string;
    text?: string;
  };
}

/** Home-screen library tallies (Section 7, Phase 1.7 stats row). */
export interface LibraryStats {
  total: number;
  learning: number;
  reviewing: number;
  mastered: number;
  dueCount: number;
}
