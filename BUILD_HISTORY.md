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

## 1.6 Verses screen, library, and add-verse — 2026-07-07

Built the src/data content repositories (packs/pack_items, scripture_refs, verse_texts, WEB
translation id) and the src/data/library guest repository (in-memory zustand store standing in
for accounts/offline storage until 1.11/1.14), plus src/domain/verses (status/overdue/sort/filter
logic and free-text custom-verse validation, TDD). Built the Verses screen: filter chips (All/
Learning/Reviewing/Mastered), a due-count badge, overdue-first sorted VerseRow list, and a
floating "+" FAB opening AddVerseSheet — a bottom sheet to start a curated pack or add a free-text
custom verse (picking a scripture_ref for a custom verse is deferred to the 1.8 Bible picker).
Both paths write user_verses + initial verse_progress (stage 1, due today) into the SRS queue.
Fixed two pre-existing bugs blocking the gates: an undefined `statusTone` reference in VerseRow
and a set-state-in-effect lint violation in the new sheet (reset moved to the close handler).
Typecheck, lint, and all 105 tests green; verified via a compiled web bundle (no simulator run).

## 1.5 Design system and app shell — 2026-07-06

Built the living-water UI kit from the locked prototype (fetched its live CSS/SVG source for
exact hex values, tab icon paths, and the flame gradient). Reconciled src/theme/tokens.ts to the
palette (it had been mid-migrated to the living-water palette in a prior session, leaving it and
tailwind.config.js referencing a removed `accent` key): ThemeColors now exposes page/surface/
surface2/ink/inkSoft/inkFaint/inkUpcoming/primarySoft/primaryStrong/streak/success/danger per
scheme, plus an expanded radii scale (chip/button/card/bar/sheet) and Poppins (400/500/700/800)
+ Georgia typography tokens. Added a zustand theme-mode store (light/dark/system) wired through
useTheme(), with a ThemeToggle control on Home. Built Card, Chip, SectionHeader, ListRow,
ProgressRing (animated via reanimated + react-native-svg), and StreakFlame (exact traced path/
gradient, simplified to one looped scale/rotate flicker instead of the prototype's two
counter-animated layers) in src/components; updated Button to the mockup's 14px radius and
ghost/primary variants. Rebuilt the tab layout as a floating frosted bar (expo-blur BlurView +
translucent surface tint, matching the prototype's blur/radius/shadow exactly) with hand-drawn
SVG icons for Home/Verses/Bible/Profile (no icon-library dependency). Renamed routes to the
locked nav (library.tsx -> verses.tsx, added bible.tsx, removed progress.tsx; progress stats move
under Profile in 1.13). Typecheck, lint, and all 92 tests green. Verified web bundling only
(react-native-web is not installed, as .design-sync/NOTES.md flagged); the on-device/simulator
demo is the user's to run, consistent with 1.3.

## 1.4 SRS scheduler — 2026-07-06

Built the pure spaced-repetition scheduler in src/domain/srs (TDD, tests first). schedule() is the
SM-2 variant from Section 8.2: fail (grade < 3) resets repetitions to 0 and relearns tomorrow, pass
grows the interval 1/3/round(prev*ease) using the updated ease, and ease clamps to [1.3, 2.7].
tierForState()/isMastered() derive the session stage from the interval per Section 8.3 (Tier 1 new,
2 for interval 1-6d, 3 at 7d+; mastered at Tier 3 with interval >= 21 and last grade >= 4).
buildDueQueue(now, verses, limit) takes an injected 'YYYY-MM-DD' now (no Date.now()) and returns due
reviews (most-overdue first, id tie-break) plus up to DEFAULT_NEW_VERSES_PER_SESSION (3) new verses.
92 tests pass (32 new) at 100% domain coverage; typecheck and lint green.

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
