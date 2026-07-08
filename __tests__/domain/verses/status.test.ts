import {
  isDueForReview,
  isOverdue,
  libraryStats,
  matchesFilter,
  sortForLibrary,
  statusForVerse,
  type LibraryVerse,
} from '@/domain/verses';

const verse = (partial: Partial<LibraryVerse>): LibraryVerse => ({
  userVerseId: 'a',
  reference: 'John 3:16',
  snippet: 'For God so loved the world...',
  translationCode: 'WEB',
  source: 'pack',
  srsState: { easeFactor: 2.5, intervalDays: 0, repetitions: 0 },
  lastGrade: null,
  dueOn: '2026-07-06',
  ...partial,
});

describe('statusForVerse', () => {
  it('is "learning" for a new verse (Tier 1)', () => {
    expect(statusForVerse(verse({}))).toBe('learning');
  });

  it('is "reviewing" for a Tier 2 verse', () => {
    expect(
      statusForVerse(
        verse({ srsState: { easeFactor: 2.5, intervalDays: 3, repetitions: 2 } }),
      ),
    ).toBe('reviewing');
  });

  it('is "reviewing" for a Tier 3 verse that has not yet cleared mastery', () => {
    expect(
      statusForVerse(
        verse({
          srsState: { easeFactor: 2.5, intervalDays: 7, repetitions: 3 },
          lastGrade: 4,
        }),
      ),
    ).toBe('reviewing');
  });

  it('is "mastered" once the verse clears the Section 8.3 mastery bar', () => {
    expect(
      statusForVerse(
        verse({
          srsState: { easeFactor: 2.5, intervalDays: 21, repetitions: 6 },
          lastGrade: 4,
        }),
      ),
    ).toBe('mastered');
  });
});

describe('isOverdue', () => {
  it('is overdue when due strictly before now', () => {
    expect(isOverdue('2026-07-05', '2026-07-06')).toBe(true);
  });

  it('is not overdue when due today or later', () => {
    expect(isOverdue('2026-07-06', '2026-07-06')).toBe(false);
    expect(isOverdue('2026-07-07', '2026-07-06')).toBe(false);
  });
});

describe('matchesFilter', () => {
  it('matches everything under "all"', () => {
    expect(matchesFilter(verse({}), 'all')).toBe(true);
  });

  it("matches only the verse's own status otherwise", () => {
    const v = verse({});
    expect(matchesFilter(v, 'learning')).toBe(true);
    expect(matchesFilter(v, 'reviewing')).toBe(false);
    expect(matchesFilter(v, 'mastered')).toBe(false);
  });
});

describe('sortForLibrary', () => {
  it('sorts most-overdue first, then due-today, then upcoming, ties by id', () => {
    const now = '2026-07-06';
    const upcoming = verse({ userVerseId: 'upcoming', dueOn: '2026-07-10' });
    const dueToday = verse({ userVerseId: 'today', dueOn: now });
    const mostOverdue = verse({ userVerseId: 'oldest', dueOn: '2026-07-01' });
    const lessOverdue = verse({ userVerseId: 'newer', dueOn: '2026-07-04' });
    const tieA = verse({ userVerseId: 'b-tie', dueOn: now });
    const tieB = verse({ userVerseId: 'a-tie', dueOn: now });

    const sorted = sortForLibrary(
      [upcoming, dueToday, mostOverdue, lessOverdue, tieA, tieB],
      now,
    );

    expect(sorted.map((v) => v.userVerseId)).toEqual([
      'oldest',
      'newer',
      'a-tie',
      'b-tie',
      'today',
      'upcoming',
    ]);
  });
});

describe('isDueForReview', () => {
  it('is due when the due day is today or earlier', () => {
    expect(isDueForReview('2026-07-05', '2026-07-06')).toBe(true);
    expect(isDueForReview('2026-07-06', '2026-07-06')).toBe(true);
  });

  it('is not due when the due day is in the future', () => {
    expect(isDueForReview('2026-07-07', '2026-07-06')).toBe(false);
  });
});

describe('libraryStats', () => {
  it('tallies status counts and due count for the Home stats row', () => {
    const now = '2026-07-06';
    const learning = verse({ userVerseId: 'a', dueOn: now });
    const reviewing = verse({
      userVerseId: 'b',
      srsState: { easeFactor: 2.5, intervalDays: 3, repetitions: 2 },
      dueOn: '2026-07-10',
    });
    const mastered = verse({
      userVerseId: 'c',
      srsState: { easeFactor: 2.5, intervalDays: 21, repetitions: 6 },
      lastGrade: 4,
      dueOn: '2026-07-01',
    });

    expect(libraryStats([learning, reviewing, mastered], now)).toEqual({
      total: 3,
      learning: 1,
      reviewing: 1,
      mastered: 1,
      dueCount: 2,
    });
  });

  it('returns all zeros for an empty library', () => {
    expect(libraryStats([], '2026-07-06')).toEqual({
      total: 0,
      learning: 0,
      reviewing: 0,
      mastered: 0,
      dueCount: 0,
    });
  });
});
