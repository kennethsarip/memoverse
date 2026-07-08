/** Guest-mode user_verses + verse_progress repository (Section 5.1). See
 * localLibraryStore.ts for why this is in-memory rather than Supabase/SQLite. */
export {
  addCustomVerseToLibrary,
  addPackToLibrary,
  addRefsToLibrary,
  getSessionVerse,
  recordSessionOutcome,
  useLibraryVerses,
  type SessionVerse,
} from './libraryRepository';
