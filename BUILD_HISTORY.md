# BUILD_HISTORY.md — Fount

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

## Planning: v1 build plan expanded for the mockup UI — 2026-07-06

Restructured CLAUDE.md Section 7 Version 1 into screen-oriented phases (now 1.4-1.15) so the locked
prototype UI gets built explicitly, since none of the mockup UI is in the codebase yet. Added a
design-system/app-shell phase (1.5) and one phase per mockup screen (Verses 1.6, Home 1.7, Bible 1.8,
Session polish 1.9, Profile 1.13) plus a guest-first onboarding phase (1.10), folding the prior
functional phases (verses/library, accounts, gamification, offline, store prep) into the new
numbering. Plan only; no app code shipped this change.

## Branding: renamed to Fount, visual identity locked — 2026-07-06

Locked the product name Fount (off the working name "MemoVerse", which collides with the
existing Memverse Bible-memory app and an older MemoVerse desktop tool; the "vers-" naming
space is saturated). Locked the look: living-water cyan (~#1497D8) as the single default accent
on a clean neutral base, Poppins type, Georgia for scripture body text, balanced warm-but-grounded
tone; extra color themes deferred to a later unlock. Sharpened the v1 audience to teenagers and
younger adults (youth ministry/AWANA stays a v2 group feature, not a current positioning driver).
Reconciled session stages to be interval-driven (CLAUDE.md Section 8.3, superseding the earlier
consecutive-grade promotion rule). Applied the rename to app.config, package.json, and the RN
screens, and swapped the RN brand palette from the old purple to living-water cyan; the on-disk
repo directory and local Supabase project id still read "memoverse" (cosmetic, rename deferred).
Resolves Section 12 item 4 (name + look).

## 1.3 Session UI — 2026-07-04

Built the memorization session UI on top of the 1.2 engine. Components in src/components:
WordChip (masked placeholder plus reveal pop), VerseCard (wrapping flow of chips),
FirstLetterInput (the keyboard control: a focused hidden TextInput that captures each
keystroke, resets to empty, and fans batched input out one letter at a time), Button,
SessionHeader (reference, tier pill, progress bar), and SessionCompleteCard (real accuracy
from the engine; XP/streak/badge are placeholders wired in 1.7). Pure session runner in
src/features/memorization (startVerseAttempt/applyKey/attemptAccuracy/isRevealed) drives
reveal-on-correct and no-advance-on-wrong with gentle shake feedback (no hearts/energy).
Reduced-motion honored throughout; accessibility labels on all interactive elements. app/session
screen wired from the Home daily-session card. Deviations (see CLAUDE.md Section 12 item 9):
used reanimated directly (no moti) and added test-renderer for RNTL 14; keyboard-input mechanism
documented in Section 6.2. 60 tests pass (26 new), 100% coverage on domain/feature logic;
typecheck and lint green. On-device end-to-end demo is the user's to run (simulator not launched here).

## 1.2 First-letter engine — 2026-07-04

Built the pure first-letter memorization engine in src/domain/firstLetter (TDD, tests
written first): tokenize() splits a verse plus its reference into ordered Token[] (verse
words, then reference tokens like John/3/16, punctuation attached), deriveFirstLetter()
lowercases the first letter and treats digits literally, isCorrectFirstLetter() matches
case-insensitively and ignores leading punctuation, hiddenIndexesForTier() returns
none/about-half/all per tier (tier 2 seeded and deterministic via a mulberry32 PRNG), and
computeAccuracy() is clamped and divide-by-zero safe. No I/O, no Date. 34 tests pass at
100% domain coverage. Wired the Section 9 gate: added npm run test:coverage plus a
jest coverageThreshold of 90% on ./src/domain, and pointed CI at test:coverage.

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
