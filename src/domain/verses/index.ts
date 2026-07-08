/**
 * Verses/library domain logic (Section 7, Phase 1.6). Pure, I/O-free
 * categorization and validation over SRS state — no Supabase, no React.
 */
export type {
  CustomVerseInput,
  CustomVerseValidation,
  LibraryFilter,
  LibraryStatus,
  LibraryVerse,
} from './types';
export { isOverdue, matchesFilter, sortForLibrary, statusForVerse } from './status';
export { validateCustomVerseInput } from './validation';
