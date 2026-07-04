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

## 1.1 Foundations — 2026-07-04

Bootstrapped the Expo (SDK 57) + TypeScript app: Expo Router with a (tabs) layout
(Home/Library/Progress/Profile) and an (onboarding) stack, NativeWind wired, and
src/theme design tokens (palette.json shared with Tailwind) for light and dark. Added
strict tsconfig, ESLint + Prettier, Jest (jest-expo) with a passing theme test, the
Supabase client in src/lib, and GitHub Actions CI (typecheck, lint, test). Wrote
migration 0001_init.sql for all Section 5 tables with RLS enabled (default deny) plus
public-read policies, and a seed (WEB translation + 5-verse "Getting Started" pack +
badges). Verified: gates green, iOS bundle builds, and `supabase db reset` migrates and
seeds cleanly (RLS on all 15 tables). Toolchain pins for compatibility: Tailwind 3.4,
Jest 29, ESLint 9; see CLAUDE.md Section 12 item 9 for added companion deps.
