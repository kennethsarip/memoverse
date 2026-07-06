import {
  buildDueQueue,
  DEFAULT_NEW_VERSES_PER_SESSION,
  type SchedulableVerse,
} from '@/domain/srs';

const NOW = '2026-07-06';

const seen = (id: string, dueOn: string): SchedulableVerse => ({
  id,
  dueOn,
  lastReviewedAt: '2026-07-01',
});

const fresh = (id: string, dueOn: string): SchedulableVerse => ({
  id,
  dueOn,
  lastReviewedAt: null,
});

describe('buildDueQueue (Section 1.4)', () => {
  it('includes reviewed verses due today or overdue, and excludes future ones', () => {
    const verses = [
      seen('overdue', '2026-07-02'),
      seen('today', NOW),
      seen('future', '2026-07-20'),
    ];
    const { reviews } = buildDueQueue(NOW, verses);
    expect(reviews.map((v) => v.id)).toEqual(['overdue', 'today']);
  });

  it('orders reviews most overdue first, breaking ties by id for determinism', () => {
    const verses = [
      seen('b', '2026-07-04'),
      seen('a', '2026-07-04'),
      seen('older', '2026-07-01'),
    ];
    const { reviews } = buildDueQueue(NOW, verses);
    expect(reviews.map((v) => v.id)).toEqual(['older', 'a', 'b']);
  });

  it('separates never-reviewed verses into newVerses (not reviews)', () => {
    const verses = [seen('review', '2026-07-03'), fresh('new', NOW)];
    const queue = buildDueQueue(NOW, verses);
    expect(queue.reviews.map((v) => v.id)).toEqual(['review']);
    expect(queue.newVerses.map((v) => v.id)).toEqual(['new']);
  });

  it('caps new verses at the given limit', () => {
    const verses = [
      fresh('n1', NOW),
      fresh('n2', NOW),
      fresh('n3', NOW),
      fresh('n4', NOW),
    ];
    expect(buildDueQueue(NOW, verses, 2).newVerses.map((v) => v.id)).toEqual([
      'n1',
      'n2',
    ]);
  });

  it('defaults the new-verse cap to DEFAULT_NEW_VERSES_PER_SESSION', () => {
    const verses = Array.from({ length: DEFAULT_NEW_VERSES_PER_SESSION + 3 }, (_, i) =>
      fresh(`n${i}`, NOW),
    );
    expect(buildDueQueue(NOW, verses).newVerses).toHaveLength(
      DEFAULT_NEW_VERSES_PER_SESSION,
    );
  });

  it('introduces no new verses when the limit is 0', () => {
    expect(buildDueQueue(NOW, [fresh('n1', NOW)], 0).newVerses).toEqual([]);
  });

  it('does not introduce a new verse scheduled for a future day', () => {
    expect(buildDueQueue(NOW, [fresh('later', '2026-07-20')]).newVerses).toEqual([]);
  });

  it('returns empty arrays for an empty verse list', () => {
    expect(buildDueQueue(NOW, [])).toEqual({ reviews: [], newVerses: [] });
  });
});
