# TASK: Build Gym Trainer — React Native + Expo (Phase 0 → Phase 1)

You are working in `~/projects/gym-tracker-rn` — a fresh Expo app (SDK 57, Expo Router tabs template, TypeScript). Foundation is already in place. Read the blueprint at `~/projects/gym-tracker-src/RN_BLUEPRINT.md` for full context and the phased plan. IMPORTANT: Expo has changed — read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing Expo-specific code (see AGENTS.md).

## Already done (do NOT redo)
- Expo tabs template scaffolded, TypeScript, `npx tsc --noEmit` passes.
- `src/data/catalog.ts` — the full static catalog (3 plans: gym/cal/travel, 30 sessions, 171 slots, 147 variations, exercise image URLs + cues), typed as `Catalog`. This is the SAME data as the web app.
- `src/types.ts` — Catalog, Plan, Session, Variation, Kind, WorkoutEntry, LoggedSlot, LoggedSet, Recommendation types.
- `src/lib/supabase.ts` — configured Supabase client (publishable key, AsyncStorage session persistence). Backend tables already exist: workouts, workout_slots, workout_sets, recommendations — all with Row-Level Security (each row scoped to auth.uid()).
- Deps installed: @supabase/supabase-js, @react-native-async-storage/async-storage, react-native-url-polyfill.

## Reference app (feature parity target)
The existing web app source is at `~/projects/gym-tracker-src/` (index.html, app.js ~750 lines, styles.css). It is the behavior spec — match its features and dark, Linear-inspired look (near-black bg #0a0b0e, lime accent #c6f24e, Inter font). Read app.js to understand the exact training/logging/calendar logic. Reuse the SAME data shapes so the two stay compatible.

## Phase 0 — prove it runs (do first)
1. Set up the tab navigation: **Today · Home · Calendar · Progress · Meals** (Expo Router). Dark theme.
2. **Auth gate:** on launch, if no Supabase session, show a Sign-in screen (email magic-link OR email+password — pick email+password for simplicity now; we'll add Sign in with Apple later). Use `supabase.auth`. Persist session (already configured). Show the app only when authed; a Sign out in Settings.
3. **Home (Dashboard):** read `catalog` from src/data/catalog.ts. Plan picker (Gym/Calisthenics/Travel chips). For the selected plan, list its sessions grouped by `group` ("⚡ Quick picks" = broad, "🎯 Focused" = focused), each row showing emoji + name + muscles + exercise count. Tapping a session navigates to the Train screen.
4. Confirm it runs: `npx expo start` (Expo Go on device) and `npx expo start --web`. Run `npx tsc --noEmit` clean.

## Phase 1 — core training loop
5. **Train screen** for a chosen plan+session: render each slot as a card with:
   - Exercise name + scheme (e.g. "4 × 8–10"); a 💪 Force toggle if the slot has a force scheme.
   - **Equipment switcher** (segmented control) over the variation kinds present for that slot (bar/cable/machine/db/bw → labels Barbell/Cable/Machine/Dumbbell/Bodyweight). Switching shows that variation's name, cue, and the two images (Start/Finish). Keep entered set values when switching (don't wipe).
   - **Set rows**: weight×reps inputs for weighted kinds; reps-only for bodyweight (kind 'bw'); seconds for time-based schemes (scheme contains 's', e.g. "3 × 40–60s"). "+ Add set". A done checkmark per exercise.
   - **"Last time" hint** per set: most recent logged numbers for that exercise GLOBALLY (any session/plan), preferring same kind. Pull from Supabase history.
   - Image tap → fullscreen zoom.
6. **Save (draft)** and **Finish** buttons. Finish writes the workout to Supabase: insert into `workouts` (date, plan, sess, name, type='workout'), then `workout_slots` (with position, kind, done, force), then `workout_sets` (position, weight, reps). Draft = persist in-progress state locally (AsyncStorage) so it survives app restarts; restore on return.
7. After finishing, return Home.

## Data mapping (Supabase)
- workouts: id(uuid), user_id(auto via RLS/auth), client_id(bigint, optional), date(timestamptz), plan, sess, name, type.
- workout_slots: workout_id, position, slot, kind, done, force.
- workout_sets: slot_id, position, weight(text), reps(text).
- Read history for "last time": join workouts→slots→sets for this user, ordered by date desc.

## Constraints
- Keep it TypeScript-clean (`npx tsc --noEmit` must pass).
- Do NOT hardcode secrets beyond the publishable key already in src/lib/supabase.ts (that key is safe).
- Commit incrementally with clear messages. Work only in ~/projects/gym-tracker-rn.
- Match data shapes to the web app so history stays compatible.

## Deliverable
- App runs on web and Expo Go, auth works (sign up/in/out), Home lists real catalog sessions, Train screen logs a workout that lands in Supabase (verify by reading it back). Report: what screens/files you created, how to run it (`npx expo start`), and confirm tsc is clean + a workout round-trips to Supabase.
- Do NOT attempt EAS builds / App Store / native modules yet (that's a later phase). Expo Go + web only for now.