/** Format a Date as a local calendar-day key ('YYYY-MM-DD'), matching the
 * SRS scheduler's due_on format (Section 8.2). Local, not UTC, so "today"
 * matches the user's own calendar day. */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today's calendar-day key. UI-only helper (not domain code, so calling
 * `new Date()` here is fine per Section 10 — domain logic still takes an
 * injected clock). */
export function todayKey(): string {
  return formatDateKey(new Date());
}
