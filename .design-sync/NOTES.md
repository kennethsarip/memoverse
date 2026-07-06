# design-sync notes — Fount

Persistent guidance for future `/design-sync` runs on this repo. Read before syncing.

## This is a React Native (Expo) app, not a web component library

Claude Design renders and verifies components as **React DOM** in a headless browser.
Our components import from `react-native` (`View`, `Text`, `SafeAreaView`, etc.), which
do not exist in the DOM. They cannot render (and cannot be fidelity-verified) in the
browser until compiled through **`react-native-web`**. The network upload/connection
itself is unaffected by being a mobile app — only the render/verify step is.

Shape: `package` (no Storybook exists yet).

## Sync readiness

As of 2026-07-04 the Phase 1.3 UI kit now exists in `src/components`
(`VerseCard`, `WordChip`, `FirstLetterInput`, `Button`, `SessionHeader`,
`SessionCompleteCard`) alongside the earlier scaffolding placeholders. That is a real
design system worth syncing, but the web-render prerequisites below are still not in
place, so a sync cannot fidelity-verify these components yet. Set those up first. Note
`WordChip`/`SessionCompleteCard` use `react-native-reanimated`; the web target must alias
it (reanimated supports web) or those components will not render in DOM.

## Prerequisites before a first real sync (all are ADDITIONS; avoid editing existing src/)

1. Add `react-native-web` and a web-render alias so RN primitives map to DOM
   (NativeWind 4 supports web; Expo already depends on `react-dom`).
2. Add a web build target the converter can consume — an esbuild-bundlable `dist/`
   or a Storybook that renders the components in DOM. A Storybook is preferred:
   it gives true screenshot pairs for preview verification and switches the sync
   to the higher-fidelity `storybook` shape.
3. Expose styles as CSS reachable from `styles.css`. NativeWind/Tailwind
   (`tailwind.config.js`, `global.css`) is web-friendly; the JS token objects in
   `src/theme` (`palette.json`, `tokens.ts`) are not directly consumable as CSS —
   the Tailwind/NativeWind output is the styling source to point the sync at.
4. Expect small per-component web tweaks (shadows, `SafeAreaView`, platform-only
   props) for clean DOM rendering. Keep these in web-only files where possible so
   the mobile build is untouched.

## When these are in place

Re-run `/design-sync`. If a Storybook was added, set `"shape": "storybook"` and
`"storybookConfigDir"` in config.json; otherwise the `package` shape applies and
previews are authored from usage examples.
