import type { Grade } from './types';

/**
 * Map a completed session-stage accuracy (0..1) to an SM-2 grade (Section
 * 8.2). Thresholds center on the 90% advance-stage gate (CLAUDE.md Section 1
 * UI direction): a strong pass at or above it reads as "good" or better, a
 * shaky pass below it is "hard", and anything under 60% is a lapse.
 */
export function gradeFromAccuracy(accuracy: number): Grade {
  const clamped = Math.min(Math.max(accuracy, 0), 1);
  if (clamped >= 0.95) return 5;
  if (clamped >= 0.8) return 4;
  if (clamped >= 0.6) return 3;
  if (clamped >= 0.4) return 2;
  if (clamped >= 0.15) return 1;
  return 0;
}
