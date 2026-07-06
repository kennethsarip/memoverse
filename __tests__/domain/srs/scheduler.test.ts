import { INITIAL_SRS_STATE, schedule, type SrsState } from '@/domain/srs';

describe('schedule (SM-2 variant, Section 8.2)', () => {
  describe('fail (grade < 3)', () => {
    const failed: SrsState = { easeFactor: 2.5, intervalDays: 40, repetitions: 6 };

    it.each([0, 1, 2] as const)(
      'grade %i resets reps to 0 and relearns tomorrow',
      (grade) => {
        const next = schedule(failed, grade);
        expect(next.repetitions).toBe(0);
        expect(next.intervalDays).toBe(1);
        expect(next.dueInDays).toBe(1);
      },
    );

    it('leaves ease unchanged on a fail (within range)', () => {
      expect(schedule(failed, 1).easeFactor).toBeCloseTo(2.5, 10);
    });

    it('floors ease at 1.3 even on a fail so a lapsed card never collapses below the floor', () => {
      const belowFloor: SrsState = { easeFactor: 1.1, intervalDays: 5, repetitions: 3 };
      expect(schedule(belowFloor, 0).easeFactor).toBeCloseTo(1.3, 10);
    });
  });

  describe('interval growth (grade >= 3)', () => {
    it('grows 1, then 3, then previous interval scaled by ease', () => {
      const first = schedule(INITIAL_SRS_STATE, 4);
      expect(first.repetitions).toBe(1);
      expect(first.intervalDays).toBe(1);

      const second = schedule(first, 4);
      expect(second.repetitions).toBe(2);
      expect(second.intervalDays).toBe(3);

      // rep 3: round(prevInterval 3 * ease 2.5) = round(7.5) = 8.
      const third = schedule(second, 4);
      expect(third.repetitions).toBe(3);
      expect(third.intervalDays).toBe(8);
    });

    it('scales the interval by the UPDATED ease, not the prior ease', () => {
      // rep 3+, interval 10, ease 2.5, grade 5 -> ease 2.6, interval round(10*2.6)=26.
      const state: SrsState = { easeFactor: 2.5, intervalDays: 10, repetitions: 3 };
      const next = schedule(state, 5);
      expect(next.easeFactor).toBeCloseTo(2.6, 10);
      expect(next.intervalDays).toBe(26); // 25 would mean the old ease was used
    });

    it('sets dueInDays equal to the new interval', () => {
      const next = schedule({ easeFactor: 2.5, intervalDays: 12, repetitions: 4 }, 4);
      expect(next.dueInDays).toBe(next.intervalDays);
    });
  });

  describe('ease update and clamping to [1.3, 2.7]', () => {
    const base: SrsState = { easeFactor: 2.5, intervalDays: 10, repetitions: 4 };

    it('grade 5 raises ease by 0.1', () => {
      expect(schedule(base, 5).easeFactor).toBeCloseTo(2.6, 10);
    });

    it('grade 4 leaves ease unchanged', () => {
      expect(schedule(base, 4).easeFactor).toBeCloseTo(2.5, 10);
    });

    it('grade 3 drops ease by 0.14', () => {
      expect(schedule(base, 3).easeFactor).toBeCloseTo(2.36, 10);
    });

    it('clamps ease at the 2.7 ceiling', () => {
      const high: SrsState = { easeFactor: 2.65, intervalDays: 10, repetitions: 4 };
      // 2.65 + 0.1 = 2.75 -> clamped to 2.7.
      expect(schedule(high, 5).easeFactor).toBeCloseTo(2.7, 10);
    });

    it('clamps ease at the 1.3 floor on a passing-but-hard grade', () => {
      const low: SrsState = { easeFactor: 1.3, intervalDays: 10, repetitions: 4 };
      // 1.3 - 0.14 = 1.16 -> clamped to 1.3.
      expect(schedule(low, 3).easeFactor).toBeCloseTo(1.3, 10);
    });
  });

  it('exposes a neutral INITIAL_SRS_STATE matching the schema defaults', () => {
    expect(INITIAL_SRS_STATE).toEqual({
      easeFactor: 2.5,
      intervalDays: 0,
      repetitions: 0,
    });
  });
});
