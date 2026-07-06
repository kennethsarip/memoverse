import { isMastered, tierForState, type SrsState } from '@/domain/srs';

const state = (partial: Partial<SrsState>): SrsState => ({
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 1,
  ...partial,
});

describe('tierForState (Section 8.3 interval -> stage)', () => {
  it('is Tier 1 "Type it" for a new verse (repetitions 0)', () => {
    expect(tierForState(state({ repetitions: 0, intervalDays: 0 }))).toBe(1);
  });

  it('is Tier 1 for a just-relearned verse regardless of interval', () => {
    // A failed verse resets to repetitions 0 with interval 1; it must show at Tier 1.
    expect(tierForState(state({ repetitions: 0, intervalDays: 1 }))).toBe(1);
  });

  it('is Tier 2 "Memorize it" for a reviewed verse with interval under a week', () => {
    expect(tierForState(state({ repetitions: 1, intervalDays: 1 }))).toBe(2);
    expect(tierForState(state({ repetitions: 3, intervalDays: 6 }))).toBe(2);
  });

  it('is Tier 3 "Master it" once the interval reaches a week or more', () => {
    expect(tierForState(state({ repetitions: 3, intervalDays: 7 }))).toBe(3);
    expect(tierForState(state({ repetitions: 5, intervalDays: 40 }))).toBe(3);
  });
});

describe('isMastered (Section 8.3)', () => {
  it('is mastered at Tier 3 with interval >= 21 and last grade >= 4', () => {
    expect(isMastered(state({ repetitions: 6, intervalDays: 21 }), 4)).toBe(true);
    expect(isMastered(state({ repetitions: 6, intervalDays: 50 }), 5)).toBe(true);
  });

  it('is not mastered before the 21-day interval', () => {
    expect(isMastered(state({ repetitions: 5, intervalDays: 20 }), 5)).toBe(false);
  });

  it('is not mastered when the last grade was below 4', () => {
    expect(isMastered(state({ repetitions: 6, intervalDays: 30 }), 3)).toBe(false);
  });

  it('is not mastered while still below Tier 3', () => {
    expect(isMastered(state({ repetitions: 0, intervalDays: 30 }), 5)).toBe(false);
    expect(isMastered(state({ repetitions: 3, intervalDays: 6 }), 5)).toBe(false);
  });
});
