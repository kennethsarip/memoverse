import { gradeFromAccuracy } from '@/domain/srs';

describe('gradeFromAccuracy (Section 8.2 grade 0..5 from a session accuracy)', () => {
  it('is 5 (easy) for a flawless attempt', () => {
    expect(gradeFromAccuracy(1)).toBe(5);
    expect(gradeFromAccuracy(0.95)).toBe(5);
  });

  it('is 4 (good) for a strong attempt at or above the 90% advance gate', () => {
    expect(gradeFromAccuracy(0.9)).toBe(4);
    expect(gradeFromAccuracy(0.85)).toBe(4);
  });

  it('is 3 (hard) for a passing but shaky attempt', () => {
    expect(gradeFromAccuracy(0.7)).toBe(3);
    expect(gradeFromAccuracy(0.6)).toBe(3);
  });

  it('is a fail (0..2) below 60% accuracy, scaled toward 0', () => {
    expect(gradeFromAccuracy(0.5)).toBe(2);
    expect(gradeFromAccuracy(0.3)).toBe(1);
    expect(gradeFromAccuracy(0)).toBe(0);
  });

  it('clamps out-of-range accuracy into [0, 1]', () => {
    expect(gradeFromAccuracy(1.5)).toBe(5);
    expect(gradeFromAccuracy(-0.5)).toBe(0);
  });
});
