# Practice Station — Spec

> Extends **Sketch Desk** (existing lessons, ghost guides, canvas, streak, localStorage). Nothing in this spec replaces current capabilities — it adds a new practice mode and a new library view alongside them.

## 1. Goal

Turn the phone into a **practice station**: a full-screen reference card on the table, screen kept awake, the user draws, then captures the attempt. Motivation comes from removing friction and from seeing your own progress — not from badges or points.

## 2. UX principles (non-negotiable)

- **One decision at a time.** The app picks the technique and duration; the user only decides *draw or not*.
- **No competing chrome.** No dashboard, no streak counter, no menu on the practice screen.
- **No gamification.** No badges, no points, no likes. The saved photo is the reward.
- **ADHD-safe.** Every extra choice is a trap — default everything, surface one action.
- **Visual thinkers first.** Show, don't tell. The card *is* the instruction.

## 3. New views

### 3.1 Practice Station (new view: `station`)

Full-screen card. Phone lies flat on the table.

| Element | Behavior |
| --- | --- |
| Reference image | Full-screen, faint, the only content on screen |
| Timer | Presets: 3 / 5 / 10 / 15 min. Default 5. Keeps screen awake (`Wake Lock` API, fallback: hidden video trick) |
| Begin | Single button. Starts timer + locks screen-on |
| Capture | Appears when timer ends (or manually). Saves a photo of the page to the attempt gallery |
| Exit | One tap, confirms discard or save |

**Hard rule:** no toolbar, no coach panel, no step dots, no ghost toggle while the station is active. Those live in the existing studio view.

### 3.2 Attempt gallery (new view: `attempts`)

- Grid of captured attempts, newest first.
- Each attempt links to: the technique it practiced, the reference card used, the source it came from.
- Side-by-side compare: attempt vs. reference (manual, no auto-scoring in MVP).

### 3.3 Inspiration library (new view: `sources`)

Organized by **technique**, not by source.

Each entry:

- `technique` tag (e.g. `hatching`, `lines`, `trees`)
- `title`, `url` (Instagram / X / YouTube / Domestika / Udemy / Udacity)
- `note` — one line of what you learned
- linked `practice attempts` it inspired
- linked existing `lesson` ids it maps to (e.g. Sofia's canal row → `amsterdam-row`)

A source can map to many techniques; a technique gathers all its sources and attempts in one place.

## 4. Data model (extends `sketch-desk-v1`)

Keep the existing store key. Add new keys; never rename or remove old ones.

```js
// existing (unchanged)
{ completed, lastLesson, streak, lastDay }

// new
attempts:   [{ id, technique, sourceId?, lessonId?, refUrl?, imageDataUrl, createdAt }]
sources:    [{ id, technique, title, url, note, lessonIds: [], attemptIds: [], createdAt }]
station:    { lastTechnique, lastDurationMin }  // for smart defaults
```

## 5. Integration with existing app

| Existing | How it connects |
| --- | --- |
| `LESSONS` / `PATHS` | Station cards can be generated from lesson steps (use the step's `guide` as the reference). New standalone cards (pure line drills) live in a new `cards.js`. |
| `GUIDES` | Reused as reference images for station cards. |
| Library view | Add a third entry point: **Practice** alongside Continue / Blank page. |
| Studio view | Unchanged. Station is a separate, minimal mode. |
| Streak | Station practice also calls `markPracticed()` so the streak stays honest. |
| Shortcuts | `S` opens Station from library; `Esc` exits. |

## 6. Build phases

### Phase 1 — The loop (MVP)
1. `cards.js` — 3–5 standalone reference cards (lines, hatching bands, cross-hatch density).
2. `station` view — full-screen card, timer presets, Wake Lock, capture button.
3. Capture → save to `attempts` → toast → back to library.
4. Entry point in library: **Practice** button.
5. `markPracticed()` on capture.

### Phase 2 — Library
6. `sources` store + `sources` view, grouped by technique.
7. Link a source to attempts and to existing `lesson` ids.
8. Attempt gallery with side-by-side compare.

### Phase 3 — Feedback
9. After capture, optional compare mode (attempt | reference).
10. No auto-scoring yet.

### Phase 4 — Expansion
11. More techniques; adaptive surfacing of weak areas (attempts revisited/deleted).
12. Time-lapse of a session's strokes (shareable card).

### Phase 5 — Social (last)
13. Shareable attempt cards.
14. Follow other learners. Only after the solo loop is addictive.

## 7. Out of scope (for now)

- Auto stroke scoring / ML analysis.
- Accounts, sync, backend.
- Notifications / reminders.
- Any change to the existing canvas, ghost guides, or lesson content.

## 8. Acceptance checks

- [ ] Station screen shows only the card + timer + one button.
- [ ] Screen stays awake for the full preset duration.
- [ ] Capture saves an image tied to a technique and (optionally) a source.
- [ ] Existing library, studio, lessons, streak all still work unchanged.
- [ ] No new dependencies beyond the Wake Lock API (with fallback).
