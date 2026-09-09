# TASK: Add a testing setup + tests to gym-tracker-rn

Set up a proper test suite for this Expo (SDK 57) React Native + TypeScript app, then write meaningful tests. Read the versioned Expo docs (https://docs.expo.dev/versions/v57.0.0/) for the current recommended testing approach. Keep everything TypeScript-clean.

## 1. Install & configure (jest-expo + Testing Library)
- Use **jest-expo** as the preset (the Expo-recommended way). Install dev deps: `jest-expo`, `jest`, `@types/jest`, `@testing-library/react-native`, `@testing-library/jest-native` (or the built-in matchers if that's the current recommendation for SDK 57 — check the docs), and `react-test-renderer` at the matching React version.
- Add jest config (in package.json or jest.config.js) with `preset: "jest-expo"`, jsdom/node as appropriate, a `transformIgnorePatterns` that covers RN + expo + @supabase + @react-native-async-storage so they transform correctly, and setup files for the testing-library matchers.
- Add npm scripts: `"test": "jest"` and `"test:watch": "jest --watch"` and `"test:ci": "jest --ci --coverage"`.
- Mock native modules that break in Jest: `@react-native-async-storage/async-storage` (use its official jest mock), and `../src/lib/supabase` (mock the `supabase` client) so tests don't hit the network.

## 2. Write tests (aim for real coverage of the logic + a couple of components)

**A) Pure logic — `src/lib/scheme.ts`** (highest value, fully deterministic):
- `parseTarget('4 × 8–10')` → 4; `parseTarget('3 × 20')` → 3; no match → default 3.
- `isTimeScheme('3 × 40–60s')` → true; `isTimeScheme('4 × 8–10')` → false; undefined → false.
- `fmtLast`: weighted set `{w:'40',r:'8'}` → '40×8'; bodyweight (weighted=false, timeBased=false) `{r:'12'}` → '12'; time-based → '45s'; undefined set → ''.
- `KIND_LABEL` maps each Kind correctly.

**B) Pure logic — `lastFor` in `src/lib/history.ts`** (the global per-exercise "last time"):
- Given a synthetic `HistorySlotEntry[]`, `lastFor` returns the MOST RECENT sets for a slot regardless of session/plan.
- Prefers the SAME `kind` when present, else falls back to any kind.
- Returns null when the slot was never logged.
- Picks by latest DATE even if array order is shuffled.

**C) Async DB — `fetchHistory` and `finishWorkout` in `src/lib/history.ts`** (mock `supabase`):
- `fetchHistory`: given a mocked Supabase response, it flattens workouts→slots→sets, sorts sets by position, drops slots with no sets, and returns the expected `HistorySlotEntry[]`. Test the error path throws.
- `finishWorkout`: mock the chained `.from().insert().select().single()`; assert it inserts the workout, then a slot per entry with correct position, then the sets payload with positions; assert it returns the workout id; assert it throws on an insert error.

**D) Component smoke test** — pick ONE simple component (e.g. `src/components/PlaceholderScreen.tsx`) and render it with `@testing-library/react-native`, asserting expected text renders. If a component needs the auth/supabase context, wrap or mock it. Keep this light — the logic tests above are the priority.

## 3. Verify
- `npm test` runs green. `npx tsc --noEmit` stays clean. Fix any config issues (common: `transformIgnorePatterns`, missing babel preset, react-test-renderer version mismatch).
- Do NOT change app behavior/features — this task is ONLY test infrastructure + tests (and minimal refactors ONLY if strictly needed to make a unit testable, e.g. exporting a pure function).

## 4. CI (lightweight)
- Add a GitHub Actions workflow `.github/workflows/ci.yml` that runs on push/PR: `npm ci`, `npx tsc --noEmit`, and `npm run test:ci`. Node 20+. Keep it simple and correct.

## Deliverable
Commit incrementally. Report: the test tooling installed, jest config approach, how many tests and what they cover, the `npm test` output summary (pass count), tsc clean confirmation, and that the CI workflow is added. Work only in ~/projects/gym-tracker-rn. Then git push to origin (the repo is github.com/omarjesusperezortiz/gym-tracker-rn).