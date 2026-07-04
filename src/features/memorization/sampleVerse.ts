import type { Tier } from '@/domain/firstLetter';

/**
 * Temporary seeded verse for the Phase 1.3 session demo. The real session pulls
 * due verses from the SRS queue (1.4) and the library/data layer (1.5); until
 * then this hard-coded WEB (public-domain) verse lets a user run a session
 * end-to-end. Remove once the data layer feeds the session.
 */
export interface SampleVerse {
  text: string;
  reference: string;
  translation: string;
  tier: Tier;
}

export const SAMPLE_VERSE: SampleVerse = {
  text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
  reference: 'John 3:16',
  translation: 'WEB',
  // Tier 2 (about half hidden) best shows the reveal-on-keystroke mechanic while
  // leaving enough shown words as scaffolding to finish the verse.
  tier: 2,
};
