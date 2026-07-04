# BUILD_HISTORY.md — MemoVerse

Append-only log of shipped milestones. This file is a compact memory for Claude Code to
look back on for context. Keep entries concise (1-2 lines each, longer only for genuinely
complex phases).

How this file is used:
- When a phase from CLAUDE.md Section 7 is complete and its checkpoint passes, delete it
  from CLAUDE.md and add a 1-2 line summary here. This keeps CLAUDE.md small and cheap to read.
- When an Open Decision (CLAUDE.md Section 12) is resolved, add a one-line note here with the date and the decision.
- Newest entries go at the top. Use the format below. No emojis.

Entry format:
  ## <version.phase> <Title> — <YYYY-MM-DD>
  One to two sentences: what shipped and the key outcome. Note any important deviation from the plan.

---

(No phases shipped yet. The first entry will be 1.1 Foundations once its checkpoint passes.)
