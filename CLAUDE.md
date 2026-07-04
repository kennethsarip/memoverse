# CLAUDE.md — MemoVerse

> Product and engineering brief for building MemoVerse with Claude Code.
> This file is the single source of truth. Read it fully before writing any code.
> When a decision here conflicts with your assumptions, this file wins. If this
> file is silent on something, check Section 12 (Open Decisions) before inventing an answer.

---

## 1. Scope — What This App Is

MemoVerse is a free, modern, gamified Bible-memory app for phones (iOS + Android).
Think "Duolingo for Scripture memorization."

The problem it solves: existing Bible-memory apps look dated and paywall users. The
reference app charges about 4 dollars per month after only 50 imported verses. That gate
is the exact thing MemoVerse refuses to do.

Core promise (never break these):
- 100 percent free. No paywall. No verse cap. Ever. Core memorization is unlimited for everyone.
- Fun and habit-forming like Duolingo: XP, streaks, badges, short daily sessions, celebrations.
- Modern and engaging UI (bright, playful, gamified) that appeals to kids and teens without
  feeling childish to older teens and adults.
- Kid-safe by design. The audience includes minors, so privacy and safety are first-class.

Primary memorization method: the classic first-letter technique. The user types only the
first letter of each word, and typing the correct letter reveals the whole word. Difficulty
ramps across three tiers: all words shown, then half shown, then nothing shown. The scripture
reference is part of what is memorized (for example John 3:16 ends with "e l J 3 16").

Retention engine: spaced repetition (SRS) schedules each verse for review at expanding
intervals so verses move into long-term memory (active recall).

Audience (who we build for):
- Independent users: a teen, a kid, or an adult memorizing on their own (the v1 priority).
- Youth ministries and grade schools: AWANA (Sparks and T&T), Sunday school, Christian-school
  classrooms. Group and leader features come in v2 (the schema is prepared in v1).

Non-goals (what MemoVerse is NOT):
- Not a full Bible reader, study-notes, or commentary app.
- Not a social network. Not an ad platform. Not a data-collection business.
- Not a paywalled or freemium-with-a-cap product.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| App framework | React Native + Expo (managed workflow), TypeScript | One codebase for iOS + Android; fast iteration; strong AI-assisted DX |
| Navigation | Expo Router (file-based) | Simple, typed, deep-linkable routes |
| Styling | NativeWind (Tailwind for RN) | Fast, consistent, themeable design system |
| Animation | react-native-reanimated + moti | Smooth celebrations and transitions (gamified feel) |
| Local state | Zustand | Tiny, predictable global state |
| Server state / cache | @tanstack/react-query | Fetch, cache, and sync with Supabase; offline-friendly |
| Offline storage | expo-sqlite (verses + SRS state) + react-native-mmkv (fast key/value) | Full offline practice; sync when online |
| Backend / DB | Supabase (Postgres + Auth + Storage + Edge Functions + RLS) | Real SQL you own; built-in auth; generous free tier |
| Auth | Supabase Auth: username+password (no email), Apple, Google, email+password | Every user gets their own profile; kids do not need email |
| Notifications | expo-notifications | Daily review and streak reminders (kid-safe timing) |
| Audio (TTS) | expo-speech | "Listen to the verse" for auditory and young learners |
| Analytics | PostHog (self-host or EU cloud) or none in MVP (see Section 12) | Minimal, privacy-first, anonymized |
| Error tracking | Sentry (privacy-scrubbed) | Crash reporting only |
| Builds / release | EAS Build + EAS Submit | Cloud builds and store submission |
| Payments | NONE | App is 100 percent free. Donations later via a separate flow (see Section 12) |

Runtime targets: iOS 15+, Android 8+ (API 26+). Node 20 LTS for tooling.

Note: do not add a dependency that is not listed here without recording it in Section 12 and explaining why.

---

## 3. Repo Structure

```
memoverse/
  app/                       Expo Router routes (screens)
    (onboarding)/            Age gate, welcome, first-verse taster (guest-first)
    (tabs)/                  Home/session, Library, Progress, Profile
    session/                 Active memorization session flow
    _layout.tsx
  src/
    components/              Reusable UI (Button, VerseCard, WordChip, ProgressRing)
    features/                Feature modules (self-contained)
      memorization/          First-letter engine, difficulty tiers, session runner
      srs/                   Spaced-repetition scheduler (pure logic)
      gamification/          XP, streaks, badges
      verses/                Packs, custom verses, translations
      profile/               Account, kids-mode, settings
    lib/                     Cross-cutting: supabase client, offline db, notifications, tts
    data/                    Repositories (data access; the ONLY place that talks to Supabase/SQLite)
    domain/                  Pure types + business rules (no I/O, fully unit-testable)
    theme/                   Design tokens (colors, spacing, type) for light and dark
    utils/                   Small pure helpers
  supabase/
    migrations/              SQL migrations (source of truth for schema)
    seed/                    Seed data: translations, curated packs, WEB verse text
    functions/               Edge Functions (for example sync, badge evaluation)
  assets/                    Fonts, images, sounds, Lottie animations
  __tests__/                 Unit/integration tests mirror src/ structure
  app.config.ts              Expo config (env-driven)
  eas.json                   Build profiles (dev / preview / production)
  CLAUDE.md                  This file
  README.md                  Human-facing setup + structure
  BUILD_HISTORY.md           Append-only log of shipped milestones
```

Architecture rule (important): UI -> features -> data (repositories) -> Supabase/SQLite.
Pure business logic lives in src/domain and feature logic files with NO I/O, so it can be
unit-tested in isolation (SRS scheduler, first-letter matcher, XP and streak math).

---

## 4. Common Commands

```bash
# Setup
npm install                         # Install dependencies
cp .env.example .env                # Then fill in Supabase keys

# Run (dev)
npx expo start                      # Start Metro dev server (scan QR with Expo Go)
npx expo start --ios                # Open iOS simulator
npx expo start --android            # Open Android emulator

# Quality gates (run before every commit)
npm run typecheck                   # tsc --noEmit
npm run lint                        # ESLint
npm run format                      # Prettier --write
npm test                            # Jest unit/integration tests
npm run test:watch                  # Jest in watch mode

# Database (Supabase)
npx supabase start                  # Local Postgres + Studio (Docker)
npx supabase db reset               # Recreate DB from migrations + seed
npx supabase migration new <name>   # Create a new migration
npx supabase db push                # Apply migrations to the linked project

# Builds / release
npx eas build --profile preview     # Internal test build
npx eas build --profile production  # Store build
npx eas submit                      # Submit to App Store / Play Store
```

Note: if a command above does not exist yet, create the npm script as part of the task that
needs it, and update this list. Never document a command that is not wired in package.json.

---

## 5. Data Model (Supabase / Postgres)

Design principles: translation-independent references (so any translation can supply text),
per-user progress (own profile), groups modeled now but UI in v2, and Row-Level Security on
every user-owned table.

### 5.1 Core tables

```sql
-- A user's profile (1:1 with auth.users). Username-based accounts need no email.
profiles (
  id            uuid primary key references auth.users(id),
  username      text unique not null,
  display_name  text,
  avatar_key    text,
  age_band      text not null check (age_band in ('under_13','13_17','18_plus')),
  kids_mode     boolean not null default false,   -- true when age_band='under_13'
  timezone      text not null default 'UTC',
  xp            integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_on date,
  notif_opt_in  boolean not null default false,
  created_at    timestamptz not null default now()
)

-- Supported translations. WEB is public-domain default; NIV/ESV added later (licensed).
translations (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,             -- 'WEB','KJV','NIV','ESV'
  name          text not null,
  license_type  text not null check (license_type in ('public_domain','licensed')),
  is_enabled    boolean not null default false,   -- gate licensed ones until the license is in place
  attribution   text not null                      -- required copyright/attribution string
)

-- Translation-independent scripture reference (the address of a passage).
scripture_refs (
  id            uuid primary key default gen_random_uuid(),
  book          text not null,                    -- 'John'
  chapter       integer not null,
  verse_start   integer not null,
  verse_end     integer not null,                 -- = verse_start for single verse
  canonical_ref text not null,                    -- 'John 3:16' (display)
  osis          text unique,                      -- 'John.3.16' (stable id)
  sort_key      integer not null                  -- canonical bible order
)

-- The actual text of a reference in a given translation.
verse_texts (
  id               uuid primary key default gen_random_uuid(),
  scripture_ref_id uuid not null references scripture_refs(id),
  translation_id   uuid not null references translations(id),
  text             text not null,
  word_count       integer not null,
  unique (scripture_ref_id, translation_id)
)

-- Curated collections shown in the Library.
packs (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  category      text,                             -- 'topical','book','kids','beginner'
  age_band_hint text,                             -- suggested audience
  cover_key     text,
  sort_order    integer not null default 0,
  is_curated    boolean not null default true
)

pack_items (
  pack_id          uuid not null references packs(id),
  scripture_ref_id uuid not null references scripture_refs(id),
  position         integer not null,
  primary key (pack_id, scripture_ref_id)
)

-- A verse a specific user is memorizing (from a pack OR custom). Unlimited; no cap.
user_verses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id),
  scripture_ref_id uuid references scripture_refs(id),   -- null if free-text custom
  translation_id   uuid references translations(id),
  source           text not null check (source in ('pack','custom')),
  custom_ref       text,                          -- user-entered reference label (custom)
  custom_text      text,                          -- user-pasted text (custom, optional)
  added_at         timestamptz not null default now(),
  archived         boolean not null default false
)

-- SRS + difficulty state, one row per user_verse. The heart of retention.
verse_progress (
  id             uuid primary key default gen_random_uuid(),
  user_verse_id  uuid not null unique references user_verses(id),
  difficulty_tier smallint not null default 1 check (difficulty_tier between 1 and 3),
                                                  -- 1=all words, 2=half, 3=none
  ease_factor    numeric not null default 2.5,    -- SM-2 ease
  interval_days  integer not null default 0,
  repetitions    integer not null default 0,
  due_on         date not null default current_date,
  last_reviewed_at timestamptz,
  last_grade     smallint,                        -- 0..5 (see Section 8.2)
  is_mastered    boolean not null default false
)

-- Append-only history (also feeds anonymized analytics).
review_events (
  id             uuid primary key default gen_random_uuid(),
  user_verse_id  uuid not null references user_verses(id),
  reviewed_at    timestamptz not null default now(),
  mode           text not null,                   -- 'first_letter'
  difficulty_tier smallint not null,
  grade          smallint not null,               -- 0..5
  accuracy       numeric not null,                -- 0..1
  duration_ms    integer
)

-- Daily rollup that drives streaks + XP.
daily_activity (
  user_id        uuid not null references profiles(id),
  activity_on    date not null,
  xp_earned      integer not null default 0,
  verses_reviewed integer not null default 0,
  session_completed boolean not null default false,
  primary key (user_id, activity_on)
)

badges (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text not null,
  icon_key    text,
  criteria_type text not null,                    -- 'verses_mastered','streak_days','pack_complete'
  criteria_value integer
)

user_badges (
  user_id   uuid not null references profiles(id),
  badge_id  uuid not null references badges(id),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
)
```

### 5.2 Groups (schema now, UI in v2)

```sql
groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  join_code  text unique not null,                -- e.g. 'GRACE-YOUTH-7X2'
  leader_id  uuid not null references profiles(id),
  created_at timestamptz not null default now()
)

group_members (
  group_id  uuid not null references groups(id),
  user_id   uuid not null references profiles(id),
  role      text not null check (role in ('leader','member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
)

group_assignments (
  id               uuid primary key default gen_random_uuid(),
  group_id         uuid not null references groups(id),
  scripture_ref_id uuid not null references scripture_refs(id),
  translation_id   uuid references translations(id),
  assigned_by      uuid not null references profiles(id),
  week_of          date,
  due_on           date
)
```

### 5.3 Security (RLS) — non-negotiable
- Enable RLS on every table. Default deny.
- A user can read/write only their own profiles, user_verses, verse_progress, review_events,
  daily_activity, user_badges.
- translations, scripture_refs, verse_texts, packs, pack_items, badges are read-only public content.
- Group members may read their group's rows; only a group leader may write assignments (v2).
- Kids-mode / under-13 rows must never expose PII. No free-text that could contain personal data
  is analytics-exported.

---

## 6. How Things Work

### 6.1 Onboarding (guest-first, Duolingo-style)
1. App opens straight into a taster: the user memorizes one short verse immediately, no account.
2. Age gate asks birth year (neutral phrasing). under_13 leads to kids-mode (minimal data, no
   personalized anything). 13_17 and 18_plus get the full experience.
3. Progress is saved locally as a guest. A gentle prompt offers "Create a profile to save your
   progress" via username+password (no email needed), Apple, Google, or email. Guest data migrates
   into the new profile on sign-up.

### 6.2 The memorization session (bite-sized daily)
- A session = due SRS reviews + a few new verses, sized for short attention spans.
- Each verse is drilled with the first-letter engine at its current difficulty tier:
  - Tier 1: every word visible; user types first letters to confirm/warm up.
  - Tier 2: about half the words hidden; user types their first letters to reveal.
  - Tier 3: nothing shown; user recalls the whole verse from first letters, including the
    reference (J 3 16).
- Correct first letter reveals the whole word with a satisfying micro-animation.
- Session ends with a "Session complete" celebration (XP gained, streak, any new badge).

### 6.3 Spaced repetition
- After each verse, the app assigns a grade and the SRS scheduler (Section 8.2) sets the next
  due_on. Verses climb difficulty tiers as they are recalled well and become mastered once they
  survive Tier 3 at a long interval (Section 8.3).

### 6.4 Offline
- WEB verse text + the user's verses + SRS state are cached in SQLite/MMKV. Full practice works
  with no internet. On reconnect, a sync reconciles local review events to Supabase (last-write-wins
  per verse_progress; events are append-only).

### 6.5 Gamification loop
- XP for reps and completed sessions; streaks for consecutive active days; badges for milestones
  (verses mastered, streak lengths, pack completion). See Section 8.4.

### 6.6 Translations
- WEB is the enabled default. The engine reads text via verse_texts keyed by translation_id, so
  adding NIV/ESV is just enabling a translation + loading its text; no schema change. Licensed
  translations stay is_enabled=false until the license is in place (Section 12).

---

## 7. Build Plan — Versions and Phases

> Numbering: X.Y means version X, phase Y (for example 2.1 is version 2, phase 1).
> Each phase ends at a verifiable checkpoint. Do not start the next phase until the current
> checkpoint passes: npm run typecheck && npm run lint && npm test are green and the stated demo works.
>
> Graduation rule: when a phase is complete, move it to BUILD_HISTORY.md as a 1-2 line summary and
> delete it from this section, so this file stays small and cheap to read.

### Version 1 — Solo memorization MVP (the whole promise, for individuals)

- 1.2 First-letter engine (pure logic, TDD)
  - Write failing unit tests first for tokenize(), covering John 3:16, punctuation, quotes, numbers in the reference, single-word, and empty verses.
  - Implement tokenize(verseText, reference) returning ordered Token[] with firstLetter and isReference.
  - Implement isCorrectFirstLetter() (case-insensitive letters; literal digits; ignore leading punctuation/quotes).
  - Implement hiddenIndexesForTier() for tiers 1/2/3 (all shown, about half, none), deterministic given a seed.
  - Implement computeAccuracy(). Keep everything in src/domain with no I/O and no Date usage.
  - Checkpoint: the full engine test suite passes at 90 percent or higher coverage.

- 1.3 Session UI
  - Build VerseCard, WordChip, and the first-letter input control.
  - Wire the session runner that steps through a verse at its tier, revealing words on correct input with a reanimated micro-animation.
  - Add gentle incorrect-input feedback (shake/highlight) with no punishment (no hearts, no energy).
  - Build the "Session complete" screen showing XP, streak, and any new badge (data wired in later phases).
  - Add accessibility labels and reduced-motion handling.
  - Checkpoint: a user memorizes a seeded verse end-to-end on a device or simulator.

- 1.4 SRS scheduler (pure logic, TDD)
  - Write failing tests for schedule() covering fail-reset, interval growth (1, then 3, then ease-scaled), and ease clamping to [1.3, 2.7].
  - Implement the SM-2 variant per Section 8.2 with an injected clock (never call Date.now() inside domain code).
  - Implement tier promotion (Section 8.3) and mastery detection.
  - Implement buildDueQueue(now, verses) returning due reviews + a capped number of new verses for a session.
  - Checkpoint: scheduler tests pass; simulated multi-day runs resurface verses correctly.

- 1.5 Verses and library
  - Build the Library screen listing curated packs (packs + pack_items) with cover, title, category.
  - Implement "start pack": create user_verses rows plus initial verse_progress.
  - Build "Add custom verse": pick a reference from scripture_refs OR paste free text; store as source='custom'. No cap.
  - Add validation and clear, user-safe error messages for custom input.
  - Put all reads/writes in src/data repositories; components never touch Supabase directly.
  - Checkpoint: add a custom verse and start a curated pack; both enter the SRS due queue.

- 1.6 Accounts and guest-to-profile
  - Implement guest mode: local profile and local progress persistence (SQLite/MMKV).
  - Build the age gate (birth year) that sets age_band and kids_mode.
  - Implement Supabase Auth for username+password (no email), Apple, Google, and email+password.
  - Implement guest-to-profile migration on first sign-up (move local user_verses, verse_progress, daily_activity into the account).
  - Add an integration test proving RLS blocks a user from reading another user's rows.
  - Checkpoint: sign up via all four methods; guest progress migrates intact.

- 1.7 Gamification
  - Implement XP calculation (Section 8.4) awarded per verse attempt and on session completion.
  - Implement streak logic on the user's local calendar (continue, reset-to-1, break-to-0), updating current and longest streak.
  - Write daily_activity rollups.
  - Implement badge evaluation after each session against badges.criteria_type/value; write user_badges.
  - Build UI: XP counter, streak indicator, badge unlock celebration.
  - Checkpoint: streak increments across simulated days; a badge unlocks and displays.

- 1.8 Offline, notifications, and audio
  - Cache WEB verse text + user verses + verse_progress in SQLite; read-through so sessions run fully offline.
  - Implement sync: queue review_events offline and reconcile on reconnect (append-only events; last-write-wins on verse_progress).
  - Implement daily reminder notifications via expo-notifications with opt-in and kid-safe quiet hours.
  - Implement "Listen to the verse" TTS via expo-speech.
  - Checkpoint: complete a full session in airplane mode; a reminder fires; a verse reads aloud; data syncs on reconnect.

- 1.9 Polish, basic progress stats, and store prep
  - Build the Progress dashboard: verses mastered, streak calendar, accuracy over time (basic).
  - Add empty states, error states, and loading skeletons throughout.
  - Run an accessibility pass (labels, hit targets 44px or larger, contrast, reduced motion).
  - Configure eas.json profiles and produce a production build.
  - Render the required translation attribution text.
  - Checkpoint: an internal TestFlight/Play build installs and runs clean.

### Version 2 — Community and licensed translations

- 2.1 Groups and join codes
  - Build UI over the v1 groups schema: create a group (generates join_code) and group settings.
  - Implement join-by-code producing a group_members row (role member); the creator is the leader.
  - Keep the join flow kid-safe for under-13 (no extra PII collected).
  - Enforce RLS: members read their group; only a leader writes.
  - Checkpoint: a leader creates a group and a second account joins by code.

- 2.2 Leader-assigned verses
  - Let a leader assign a scripture_ref (this week's verse) via group_assignments.
  - Members see the assigned verse and it enters their SRS queue.
  - Give the leader an aggregate, privacy-aware view of member completion.
  - Checkpoint: a leader assigns a verse; a member sees it and completes it; the leader sees progress.

- 2.3 Team/organization leaderboards
  - Build a per-group weekly leaderboard ranking members by XP or verses (no global universal board).
  - Reset weekly; display only display_name/username (privacy-aware).
  - Checkpoint: two members in a group see correct relative ranking that resets weekly.

- 2.4 Ministry/curriculum presets
  - Seed AWANA (Sparks and T&T) and common Sunday-school verse lists as curated packs.
  - Tag packs by program and age band so leaders can find the right set.
  - Checkpoint: an AWANA preset pack is browsable and startable.

- 2.5 NIV and ESV translations (pulled earlier per priority)
  - Secure licensing (self-funded is acceptable; see Section 12) and enable the translation rows.
  - Load licensed verse_texts and respect any API, caching, and attribution constraints of the license.
  - Ship the optional donation flow to help sustain licensing and hosting.
  - Checkpoint: a user can switch to NIV or ESV and memorize a verse; attribution is displayed.

### Version 3+ — Depth

- 3.1 Advanced stats and insights
  - Add retention curves, weak-verse detection, and detailed review history to the Progress area.

- 3.2 More translations and languages
  - Add additional translations and begin app localization scaffolding.

- 3.3 Optional mascot and cosmetic themes
  - Resolve the branding decision (Section 12), then add an optional mascot and cosmetic themes.

- 3.4 Streak freezes, challenges, and richer celebrations
  - Add streak-freeze protection, an opt-in challenge mode, and expanded celebration moments.

---

## 8. Interfaces and Formulas

> These are contracts. Implement them as pure, unit-tested functions in src/domain or feature
> logic files. Do not couple them to React or I/O.

### 8.1 First-letter engine
```ts
interface Token {
  raw: string;         // 'loved'
  firstLetter: string; // 'l' (lowercased; digits map to themselves, e.g. '3'->'3')
  isReference: boolean;// reference tokens (book/chapter/verse) at the end
}

/** Split a verse + reference into ordered tokens. Punctuation is attached, not its own token. */
function tokenize(verseText: string, reference: string): Token[];

/** Which token indexes are hidden at a given tier (1=all shown, 2=~half, 3=none shown). */
function hiddenIndexesForTier(tokens: Token[], tier: 1 | 2 | 3): Set<number>;

/** Is the typed key correct for the expected token? Case-insensitive; digits literal. */
function isCorrectFirstLetter(input: string, expected: Token): boolean;

/** Accuracy for a completed verse attempt = correctFirstTries / totalTokens (0..1). */
function computeAccuracy(totalTokens: number, correctFirstTries: number): number;
```
Rules: matching is case-insensitive; numbers in the reference match their digit; ignore leading
punctuation and quotes when deriving the first letter.

### 8.2 SRS scheduler (SM-2 variant)
```ts
type Grade = 0 | 1 | 2 | 3 | 4 | 5; // 0-2 = fail, 3 = hard, 4 = good, 5 = easy

interface SrsState { easeFactor: number; intervalDays: number; repetitions: number; }

function schedule(state: SrsState, grade: Grade): SrsState & { dueInDays: number };
```
- grade < 3 (fail): repetitions = 0, intervalDays = 1 (relearn tomorrow), ease unchanged but floored.
- grade >= 3: repetitions += 1; interval: rep==1 -> 1, rep==2 -> 3, else round(prev * easeFactor).
- Ease update: EF' = clamp(EF + (0.1 - (5-grade)*(0.08 + (5-grade)*0.02)), 1.3, 2.7).
- dueInDays = intervalDays.

### 8.3 Difficulty-tier promotion and mastery
- Promote tier (1 to 2 to 3) after 2 consecutive attempts at the current tier with grade >= 4.
- Mastered when: tier == 3 AND intervalDays >= 21 AND last grade >= 4.

### 8.4 XP, streaks, badges
```
XP for one completed verse attempt:
  xp = round( base(=10) * tierMultiplier[tier] * (0.5 + 0.5*accuracy) )
  tierMultiplier = {1:1.0, 2:1.5, 3:2.0}
  plus sessionCompleteBonus = 20 (once per completed daily session)

Streak (on the user's local calendar day):
  session_completed today AND yesterday completed -> current_streak += 1
  session_completed today AND yesterday missed     -> current_streak = 1
  a day passes with no completion                  -> current_streak = 0
  longest_streak = max(longest_streak, current_streak)
```
Badges are evaluated after each session against badges.criteria_type/value
(verses_mastered, streak_days, pack_complete).

---

## 9. Testing

Philosophy: the domain logic is the product's brain, so it gets the most tests. UI gets smoke and
key-flow tests. Because this app is largely built via Claude Code, tests are the guardrail that
proves a change is correct.

- Framework: Jest + @testing-library/react-native. End-to-end later with Maestro.
- TDD is required for Section 8 logic (first-letter engine, SRS scheduler, XP/streak/mastery):
  write the failing test first, then implement. These must be 100 percent deterministic; inject a
  clock and never call Date.now() directly in domain code.
- Coverage gate: 90 percent or higher for src/domain and feature logic; 60 percent or higher overall. CI fails below.
- What to test:
  - Engine: John 3:16 happy path; punctuation; numbers in reference; empty and one-word verses; wrong keys.
  - Scheduler: fail resets; interval growth; ease clamping; tier promotion; mastery threshold.
  - Gamification: streak continue/break across day boundaries and timezones; XP math; badge unlocks.
  - Data repositories: RLS denies cross-user reads (integration test against local Supabase).
  - Offline sync: local events reconcile without loss or duplication.
- Every phase checkpoint (Section 7) requires npm run typecheck && npm run lint && npm test green.

---

## 10. Conventions

- Use descriptive, self-explanatory names (calculateNextReviewDate, not calc; VerseCard, not VC).
- Small functions (under 50 lines); one responsibility each. Split big ones.
- Inline comments explain WHY, not WHAT (for example: floor ease at 1.3 so failed cards do not collapse to daily forever).
- Prettier and ESLint enforced: 2-space indent, single quotes, no unused imports, trailing commas.
- TypeScript strict mode on. No any (use unknown plus narrowing). Explicit types on public functions.
- Error handling with clear, user-safe messages; never surface raw stack traces to users; log details to Sentry.
- Domain code is pure (no React, no fetch, no Date.now() inside). Side effects live in data/ and lib/.
- Data access only through repositories in src/data; components never import the Supabase client directly.
- Design tokens only; no hard-coded hex or spacing in components; pull from src/theme. Support light and dark.
- Accessibility: every interactive element has an accessibilityLabel; hit targets 44px or larger; respect reduced motion.
- Commits: Conventional Commits (feat, fix, test, chore), imperative, scoped, small.
- When you finish a change, output only the code plus a brief README note on structure/usage. No chit-chat.

---

## 11. Do Not (Guardrails)

Product / mission
- Do not add a paywall, verse cap, hearts/energy system, or any gate on core memorization. The app is 100 percent free.
- Do not ship, cache, or seed a licensed translation (NIV, ESV, NLT) before its license is in place. Licensing is expected to be handled (self-funded if needed), so it is not a hard blocker; the only rule is never distribute licensed text you have not licensed. Public-domain (WEB) is always fine.
- Do not add ads, sell data, or add trackers, especially for under-13 users.

Safety / privacy (minors)
- Do not collect PII from a child beyond the minimum; never require email for a kid to have a profile.
- Do not export free-text or PII to analytics; analytics stay anonymized and aggregate.
- Do not send notifications outside kid-safe / quiet hours.

Engineering
- Do not disable RLS or write a policy that lets a user read another user's rows.
- Do not put business logic in components, or call Supabase/SQLite directly from UI; go through data/ repositories.
- Do not call Date.now() or new Date() inside domain logic; inject the clock so tests stay deterministic.
- Do not add a dependency not in Section 2 without recording it in Section 12 with a reason.
- Do not hard-code colors, spacing, strings, or secrets; use theme tokens, constants, and env vars.
- Do not commit secrets or .env. Do not commit generated builds.
- Do not write overwhelming functions (over 50 lines) or clever one-liners that hurt readability.
- Do not skip the failing test for Section 8 logic. Do not merge a phase with red typecheck, lint, or tests.
- Do not invent APIs or fields not in this doc; if something is missing, add it to Section 12 and ask.
- Do not mark work done if a step was skipped or a test failed; report it honestly.

Documentation and token efficiency (keep Claude Code cheap to run)
- Do not use emojis anywhere in this repo's docs, code, comments, or commit messages. They add tokens and rendering noise. Use plain text labels (Do not, Note, OPEN) instead.
- Keep CLAUDE.md and all docs concise: prefer short tables and bullets over prose, state each fact once, and do not restate context that already appears above.
- When a phase completes, move it to BUILD_HISTORY.md as a 1-2 line summary and delete it from Section 7, so this file stays small.
- Do not paste large code blocks, file dumps, or verbose logs into docs; reference the file and line instead.
- Do not add comments that merely restate the code; only explain non-obvious WHY.
- Read only the file sections you need for the task; do not re-read files already in context.

---

## 12. Open Decisions / TODO

| # | Decision | Status | Notes |
|---|---|---|---|
| 1 | NIV/ESV licensing | PLANNED, not a hard blocker | NIV = Biblica/Zondervan; ESV = Crossway. Both licensed. Preferred: an official free-use API tier; worst case the owner self-funds the license. Enable the translation only once the license is in place. Do not block v1 on this. |
| 2 | Funding path | DECIDED (donations/ministry), not built | Optional "Support MemoVerse" donations plus ministry/foundation sponsorship. Ship the donation flow in 2.5. Never a paywall. |
| 3 | COPPA / consent | DIRECTION SET, review before launch | Applies only to under-13 users. Because we collect no personal info from under-13 users (guest mode, no email, no ads, no trackers, no persistent tracking identifiers), the verifiable-parental-consent requirement is largely avoided. Before public launch / store submission, get a privacy/legal or compliance-service review of the privacy policy and data flows. Also check Apple Kids Category and Google Play Designed for Families rules. |
| 4 | Mascot / branding | DEFERRED | UI leaves room for an optional mascot. Decide character vs clean-brand in 3.3. Aesthetic is bright, playful, gamified for now. |
| 5 | Analytics tool | OPEN | Minimal privacy-first (PostHog EU/self-host) or none in MVP. Decide before 1.9. Must be anonymized and kid-safe. |
| 6 | KJV as second free translation | NICE-TO-HAVE | WEB is default. KJV is public-domain and trivial to add if requested. |
| 7 | Streak freezes / challenge mode | LATER | Considered for 3.4. |
| 8 | Group join for under-13 | V2 | Ensure the join-code flow for minors stays within kid-safe constraints. |
| 9 | Deps added in 1.1 beyond Section 2 | RECORDED | Required companions of listed libs, not new choices: react-dom (Expo Router web), react-native-url-polyfill (Supabase in RN), react-native-worklets (Reanimated 4 peer), babel-preset-expo + @react-native/jest-preset (Expo/jest-expo build). Toolchain pins for compat: tailwindcss 3.4 (NativeWind 4 needs Tailwind v3), Jest 29 (jest-expo 57), ESLint 9 (eslint-config-expo 57). Repo uses .npmrc legacy-peer-deps for the react/react-dom peer range. |

> When you resolve an item, move it to BUILD_HISTORY.md with the date and reasoning, and update the
> affected sections above.

---

## 13. Repo and GitHub Practices

- Branching: main is always releasable. Work on feat/<phase>-<slug> (for example feat/1.2-first-letter-engine).
- Pull requests: one phase or sub-feature per PR; small and reviewable. The PR description states the phase,
  what changed, and how the checkpoint was verified. Link the Section 7 phase.
- CI (GitHub Actions): on every PR run typecheck, then lint, then test (plus the coverage gate). Red means no merge.
- Commit trailer for AI-assisted commits:
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
- Docs stay in sync: if a change alters schema, commands, or contracts, update CLAUDE.md in the same PR.
  Append shipped milestones to BUILD_HISTORY.md.
- Readable by humans: clear names, small diffs, meaningful commit messages, and a README.md that lets a new
  person run the app in under 10 minutes.
- Secrets: never in git. Use .env (git-ignored) locally and EAS secrets / Supabase env for builds.
- Review checklist per PR: RLS intact? Domain logic pure and tested? Tokens (no hard-coded styles)?
  Kid-safe and no PII? Docs updated?

---

## 14. Transitioning to Production

1. Environments: separate Supabase projects for dev, staging, and production; env-driven config in
   app.config.ts; never point the app at prod during development.
2. Data: enable automatic backups and point-in-time recovery on the production DB. Verify RLS on every
   table before launch (write a test that asserts default-deny).
3. Secrets: production keys in EAS secrets / Supabase env; rotate any that ever touched a laptop.
4. Observability: Sentry (PII-scrubbed) for crashes; minimal anonymized analytics (once Section 12 item 5
   is decided); basic alerting on error spikes and failed builds.
5. Compliance before store submission: finalize the COPPA posture, privacy policy, and terms (Section 12
   item 3); complete the App Store and Play data-safety questionnaires honestly (minimal data, no ads, no
   sale). Apple sign-in must be present if Google or other social logins exist.
6. Release process: eas build --profile production, then internal test (TestFlight / Play internal), then a
   staged rollout, then monitor Sentry/analytics, then promote. Keep a documented rollback (previous build
   plus reversible migrations; never write a destructive migration without a backup and a tested down-path).
7. Content licensing gate: confirm only cleared translations are enabled in production
   (translations.is_enabled). Display required attribution text for every translation.
8. Performance and cost: verify offline sync under flaky networks; check Supabase free-tier limits and the
   plan for scaling as users grow; lazy-load verse text; keep cold start fast.
9. Support and feedback: an in-app feedback path, a simple support email, and a way for ministries to reach you.
10. Launch checklist sign-off: all Section 7 v1 checkpoints green, tests and coverage gates pass, RLS
    verified, COPPA/privacy done, store assets ready, rollback rehearsed.

---

End of CLAUDE.md. Keep this document current. It is the contract between the human and Claude Code.
