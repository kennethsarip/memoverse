# MemoVerse

A free, modern, gamified Bible-memory app for iOS and Android. Think "Duolingo for
Scripture memorization." Memorize verses with the first-letter technique, keep them for
the long term with spaced repetition, and stay motivated with XP, streaks, and badges.

MemoVerse is 100 percent free with no verse cap and no paywall, built for independent
learners as well as youth ministries and grade schools (for example AWANA).

For the full product and engineering spec, read CLAUDE.md. For shipped milestones, see
BUILD_HISTORY.md.

## Tech stack

- React Native + Expo (managed), TypeScript
- Expo Router, NativeWind, Reanimated + Moti
- Zustand + React Query
- Supabase (Postgres, Auth, Storage, Edge Functions, RLS)
- expo-sqlite + react-native-mmkv for offline
- expo-notifications, expo-speech
- Jest + @testing-library/react-native

## Getting started

Prerequisites: Node 20 LTS, the Expo tooling, Docker (for local Supabase), and a device
or simulator (Expo Go, or an iOS/Android emulator).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then fill in your Supabase URL and anon key

# 3. Start the local database (optional but recommended for development)
npx supabase start          # if ports 54321-54324 are taken by another Supabase
                            # project, offset the ports in supabase/config.toml
npx supabase db reset       # applies migrations + seeds the WEB sample pack

# 4. Run the app
npx expo start              # then press i (iOS) or a (Android), or scan the QR code
```

## Common commands

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier --write
npm test             # Jest
```

## Project structure

- app/ - Expo Router screens (onboarding, tabs, session)
- src/domain/ - pure business logic (first-letter engine, SRS scheduler, XP/streaks); fully unit-tested, no I/O
- src/features/ - feature modules (memorization, srs, gamification, verses, profile)
- src/data/ - repositories; the only layer that talks to Supabase/SQLite
- src/lib/ - cross-cutting clients (supabase, offline db, notifications, tts)
- src/theme/ - design tokens (light and dark)
- supabase/ - SQL migrations, seed data, and Edge Functions

Architecture rule: UI to features to data (repositories) to Supabase/SQLite. Business logic
stays pure in src/domain so it is easy to test.

## Contributing

Read CLAUDE.md before making changes; it is the source of truth for scope, data model,
conventions, and the Do Not guardrails. Work on a feat/<phase>-<slug> branch, keep pull
requests small (one phase or sub-feature), and make sure typecheck, lint, and tests are
green before merging.

## Status

Pre-v1. See the build plan in CLAUDE.md (Section 7). Shipped phases are logged in BUILD_HISTORY.md.
