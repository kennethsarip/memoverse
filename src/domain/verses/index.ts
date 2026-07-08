/**
 * Verses/library domain logic (Section 7, Phase 1.6). Pure, I/O-free
 * categorization and validation over SRS state — no Supabase, no React.
 */
export type {
  CustomVerseInput,
  CustomVerseValidation,
  LibraryFilter,
  LibraryStats,
  LibraryStatus,
  LibraryVerse,
} from './types';
export {
  isDueForReview,
  isOverdue,
  libraryStats,
  matchesFilter,
  sortForLibrary,
  statusForVerse,
} from './status';
export { validateCustomVerseInput } from './validation';
