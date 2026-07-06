import {
  INITIAL_SRS_STATE,
  isMastered,
  schedule,
  tierForState,
  type Grade,
  type SrsState,
} from '@/domain/srs';

/** Apply one graded review, returning the new state (drops dueInDays). */
function review(state: SrsState, grade: Grade): SrsState {
  const { easeFactor, intervalDays, repetitions } = schedule(state, grade);
  return { easeFactor, intervalDays, repetitions };
}

describe('multi-day SRS simulation (Section 7 checkpoint)', () => {
  it('advances a verse through the stages and reaches mastery on repeated good recall', () => {
    let state = INITIAL_SRS_STATE;
    expect(tierForState(state)).toBe(1); // new verse: Type it

    state = review(state, 4); // rep 1, interval 1
    expect(tierForState(state)).toBe(2); // Memorize it

    state = review(state, 4); // rep 2, interval 3
    expect(tierForState(state)).toBe(2);

    state = review(state, 4); // rep 3, interval 8
    expect(tierForState(state)).toBe(3); // Master it
    expect(isMastered(state, 4)).toBe(false); // interval still < 21

    state = review(state, 4); // rep 4, interval 20
    expect(isMastered(state, 4)).toBe(false);

    state = review(state, 4); // rep 5, interval 50 (>= 21)
    expect(tierForState(state)).toBe(3);
    expect(isMastered(state, 4)).toBe(true);
  });

  it('resurfaces a failed verse at Tier 1 the next day', () => {
    const mastered: SrsState = { easeFactor: 2.5, intervalDays: 50, repetitions: 5 };
    expect(tierForState(mastered)).toBe(3);

    const lapsed = review(mastered, 1); // fail
    expect(lapsed.repetitions).toBe(0);
    expect(lapsed.intervalDays).toBe(1); // due again tomorrow
    expect(tierForState(lapsed)).toBe(1); // back to Type it
    expect(isMastered(lapsed, 1)).toBe(false);
  });
});
