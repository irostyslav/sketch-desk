# Practice Station — Requirements Spec (v2)

> Extends **Sketch Desk**. Do not replace existing lessons, ghost guides, canvas, shortcuts, or streak. Add new views and data beside them.

Existing app files: `index.html`, `app.js`, `lessons.js`, `guides.js`, `styles.css`.
Store key: `sketch-desk-v1`. Keep existing keys (`completed`, `lastLesson`, `streak`, `lastDay`). Only add new keys.

---

## 0. UX principles

- One decision at a time. App picks technique + duration; user only chooses draw or not.
- No competing chrome on the practice screen.
- No badges, points, or likes. The saved photo is the reward.
- ADHD-safe: extra choices are traps. Defaults over menus.
- Progressive disclosure: necessary info visible; history and sources collapsed unless the user opts in.
- Streak is a mirror, never a punishment. Missing a day does not scold.

---

## 1. Phase 1 — The loop (build this first)

### 1.1 New files

- `cards.js` — standalone practice cards (start with 4).
- `content/` directory of Markdown (see §6). App may hardcode cards.js first; Markdown is the long-term source of truth.

### 1.2 Practice cards (`cards.js`)

Each card:

```js
{
  id: "cross-hatch-bands",
  technique: "hatching",
  title: "Cross-hatch density",
  minutesDefault: 5,
  minutesPresets: [3, 5, 10, 15],
  guide: "value-bands",          // reuse GUIDES from guides.js when possible
  coach: "One sentence. What to do with the hand.",
  context: {                     // collapsed by default
    history: "Short paragraph.",
    artists: ["Albrecht Dürer", "Rembrandt"],
    world: "Where this shows up: engravings, comic inking, Japanese ink."
  }
}
```

Ship these four cards in Phase 1:
1. Lines that land (`guide: warmup-lines`, technique `lines`)
2. Curves (`guide: warmup-curves`, technique `lines`)
3. Value bands / hatching (`guide: value-bands`, technique `hatching`)
4. Cross-hatch density (new simple guide or reuse value-bands with denser prompt, technique `hatching`)

### 1.3 New view: `station`

Full-screen practice station. Phone on the table.

Visible in **Focus mode** (default):
- Reference / ghost guide, full bleed on the sheet
- Timer (countdown)
- One button: Begin → (while running) End early / Capture

Hidden unless History mode or user expands:
- Context field (history, artists, world)
- Coach sentence (optional; default hidden in Focus)

Hard rules while `station` is active:
- No library chrome, no streak counter, no step dots, no full studio toolbar.
- Optional tiny gear (appearance) in a corner. Tapping it must not start a drawing session.

Timer:
- Presets 3 / 5 / 10 / 15. Remember last duration in `state.station.lastDurationMin`.
- Keep screen awake for the duration: prefer `navigator.wakeLock.request('screen')`. Fallback: no-op + note in UI that the device may sleep.
- Gentle chime or toast when time ends. Do not navigate away automatically.

Capture:
- Button labeled Capture.
- Phase 1 implementation: export the current guide canvas as a reference PNG **and** prompt the user to take a photo via `<input type="file" accept="image/*" capture="environment">`. Store both (or just the user photo if camera denied) as an attempt.
- Guided overlay later (Phase 3): a frame that says “place the page here.” Not required in Phase 1.
- On capture, call existing `markPracticed()`.

Reset:
- One control: clear today’s in-progress station session without deleting saved attempts.

Exit:
- Confirm if a timer is running. Otherwise back to library.

### 1.4 Appearance gear

Persisted in store as:

```js
appearance: {
  mode: "focus" | "history",   // default "focus"
  showHistory: false,
  showArtists: false,
  showWorld: false,
  showCoach: false,
  dark: false
}
```

- Focus mode: force all supplemental flags off for the station surface.
- History mode: expand context by default.
- Individual flags still apply when not in Focus.
- Dark mode: invert paper/ink using existing palette (`--paper` ↔ `--ink` family). Do not introduce purple or neon.

### 1.5 Library entry

On the existing library hero, add a third action next to Open lesson / Blank page:

- Button: **Practice station**
- Opens `station` with last technique, or first unfinished card.

Keyboard: `S` from library opens station. `Esc` leaves station.

### 1.6 Attempts store

```js
attempts: [{
  id, cardId, technique, sourceId: null,
  lessonId: null,
  imageDataUrl,          // user photo or canvas snapshot
  createdAt,             // ISO
  durationMin
}]
```

Keep images in localStorage for Phase 1. If quota fails, store metadata only and toast “Photo too large — saved session without image.”

---

## 2. Phase 2 — Library + sources

### 2.1 View `sources`

Grouped **by technique**, not by platform.

```js
sources: [{
  id, technique, title, url, note,
  lessonIds: [],         // existing LESSONS ids this inspired
  attemptIds: [],
  createdAt
}]
```

UI:
- Flat list under technique headings (lines, hatching, trees, architecture).
- Add source: title, URL, one-line note, technique tag.
- Link a source to attempts and to existing lesson ids when obvious (e.g. Sofia canal → `amsterdam-row`).

### 2.2 View `attempts`

- Grid, newest first.
- Tap: side-by-side attempt | reference (manual compare, no scoring).
- Filter by technique.

---

## 3. Phase 3 — Feedback + capture frame

- After capture, optional compare screen before returning to library.
- Guided capture frame overlay (“fill this rectangle with the page”).
- Still no ML / auto scoring.

---

## 4. Phase 4 — Skill tree + adaptive

### 4.1 View `roadmap`

Skill tree, not a locked syllabus.

Nodes = techniques (and later individual cards). Edges = suggested prerequisites, **not gates**. User may tap any node and practice it immediately.

Zoom:
- Overview: all techniques.
- Detail: cards inside a technique.

Completed nodes use the existing sienna/sage language from `styles.css`. Remember last focused node.

Starting mid-tree and drawing badly is intended. Do not block advanced cards.

### 4.2 Adaptive (light)

If the user revisits or deletes attempts in one technique more than others, surface that technique first on the station default. No scores. No “you are weak at X” copy.

---

## 5. Phase 5 — Profile heatmap

### 5.1 View `profile`

Monthly calendar, GitHub-contribution style.

Per day:
- Empty = no practice
- Fill green (sage, not neon) = practiced (`markPracticed` or any attempt that day)
- Inner dot/ring = at least one captured image that day
- Darker fill = longer total minutes that day

Tap a day → list that day’s attempts.

Copy must stay neutral. No “you broke your streak.”
If last practice was >1 day ago, library may show: “Pick up where you left off” + last card title. That is the only nudge.

---

## 6. Data layer (GitHub Markdown)

Long-term source of truth for *content* (not user attempts):

```
content/
  techniques/
    hatching.md
    lines.md
    trees.md
    architecture.md
  sources/
    durer-melencolia.md
    …
```

Technique file shape:

```md
---
id: hatching
title: Hatching & cross-hatching
prereq: [lines]
---

## Coach
Change spacing, not pressure, to get darker.

## History
…

## Artists
- Albrecht Dürer
- Rembrandt

## World
Engraving, etching, manga screentone cousins, comic inking.
```

Phase 1 may keep this content inside `cards.js`. Phase 2+ should read `content/` if fetchable (same origin on GitHub Pages). User notes and attempts stay in localStorage; they are not committed automatically.

GitHub Pages already can host the static app. Do not add a backend.

Portability: user owns the repo. Attempts export (JSON + images zip) is Phase 4/5, not Phase 1.

Offline: service worker is optional and **not** Phase 1. Phase 1 must work when opened as static files (`python3 -m http.server`) with no network except the Google Fonts already in `index.html`. Prefer bundling or system fonts if fonts block first paint; do not make practice depend on the network.

---

## 7. Phase order (do not skip ahead)

1. Station view + cards.js + timer + wake lock + capture + library button + appearance gear + dark mode + persist new store keys.
2. Sources view + attempts gallery + compare.
3. Capture frame + post-capture compare.
4. Roadmap skill tree + light adaptive default.
5. Profile heatmap + optional JSON export of attempts metadata.

Social, time-lapse, accounts, notifications: out of scope.

---

## 8. Integration map

| Existing | Change |
| --- | --- |
| `renderLibrary` | Add Practice station button; optional quiet “pick up” line |
| `renderStudio` | Unchanged |
| `LESSONS` / `GUIDES` | Reuse guides for cards |
| `markPracticed` | Call from station capture |
| `STORE` | Add `attempts`, `sources`, `appearance`, `station` |
| CSS variables | Reuse; add `.station`, `.heatmap`, `.roadmap` |

---

## 9. Acceptance (Phase 1)

- [ ] Existing library, studio, lessons, ghost, streak still work.
- [ ] Station shows reference + timer + one primary button in Focus mode.
- [ ] Gear switches Focus / History; History reveals collapsed context.
- [ ] Timer presets work; last duration remembered.
- [ ] Wake Lock requested when supported.
- [ ] Capture writes an attempt and ticks streak.
- [ ] No new npm build step. Still static files.
- [ ] Visual language matches current paper / ink / sienna / sage. No gamification UI.

---

## 10. Out of scope

- Points, badges, leaderboards, push notifications.
- Login / cloud accounts.
- Rehosting Instagram or YouTube media.
- Auto stroke scoring.
- Accessibility pass (VoiceOver, captions) — deferred, do not block Phase 1.
