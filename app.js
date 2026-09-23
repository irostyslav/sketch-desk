(() => {
  const STORE = "sketch-desk-v1";
  const state = {
    view: "library",
    lessonId: null,
    step: 0,
    tool: "pen",
    size: 2.4,
    ghost: true,
    ghostOpacity: 0.9,
    completed: {},
    lastLesson: null,
    streak: 0,
    lastDay: null,
    free: false,
    coachOpen: true,
    dailyDone: null,
    timerEnd: 0,
    timerMinutes: 0,
    attempts: [],
    sources: [],
    appearance: {
      mode: "focus",
      showHistory: false,
      showArtists: false,
      showWorld: false,
      showCoach: false,
      dark: false
    },
    station: {
      lastDurationMin: 5,
      lastCardId: null,
      focusId: "",
      touch: {}
    },
    attemptFilter: "all",
    compareId: null,
    days: {},
    profileMonth: "",
    profileDay: ""
  };

  const TECHNIQUES = [
    { id: "lines", title: "Lines" },
    { id: "hatching", title: "Hatching" },
    { id: "trees", title: "Trees" },
    { id: "architecture", title: "Architecture" }
  ];
  const OBVIOUS_LESSONS = {
    lines: ["lines"],
    hatching: ["hatching"],
    trees: ["tree-skeleton"],
    architecture: ["shop-block"]
  };

  let inkMemory = { strokes: [], redo: [] };
  let pad = null;
  let app = null;
  let started = false;
  let timerHandle = 0;
  let galleryUrls = [];
  let toastTimer = 0;
  let watchToken = 0;
  let watchTimer = 0;
  let watchRaf = 0;
  let watchObserver = null;
  let watchPlay = false;
  let stationPhase = "idle";
  let stationEndsAt = 0;
  let stationCardId = null;
  let stationClock = 0;
  let stationObserver = null;
  let wakeSentinel = null;
  let wakeNote = "";
  let captureWait = false;
  const book = { techniques: [], sources: [], ready: false, loading: false, missing: false };

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function dayNumber(key) {
    const parts = String(key || "").split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => !n)) return null;
    return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u003c")
      .replace(/>/g, "\u003e")
      .replace(/"/g, "\u0026quot;");
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || "{}");
      state.completed = raw.completed || {};
      state.lastLesson = raw.lastLesson || null;
      state.streak = raw.streak || 0;
      state.lastDay = raw.lastDay || null;
      state.dailyDone = raw.dailyDone || null;
      if (typeof raw.ghostOpacity === "number") state.ghostOpacity = clamp(raw.ghostOpacity, 0.15, 1);
      state.attempts = Array.isArray(raw.attempts) ? raw.attempts : [];
      state.sources = Array.isArray(raw.sources) ? raw.sources : [];
      if (raw.appearance && typeof raw.appearance === "object") {
        state.appearance = Object.assign({}, state.appearance, raw.appearance);
        if (state.appearance.mode !== "history") state.appearance.mode = "focus";
      }
      if (raw.station && typeof raw.station === "object") {
        const mins = Number(raw.station.lastDurationMin);
        if ([3, 5, 10, 15].indexOf(mins) !== -1) state.station.lastDurationMin = mins;
        if (raw.station.lastCardId) state.station.lastCardId = raw.station.lastCardId;
        if (TECHNIQUES.some((t) => t.id === raw.station.focusId)) state.station.focusId = raw.station.focusId;
        if (raw.station.touch && typeof raw.station.touch === "object") {
          const touch = {};
          TECHNIQUES.forEach((t) => {
            const n = Number(raw.station.touch[t.id]);
            if (n > 0) touch[t.id] = n;
          });
          state.station.touch = touch;
        }
      }
      state.days = {};
      if (raw.days && typeof raw.days === "object") {
        Object.keys(raw.days).forEach((key) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
          const day = raw.days[key] || {};
          state.days[key] = {
            minutes: Math.max(0, Number(day.minutes) || 0),
            image: !!day.image
          };
        });
      }
      state.attempts.forEach((attempt) => {
        const key = String(attempt.createdAt || "").slice(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
        if (!state.days[key]) {
          state.days[key] = {
            minutes: Math.max(0, Number(attempt.durationMin) || 0),
            image: !!attempt.imageDataUrl
          };
        } else if (attempt.imageDataUrl) state.days[key].image = true;
      });
      if (state.lastDay && /^\d{4}-\d{2}-\d{2}$/.test(state.lastDay) && !state.days[state.lastDay]) {
        state.days[state.lastDay] = { minutes: 0, image: false };
      }
    } catch (_) {}
    applyAppearance();
    tickStreak();
  }
  function save() {
    const payload = () => ({
      completed: state.completed,
      lastLesson: state.lastLesson,
      streak: state.streak,
      lastDay: state.lastDay,
      dailyDone: state.dailyDone,
      ghostOpacity: state.ghostOpacity,
      attempts: state.attempts,
      sources: state.sources,
      appearance: state.appearance,
      station: {
        lastDurationMin: state.station.lastDurationMin,
        lastCardId: state.station.lastCardId,
        focusId: state.station.focusId || "",
        touch: state.station.touch || {}
      },
      days: state.days
    });
    try {
      localStorage.setItem(STORE, JSON.stringify(payload()));
      return true;
    } catch (_) {
      state.attempts = state.attempts.map((a) => Object.assign({}, a, { imageDataUrl: "", referenceDataUrl: "" }));
      try { localStorage.setItem(STORE, JSON.stringify(payload())); } catch (__) {}
      return false;
    }
  }
  function tickStreak() {
    const t = todayKey();
    if (!state.lastDay || state.lastDay === t) return;
    const gap = dayNumber(t) - dayNumber(state.lastDay);
    if (gap > 1) state.streak = 0;
  }
  function noteDay(key, minutes, image) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
    const prev = state.days[key] || { minutes: 0, image: false };
    state.days[key] = {
      minutes: prev.minutes + (Number(minutes) || 0),
      image: prev.image || !!image
    };
  }
  function markPracticed() {
    const t = todayKey();
    noteDay(t, 0, false);
    if (state.lastDay === t) {
      save();
      return;
    }
    const prev = state.lastDay ? dayNumber(t) - dayNumber(state.lastDay) : 99;
    state.streak = prev === 1 ? state.streak + 1 : 1;
    state.lastDay = t;
    save();
  }
  function doneCount() {
    return Object.values(state.completed).filter(Boolean).length;
  }
  function currentLesson() {
    return LESSONS.find((l) => l.id === state.lessonId) || null;
  }
  function dailyLesson() {
    const key = todayKey();
    let n = 2166136261;
    for (let i = 0; i < key.length; i++) n = Math.imul(n ^ key.charCodeAt(i), 16777619);
    return LESSONS[Math.abs(n) % LESSONS.length];
  }
  function dailyIsDone() {
    return state.dailyDone === `${todayKey()}:${dailyLesson().id}`;
  }
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function currentGuide(force) {
    if (state.free) return null;
    if (!force && !state.ghost) return null;
    const lesson = currentLesson();
    const step = lesson && lesson.steps[state.step];
    if (!step) return null;
    const fn = GUIDES[step.guide];
    return typeof fn === "function" ? fn : null;
  }

  function render() {
    stopWatch();
    if (state.view !== "station") releaseStation();
    if (state.view === "library") renderLibrary();
    else if (state.view === "read") renderRead();
    else if (state.view === "watch") renderWatch();
    else if (state.view === "station") renderStation();
    else if (state.view === "sources") renderSources();
    else if (state.view === "attempts") renderAttempts();
    else if (state.view === "roadmap") renderRoadmap();
    else if (state.view === "profile") renderProfile();
    else renderStudio();
  }

  function renderLibrary() {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    const next = LESSONS.find((l) => l.id === state.lastLesson) || LESSONS.find((l) => !state.completed[l.id]) || LESSONS[0];
    const daily = dailyLesson();
    const dailyDone = dailyIsDone();
    app.innerHTML = `
      <div class="library">
        <div class="topbar">
          <div>
            <h1 class="brand">Sketch <span>Desk</span></h1>
            <p class="lede">A workbook for learning to draw. Read the idea, watch the pen, then draw it yourself.</p>
          </div>
          <div class="stats">
            <div class="stat">Streak <b>${state.streak} day${state.streak === 1 ? "" : "s"}</b></div>
            <div class="stat">Lessons <b>${doneCount()} / ${LESSONS.length}</b></div>
          </div>
        </div>
        <div class="hero">
          <div class="card continue">
            <p class="eyebrow">${state.completed[next.id] ? "Practice again" : "Continue"}</p>
            <h2>${esc(next.title)}</h2>
            <p>${esc(next.blurb)}</p>
            <div class="actions">
              <button class="btn btn-ink" type="button" id="open-station">Practice station</button>
              <button class="btn btn-ghost" data-read="${esc(next.id)}">Read</button>
              <button class="btn btn-ghost" data-watch="${esc(next.id)}">Watch</button>
              <button class="btn btn-ghost" data-open="${esc(next.id)}">Practice</button>
              <button class="btn btn-ghost" data-free="1">Blank page</button>
            </div>
          </div>
          <div class="card free-card">
            <div>
              <p class="eyebrow">${dailyDone ? "Today · practiced" : "Today’s exercise"}</p>
              <h3>${esc(daily.title)}</h3>
              <p>${esc(daily.blurb)}</p>
            </div>
            <div class="actions">
              <button class="btn btn-ink" data-watch="${esc(daily.id)}">Watch</button>
              <button class="btn btn-ghost" data-read="${esc(daily.id)}">Read</button>
            </div>
          </div>
        </div>
        ${pickupHtml()}
        <div class="howto">
          <div><p class="eyebrow">Read</p><p>The technique, when you want the words.</p></div>
          <div><p class="eyebrow">Watch</p><p>The pen on the paper, and the thinking behind each mark.</p></div>
          <div><p class="eyebrow">Practice</p><p>Your turn. Then try it with the example hidden.</p></div>
        </div>
        <div class="desk-links">
          <button class="btn btn-ghost" type="button" id="open-sources">Sources</button>
          <button class="btn btn-ghost" type="button" id="open-attempts">Attempts${state.attempts.length ? ` · ${state.attempts.length}` : ""}</button>
          <button class="btn btn-ghost" type="button" id="open-roadmap">Roadmap</button>
          <button class="btn btn-ghost" type="button" id="open-profile">Profile</button>
        </div>
        <div class="gallery-head"><h2>Your pages</h2><p>Exercises you kept on this device</p></div>
        <div id="gallery-mount"><p class="empty-pages">Loading pages…</p></div>
        ${PATHS.map((p) => {
          const items = LESSONS.filter((l) => l.path === p.id);
          return `<div class="path-head"><h2>${esc(p.title)}</h2><p>${esc(p.blurb)}</p></div>
            <ol class="toc">${items.map((l) => `
              <li class="toc-row">
                <span class="chap">${esc(l.chapter || "")}</span>
                <div class="toc-copy">
                  <h3>${esc(l.title)}</h3>
                  <p>${esc(l.technique || l.blurb)}</p>
                </div>
                <div class="toc-actions">
                  <button class="btn btn-ghost" type="button" data-read="${esc(l.id)}">Read</button>
                  <button class="btn btn-ink" type="button" data-watch="${esc(l.id)}">Watch</button>
                  <button class="btn btn-ghost" type="button" data-open="${esc(l.id)}">Practice</button>
                </div>
              </li>`).join("")}</ol>`;
        }).join("")}
        <p class="footnote">Use it as a reference. Read a chapter again whenever the hand gets ahead of the idea. Tree and shop-house chapters follow the public method from Hariz Razif’s architectural sketch posts: structure, then masses, then value, then people. Fill a page follows the page-of-studies method associated with Mallery Jane. Design logic follows construction tactics associated with Tommy Hoppe: a trigger line, circles and straights, a line that does two jobs. The examples are drawn by this workbook, not traced from their pictures. This is a practice companion, not their product.</p>
      </div>`;
    app.querySelectorAll("[data-open]").forEach((el) => {
      el.onclick = () => openLesson(el.dataset.open, { test: false });
    });
    app.querySelectorAll("[data-read]").forEach((el) => {
      el.onclick = () => openRead(el.dataset.read);
    });
    app.querySelectorAll("[data-watch]").forEach((el) => {
      el.onclick = () => openWatch(el.dataset.watch);
    });
    app.querySelectorAll("[data-test]").forEach((el) => {
      el.onclick = () => openLesson(el.dataset.test, { test: true });
    });
    const free = app.querySelector("[data-free]");
    if (free) free.onclick = () => openFree();
    const stationBtn = document.getElementById("open-station");
    if (stationBtn) stationBtn.onclick = () => openStation();
    const sourcesBtn = document.getElementById("open-sources");
    if (sourcesBtn) sourcesBtn.onclick = () => openSources();
    const attemptsBtn = document.getElementById("open-attempts");
    if (attemptsBtn) attemptsBtn.onclick = () => openAttempts();
    const roadmapBtn = document.getElementById("open-roadmap");
    if (roadmapBtn) roadmapBtn.onclick = () => openRoadmap();
    const profileBtn = document.getElementById("open-profile");
    if (profileBtn) profileBtn.onclick = () => openProfile();
    paintGallery();
  }

  function openLesson(id, opts) {
    opts = opts || {};
    const same = state.lessonId === id;
    state.view = "studio";
    state.free = false;
    state.lessonId = id;
    if (!(opts.keepStep && same)) state.step = 0;
    state.lastLesson = id;
    if (opts.test) state.ghost = false;
    if (!(opts.keepInk && same)) inkMemory = { strokes: [], redo: [] };
    save();
    renderStudio();
  }
  function openRead(id) {
    const same = state.lessonId === id && state.view === "studio";
    if (same && pad) inkMemory = { strokes: pad.strokes, redo: pad.redoStack };
    state.resumeInk = Boolean(same && pad);
    if (!same) {
      state.step = 0;
      state.resumeInk = false;
    }
    state.view = "read";
    state.free = false;
    state.lessonId = id;
    state.lastLesson = id;
    save();
    render();
  }
  function openWatch(id) {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    watchPlay = false;
    state.view = "watch";
    state.free = false;
    state.lessonId = id;
    state.step = 0;
    state.lastLesson = id;
    state.resumeInk = false;
    save();
    render();
  }
  function openFree() {
    state.view = "studio";
    state.free = true;
    state.lessonId = null;
    state.step = 0;
    inkMemory = { strokes: [], redo: [] };
    renderStudio();
  }
  function showLibrary() {
    state.view = "library";
    state.resumeInk = false;
    state.compareId = null;
    render();
  }

  function uid() {
    return (window.crypto && crypto.randomUUID && crypto.randomUUID()) || String(Date.now());
  }
  function safeUrl(url) {
    const value = String(url || "").trim();
    return /^https?:\/\//i.test(value) ? value : "";
  }
  function firstLine(text) {
    const line = String(text || "").split("\n").map((s) => s.trim()).filter(Boolean)[0] || "";
    return line.replace(/^[-*]\s+/, "");
  }
  function listItems(text) {
    return String(text || "").split("\n").map((s) => s.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
  }
  function parseMd(text) {
    const clean = String(text || "").replace(/^\uFEFF/, "");
    const match = clean.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    const meta = {};
    let body = clean;
    if (match) {
      body = match[2];
      match[1].split(/\r?\n/).forEach((line) => {
        const cut = line.indexOf(":");
        if (cut === -1) return;
        const key = line.slice(0, cut).trim();
        const raw = line.slice(cut + 1).trim();
        if (raw.charAt(0) === "[" && raw.charAt(raw.length - 1) === "]") {
          meta[key] = raw.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
        } else {
          meta[key] = raw.replace(/^["']|["']$/g, "");
        }
      });
    }
    const sections = {};
    let intro = "";
    let current = "";
    body.split(/\r?\n/).forEach((line) => {
      const heading = line.match(/^##\s+(.+)\s*$/);
      if (heading) {
        current = heading[1].trim().toLowerCase();
        sections[current] = "";
        return;
      }
      if (!current) intro += (intro ? "\n" : "") + line;
      else sections[current] += (sections[current] ? "\n" : "") + line;
    });
    Object.keys(sections).forEach((key) => {
      sections[key] = sections[key].trim();
    });
    return { meta, sections, intro: intro.trim() };
  }
  function sketchBase() {
    const nodes = document.getElementsByTagName("script");
    for (let i = nodes.length - 1; i >= 0; i--) {
      const src = nodes[i].getAttribute("src") || "";
      if (/app\.js(\?|$)/.test(src)) {
        try { return new URL(".", nodes[i].src).href; } catch (_) { return ""; }
      }
    }
    return "";
  }
  function loadBook() {
    if (book.ready || book.loading) return Promise.resolve();
    book.loading = true;
    const base = sketchBase();
    const finish = () => {
      book.ready = true;
      book.loading = false;
      if (state.view !== "sources" && state.view !== "attempts") return;
      const form = document.getElementById("source-form");
      if (!form || form.hidden) render();
    };
    return fetch(base + "content/index.json")
      .then((res) => {
        if (!res.ok) throw new Error("missing");
        return res.json();
      })
      .then((index) => {
        const techIds = Array.isArray(index.techniques) ? index.techniques : [];
        const sourceIds = Array.isArray(index.sources) ? index.sources : [];
        const techJobs = techIds.map((id) => fetch(base + "content/techniques/" + id + ".md").then((res) => {
          if (!res.ok) return null;
          return res.text().then((text) => {
            const parsed = parseMd(text);
            return {
              id: parsed.meta.id || id,
              title: parsed.meta.title || id,
              prereq: parsed.meta.prereq || [],
              coach: firstLine(parsed.sections.coach),
              history: parsed.sections.history || "",
              artists: listItems(parsed.sections.artists),
              world: firstLine(parsed.sections.world)
            };
          });
        }));
        const sourceJobs = sourceIds.map((id) => fetch(base + "content/sources/" + id + ".md").then((res) => {
          if (!res.ok) return null;
          return res.text().then((text) => {
            const parsed = parseMd(text);
            return {
              id: parsed.meta.id || id,
              technique: parsed.meta.technique || "",
              title: parsed.meta.title || id,
              url: safeUrl(parsed.meta.url),
              note: firstLine(parsed.sections.note || parsed.intro),
              lessonIds: parsed.meta.lessonIds || [],
              fromBook: true,
              createdAt: ""
            };
          });
        }));
        return Promise.all([Promise.all(techJobs), Promise.all(sourceJobs)]);
      })
      .then((parts) => {
        book.techniques = parts[0].filter(Boolean);
        book.sources = parts[1].filter(Boolean);
        book.missing = false;
        finish();
      })
      .catch(() => {
        book.missing = true;
        finish();
      });
  }
  function techniqueMeta(id) {
    return book.techniques.find((t) => t.id === id) || TECHNIQUES.find((t) => t.id === id) || { id: id, title: id };
  }
  function lessonsForTechnique(technique) {
    if (technique === "lines") return LESSONS.filter((l) => l.id === "lines");
    if (technique === "hatching") return LESSONS.filter((l) => l.id === "hatching");
    if (technique === "trees") return LESSONS.filter((l) => l.path === "trees");
    if (technique === "architecture") return LESSONS.filter((l) => l.path === "architecture");
    return [];
  }
  function allSources() {
    const mine = state.sources.map((s) => Object.assign({ fromBook: false }, s));
    const known = {};
    mine.forEach((s) => { known[s.id] = true; });
    const theirs = book.sources.filter((s) => !known[s.id]);
    return theirs.concat(mine);
  }
  function sourcesFor(technique) {
    return allSources().filter((s) => s.technique === technique).sort((a, b) => {
      if (!!a.fromBook !== !!b.fromBook) return a.fromBook ? -1 : 1;
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    });
  }
  function attemptsForSource(sourceId) {
    return state.attempts.filter((a) => a.sourceId === sourceId);
  }
  function findSource(id) {
    return allSources().find((s) => s.id === id) || null;
  }
  function cardById(id) {
    const cards = typeof CARDS === "undefined" ? [] : CARDS;
    return cards.find((c) => c.id === id) || null;
  }
  function shortWhen(iso) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getMonth()] + " " + d.getDate();
  }
  function setAttemptSource(attemptId, sourceId) {
    const attempt = state.attempts.find((a) => a.id === attemptId);
    if (!attempt) return;
    state.sources.forEach((s) => {
      s.attemptIds = (s.attemptIds || []).filter((id) => id !== attemptId);
    });
    attempt.sourceId = sourceId || null;
    const source = state.sources.find((s) => s.id === sourceId);
    if (source) {
      source.attemptIds = source.attemptIds || [];
      if (source.attemptIds.indexOf(attemptId) === -1) source.attemptIds.push(attemptId);
    }
    save();
  }
  function noteTouch(technique) {
    if (!TECHNIQUES.some((t) => t.id === technique)) return;
    if (!state.station.touch) state.station.touch = {};
    state.station.touch[technique] = (state.station.touch[technique] || 0) + 1;
  }
  function deleteAttempt(id) {
    const gone = state.attempts.find((a) => a.id === id);
    if (gone) noteTouch(gone.technique);
    state.attempts = state.attempts.filter((a) => a.id !== id);
    state.sources.forEach((s) => {
      s.attemptIds = (s.attemptIds || []).filter((aid) => aid !== id);
    });
    if (state.compareId === id) state.compareId = null;
    save();
    render();
  }
  function deleteSource(id) {
    state.sources = state.sources.filter((s) => s.id !== id);
    state.attempts.forEach((a) => {
      if (a.sourceId === id) a.sourceId = null;
    });
    save();
    render();
  }
  function openSources() {
    state.view = "sources";
    state.compareId = null;
    render();
    loadBook();
  }
  function openAttempts() {
    state.view = "attempts";
    state.compareId = null;
    render();
    loadBook();
  }
  function openRoadmap() {
    state.view = "roadmap";
    render();
    loadBook();
  }
  function prereqFor(id) {
    const meta = book.techniques.find((t) => t.id === id);
    if (meta && Array.isArray(meta.prereq)) return meta.prereq;
    if (id === "lines") return [];
    return ["lines"];
  }
  function cardsForTechnique(id) {
    return practiceCards().filter((c) => c.technique === id);
  }
  function techniqueDone(id) {
    const cards = cardsForTechnique(id);
    if (cards.length) return cards.every((c) => state.attempts.some((a) => a.cardId === c.id));
    const lessons = OBVIOUS_LESSONS[id] || [];
    return lessons.length > 0 && lessons.every((lid) => state.completed[lid]);
  }
  function leadingTechnique() {
    const touch = state.station.touch || {};
    let best = "";
    let bestN = 0;
    let tie = false;
    TECHNIQUES.forEach((t) => {
      const n = touch[t.id] || 0;
      if (n > bestN) {
        best = t.id;
        bestN = n;
        tie = false;
      } else if (n === bestN && n > 0) tie = true;
    });
    if (!best || tie) return "";
    return best;
  }
  function focusRoadmap(id) {
    state.station.focusId = id || "";
    save();
    render();
  }
  function practiceTechnique(id) {
    state.station.focusId = id;
    const cards = cardsForTechnique(id);
    if (!cards.length) {
      const lesson = (OBVIOUS_LESSONS[id] || [])[0];
      save();
      if (lesson) openLesson(lesson);
      return;
    }
    const fresh = cards.find((c) => !state.attempts.some((a) => a.cardId === c.id));
    openStation((fresh || cards[0]).id);
  }
  function renderRoadmap() {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    const focus = state.station.focusId;
    const focused = TECHNIQUES.some((t) => t.id === focus) ? focus : "";
    if (focused) {
      const meta = techniqueMeta(focused);
      const prereq = prereqFor(focused).map((id) => techniqueMeta(id).title || id);
      const cards = cardsForTechnique(focused);
      const lessons = lessonsForTechnique(focused);
      app.innerHTML = `
        <div class="library">
          <div class="record-head">
            <div>
              <button class="btn btn-ghost" type="button" id="roadmap-all">All techniques</button>
              <h1>${esc(meta.title || focused)}</h1>
              <p class="lede">${esc(meta.coach || "Start here, or anywhere else.")}</p>
              <p class="source-meta">${prereq.length ? `Suggested after ${esc(prereq.join(", "))}. Not required.` : "No suggested path. Start anywhere."}</p>
            </div>
            <button class="btn btn-ink" type="button" id="roadmap-practice">Practice</button>
          </div>
          ${cards.length ? `<div class="card-nodes">${cards.map((c) => `
            <button class="node ${state.attempts.some((a) => a.cardId === c.id) ? "done" : ""}" type="button" data-card="${esc(c.id)}">
              <b>${esc(c.title)}</b>
              <i>${state.attempts.some((a) => a.cardId === c.id) ? "Practiced" : esc(c.coach || "")}</i>
            </button>`).join("")}</div>` : `<p class="empty-pages">No station card yet. Open a lesson.</p>`}
          <div class="source-actions">${lessons.map((l) => `<button class="btn btn-ghost" type="button" data-open="${esc(l.id)}">${esc(l.title)}</button>`).join("")}</div>
        </div>`;
      document.getElementById("roadmap-all").onclick = () => focusRoadmap("");
      document.getElementById("roadmap-practice").onclick = () => practiceTechnique(focused);
      app.querySelectorAll("[data-card]").forEach((el) => {
        el.onclick = () => openStation(el.dataset.card);
      });
      app.querySelectorAll("[data-open]").forEach((el) => {
        el.onclick = () => openLesson(el.dataset.open, { test: false });
      });
      return;
    }
    const child = (id) => {
      const meta = techniqueMeta(id);
      return `<div class="node-wrap">
        <button class="node ${techniqueDone(id) ? "done" : ""}" type="button" data-tech="${id}">
          <b>${esc(meta.title || id)}</b>
          <i>${techniqueDone(id) ? "Practiced" : "Practice"}</i>
        </button>
        <button class="btn btn-ghost" type="button" data-zoom="${id}">Cards</button>
      </div>`;
    };
    app.innerHTML = `
      <div class="library">
        <div class="record-head">
          <div>
            <button class="btn btn-ghost" type="button" id="back">Contents</button>
            <h1>Roadmap</h1>
            <p class="lede">A path, not a lock. Tap a technique to practice it now. Cards shows the studies inside.</p>
          </div>
        </div>
        <div class="tree">
          ${child("lines")}
          <div class="tree-stem"></div>
          <div class="tree-branches">
            ${child("hatching")}
            ${child("trees")}
            ${child("architecture")}
          </div>
        </div>
        <p class="source-meta">Lines are a suggestion for the others. They are not required.</p>
      </div>`;
    document.getElementById("back").onclick = () => showLibrary();
    app.querySelectorAll("[data-tech]").forEach((el) => {
      el.onclick = () => practiceTechnique(el.dataset.tech);
    });
    app.querySelectorAll("[data-zoom]").forEach((el) => {
      el.onclick = () => focusRoadmap(el.dataset.zoom);
    });
  }
  function pickupHtml() {
    const keys = Object.keys(state.days || {});
    if (state.lastDay) keys.push(state.lastDay);
    let last = "";
    keys.forEach((key) => {
      if (key > last) last = key;
    });
    const gap = last ? dayNumber(todayKey()) - dayNumber(last) : 0;
    if (!last || !(gap > 1)) return "";
    const card = cardById(state.station.lastCardId);
    let title = card ? card.title : "";
    if (!title && state.lastLesson) {
      const lesson = LESSONS.find((l) => l.id === state.lastLesson);
      if (lesson) title = lesson.title;
    }
    return `<p class="pickup">Pick up where you left off${title ? ". " + esc(title) : "."}</p>`;
  }
  function heatLevel(day) {
    if (!day) return 0;
    const minutes = day.minutes || 0;
    if (minutes >= 30) return 3;
    if (minutes >= 10) return 2;
    return 1;
  }
  function monthLabel(key) {
    const parts = String(key || "").split("-").map(Number);
    const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (parts.length < 2 || !names[parts[1] - 1]) return "";
    return names[parts[1] - 1] + " " + parts[0];
  }
  function shiftMonth(key, delta) {
    const parts = String(key || "").split("-").map(Number);
    const date = new Date(parts[0], (parts[1] || 1) - 1 + delta, 1);
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
  }
  function attemptsOn(day) {
    return state.attempts.filter((a) => String(a.createdAt || "").slice(0, 10) === day);
  }
  function openProfile() {
    state.view = "profile";
    if (!state.profileMonth) state.profileMonth = todayKey().slice(0, 7);
    state.profileDay = "";
    render();
  }
  function exportAttempts() {
    const payload = {
      exportedAt: new Date().toISOString(),
      attempts: state.attempts.map((a) => ({
        id: a.id,
        cardId: a.cardId,
        technique: a.technique,
        sourceId: a.sourceId || null,
        lessonId: a.lessonId || null,
        createdAt: a.createdAt,
        durationMin: a.durationMin || 0,
        hasImage: !!a.imageDataUrl
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sketch-desk-attempts.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderProfile() {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    if (!state.profileMonth) state.profileMonth = todayKey().slice(0, 7);
    if (state.profileDay) {
      const rows = attemptsOn(state.profileDay);
      const marked = state.days[state.profileDay];
      app.innerHTML = `
        <div class="library">
          <div class="record-head">
            <div>
              <button class="btn btn-ghost" type="button" id="profile-back">Month</button>
              <h1>${esc(monthLabel(state.profileDay.slice(0, 7)))} ${esc(String(Number(state.profileDay.slice(8, 10))))}</h1>
              <p class="lede">${marked ? "Practiced." : "No practice."}${marked && marked.image ? " A photo was kept." : ""}</p>
            </div>
          </div>
          ${rows.length ? `<div class="attempt-grid">${rows.map((a) => {
            const card = cardById(a.cardId);
            return `<button class="attempt-tile" type="button" data-attempt="${esc(a.id)}">
              <span class="attempt-blank">${a.imageDataUrl ? "Photo" : "No photo"}</span>
              <span class="attempt-copy"><b>${esc(card ? card.title : "Attempt")}</b><i>${esc(String(a.durationMin || 0))} min</i></span>
            </button>`;
          }).join("")}</div>` : `<p class="empty-pages">${marked ? "Practiced this day. No photo was kept." : "Nothing on this day."}</p>`}
        </div>`;
      document.getElementById("profile-back").onclick = () => {
        state.profileDay = "";
        render();
      };
      app.querySelectorAll("[data-attempt]").forEach((el) => {
        el.onclick = () => {
          const row = state.attempts.find((a) => a.id === el.dataset.attempt);
          if (row) noteTouch(row.technique);
          state.view = "attempts";
          state.compareId = el.dataset.attempt;
          save();
          render();
        };
      });
      return;
    }
    const parts = state.profileMonth.split("-").map(Number);
    const first = new Date(parts[0], parts[1] - 1, 1);
    const blanks = first.getDay();
    const count = new Date(parts[0], parts[1], 0).getDate();
    const today = todayKey();
    const atCurrent = state.profileMonth >= today.slice(0, 7);
    let cells = "";
    for (let i = 0; i < blanks; i++) cells += `<span></span>`;
    for (let day = 1; day <= count; day++) {
      const key = state.profileMonth + "-" + String(day).padStart(2, "0");
      const info = state.days[key];
      const level = heatLevel(info);
      const future = key > today;
      cells += `<button class="heat l${level}${info && info.image ? " shot" : ""}" type="button" data-day="${key}" ${future ? "disabled" : ""}>${info && info.image ? `<span class="ring"></span>` : ""}</button>`;
    }
    app.innerHTML = `
      <div class="library">
        <div class="record-head">
          <div>
            <button class="btn btn-ghost" type="button" id="back">Contents</button>
            <h1>Profile</h1>
            <p class="lede">Days you practiced. A ring means a photo was kept.</p>
          </div>
          <button class="btn btn-ghost" type="button" id="export-attempts">Export</button>
        </div>
        <div class="month-bar">
          <button class="btn btn-ghost" type="button" id="month-prev">Previous</button>
          <h2>${esc(monthLabel(state.profileMonth))}</h2>
          <button class="btn btn-ghost" type="button" id="month-next" ${atCurrent ? "disabled" : ""}>Next</button>
        </div>
        <div class="heat-grid" aria-label="${esc(monthLabel(state.profileMonth))}">
          ${["S", "M", "T", "W", "T", "F", "S"].map((d) => `<span class="heat-label">${d}</span>`).join("")}
          ${cells}
        </div>
        <div class="heat-key">
          <span><i class="heat l0"></i> None</span>
          <span><i class="heat l1"></i> Practiced</span>
          <span><i class="heat l2"></i> Longer</span>
          <span><i class="heat l3"></i> Longest</span>
          <span><i class="heat l1 shot"><span class="ring"></span></i> Photo</span>
        </div>
      </div>`;
    document.getElementById("back").onclick = () => showLibrary();
    document.getElementById("export-attempts").onclick = () => exportAttempts();
    document.getElementById("month-prev").onclick = () => {
      state.profileMonth = shiftMonth(state.profileMonth, -1);
      render();
    };
    const next = document.getElementById("month-next");
    if (next) next.onclick = () => {
      if (state.profileMonth >= todayKey().slice(0, 7)) return;
      state.profileMonth = shiftMonth(state.profileMonth, 1);
      render();
    };
    app.querySelectorAll("[data-day]").forEach((el) => {
      el.onclick = () => {
        if (el.disabled || el.dataset.day > todayKey()) return;
        state.profileDay = el.dataset.day;
        render();
      };
    });
  }
  function lessonChecks(technique, selected) {
    const chosen = selected || OBVIOUS_LESSONS[technique] || [];
    const lessons = lessonsForTechnique(technique);
    if (!lessons.length) return "";
    return `<fieldset class="check-grid">
      <legend>Lessons</legend>
      ${lessons.map((l) => `<label class="check"><input type="checkbox" name="lesson" value="${esc(l.id)}" ${chosen.indexOf(l.id) !== -1 ? "checked" : ""} /> ${esc(l.title)}</label>`).join("")}
    </fieldset>`;
  }
  function attemptChecks(technique) {
    const rows = state.attempts.filter((a) => a.technique === technique && !a.sourceId).slice(0, 8);
    if (!rows.length) return "";
    return `<fieldset class="check-grid">
      <legend>Link attempts</legend>
      ${rows.map((a) => `<label class="check"><input type="checkbox" name="attempt" value="${esc(a.id)}" /> ${esc(cardById(a.cardId) ? cardById(a.cardId).title : "Attempt")} · ${esc(shortWhen(a.createdAt))}</label>`).join("")}
    </fieldset>`;
  }
  function fillSourceLinks(technique) {
    const lessons = document.getElementById("source-lessons");
    const attempts = document.getElementById("source-attempts");
    if (lessons) lessons.innerHTML = lessonChecks(technique);
    if (attempts) attempts.innerHTML = attemptChecks(technique);
  }
  function renderSources() {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    const groups = TECHNIQUES.map((tech) => {
      const meta = techniqueMeta(tech.id);
      const sources = sourcesFor(tech.id);
      const coach = meta.coach ? `<p class="technique-line">${esc(meta.coach)}</p>` : "";
      const artists = meta.artists && meta.artists.length ? `<p class="source-meta">${esc(meta.artists.join(", "))}</p>` : "";
      const cards = sources.length
        ? sources.map((s) => {
        const lessons = (s.lessonIds || []).filter((id) => LESSONS.some((l) => l.id === id));
        const attempts = attemptsForSource(s.id);
        const href = safeUrl(s.url);
        return `<article class="source-card">
          <p class="eyebrow">${s.fromBook ? "In the book" : "Yours"}</p>
          <h3>${href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>` : esc(s.title)}</h3>
          <p>${esc(s.note || "")}</p>
          <div class="source-actions">
            ${lessons.map((id) => `<button class="btn btn-ghost" type="button" data-read="${esc(id)}">${esc((LESSONS.find((l) => l.id === id) || {}).title || id)}</button>`).join("")}
            ${attempts.length ? `<span class="source-meta">${attempts.length} attempt${attempts.length === 1 ? "" : "s"}</span>` : ""}
            ${s.fromBook ? "" : `<button class="btn btn-ghost danger" type="button" data-delete-source="${esc(s.id)}">Remove</button>`}
          </div>
        </article>`;
        }).join("")
        : (book.ready ? `<p class="empty-pages">No sources under ${esc(tech.title.toLowerCase())} yet.</p>` : "");
      return `<section class="source-group"><h2>${esc(meta.title || tech.title)}</h2>${coach}${artists}${cards}</section>`;
    }).join("");
    app.innerHTML = `
      <div class="library">
        <div class="record-head">
          <div>
            <button class="btn btn-ghost" type="button" id="back">Contents</button>
            <h1>Sources</h1>
            <p class="lede">Links you can return to, grouped by the technique they teach.</p>
          </div>
          <button class="btn btn-ink" type="button" id="add-source">Add a source</button>
        </div>
        ${book.missing ? `<p class="empty-pages">The chapter notes did not load. Sources you add still stay on this device.</p>` : ""}
        <form class="source-form" id="source-form" hidden>
          <label>Title <input name="title" maxlength="80" required /></label>
          <label>URL <input name="url" type="url" inputmode="url" placeholder="https://" /></label>
          <label>What you learned <input name="note" maxlength="140" placeholder="One line" /></label>
          <label>Technique
            <select name="technique">
              ${TECHNIQUES.map((t) => `<option value="${t.id}">${esc(t.title)}</option>`).join("")}
            </select>
          </label>
          <div id="source-lessons"></div>
          <div id="source-attempts"></div>
          <div class="source-actions">
            <button class="btn btn-ink" type="submit">Save source</button>
            <button class="btn btn-ghost" type="button" id="cancel-source">Cancel</button>
          </div>
        </form>
        ${groups}
        <div class="toast" id="toast"></div>
      </div>`;
    document.getElementById("back").onclick = () => showLibrary();
    app.querySelectorAll("[data-read]").forEach((el) => {
      el.onclick = () => openRead(el.dataset.read);
    });
    const form = document.getElementById("source-form");
    const add = document.getElementById("add-source");
    add.onclick = () => {
      form.hidden = false;
      add.hidden = true;
      fillSourceLinks(form.technique.value);
      form.title.focus();
    };
    document.getElementById("cancel-source").onclick = () => {
      form.hidden = true;
      add.hidden = false;
      form.reset();
    };
    form.technique.onchange = () => fillSourceLinks(form.technique.value);
    form.onsubmit = (e) => {
      e.preventDefault();
      const title = form.title.value.trim();
      if (!title) return;
      const typed = form.url.value.trim();
      if (typed && !safeUrl(typed)) {
        toast("Use a full http or https link.");
        return;
      }
      const technique = form.technique.value;
      const lessonIds = Array.prototype.map.call(form.querySelectorAll("input[name=lesson]:checked"), (el) => el.value);
      const attemptIds = Array.prototype.map.call(form.querySelectorAll("input[name=attempt]:checked"), (el) => el.value);
      const source = {
        id: uid(),
        technique: technique,
        title: title,
        url: safeUrl(typed),
        note: form.note.value.trim(),
        lessonIds: lessonIds,
        attemptIds: attemptIds.slice(),
        createdAt: new Date().toISOString()
      };
      state.sources.unshift(source);
      attemptIds.forEach((id) => setAttemptSource(id, source.id));
      save();
      render();
      toast("Saved.");
    };
    app.querySelectorAll("[data-delete-source]").forEach((el) => {
      el.onclick = () => {
        if (el.dataset.armed !== "1") {
          el.dataset.armed = "1";
          el.textContent = "Remove this source?";
          return;
        }
        deleteSource(el.dataset.deleteSource);
      };
    });
  }
  function filteredAttempts() {
    const list = state.attempts.slice();
    if (state.attemptFilter === "all") return list;
    return list.filter((a) => a.technique === state.attemptFilter);
  }
  function paintCompareGuide() {
    const canvas = document.getElementById("compare-guide");
    const attempt = state.attempts.find((a) => a.id === state.compareId);
    if (!canvas || !attempt) return;
    const card = cardById(attempt.cardId);
    const guide = card && GUIDES[card.guide];
    const w = canvas.clientWidth || 320;
    const h = Math.round(w * 4 / 3);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#f3eee4";
    ctx.fillRect(0, 0, w, h);
    if (typeof guide === "function") guide(ctx, w, h);
  }
  function renderAttempts() {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    const attempt = state.compareId ? state.attempts.find((a) => a.id === state.compareId) : null;
    if (state.compareId && !attempt) state.compareId = null;
    if (attempt) {
      const card = cardById(attempt.cardId);
      const source = findSource(attempt.sourceId);
      const options = allSources().filter((s) => !attempt.technique || s.technique === attempt.technique);
      app.innerHTML = `
        <div class="library">
          <div class="record-head">
            <div>
              <button class="btn btn-ghost" type="button" id="back">Contents</button>
              <h1>${esc(card ? card.title : "Attempt")}</h1>
              <p class="lede">${esc(techniqueMeta(attempt.technique).title || attempt.technique)} · ${esc(String(attempt.durationMin || ""))} min · ${esc(shortWhen(attempt.createdAt))}</p>
            </div>
            <button class="btn btn-ghost" type="button" id="compare-back">All attempts</button>
          </div>
          <div class="compare-grid">
            <figure>
              ${attempt.imageDataUrl ? `<img id="compare-photo" alt="Your page" />` : `<p class="empty-pages">No photo for this session.</p>`}
              <figcaption>Your page</figcaption>
            </figure>
            <figure>
              ${attempt.referenceDataUrl ? `<img id="compare-ref" alt="Reference" />` : `<canvas id="compare-guide"></canvas>`}
              <figcaption>Reference</figcaption>
            </figure>
          </div>
          <label class="source-pick">Source
            <select id="attempt-source">
              <option value="">None</option>
              ${options.map((s) => `<option value="${esc(s.id)}" ${s.id === attempt.sourceId ? "selected" : ""}>${esc(s.title)}</option>`).join("")}
            </select>
          </label>
          ${source && (source.lessonIds || []).length ? `<div class="source-actions">${source.lessonIds.filter((id) => LESSONS.some((l) => l.id === id)).map((id) => `<button class="btn btn-ghost" type="button" data-read="${esc(id)}">${esc((LESSONS.find((l) => l.id === id) || {}).title || id)}</button>`).join("")}</div>` : ""}
          <button class="btn btn-ghost danger" type="button" id="delete-attempt">Delete</button>
          <div class="toast" id="toast"></div>
        </div>`;
      const photo = document.getElementById("compare-photo");
      if (photo) photo.src = attempt.imageDataUrl;
      const ref = document.getElementById("compare-ref");
      if (ref) ref.src = attempt.referenceDataUrl;
      else requestAnimationFrame(paintCompareGuide);
      document.getElementById("back").onclick = () => showLibrary();
      document.getElementById("compare-back").onclick = () => {
        state.compareId = null;
        render();
      };
      document.getElementById("attempt-source").onchange = (e) => {
        setAttemptSource(attempt.id, e.target.value);
        render();
      };
      document.getElementById("delete-attempt").onclick = (e) => {
        const btn = e.currentTarget;
        if (btn.dataset.armed !== "1") {
          btn.dataset.armed = "1";
          btn.textContent = "Delete this attempt?";
          return;
        }
        deleteAttempt(attempt.id);
      };
      app.querySelectorAll("[data-read]").forEach((el) => {
        el.onclick = () => openRead(el.dataset.read);
      });
      return;
    }
    const rows = filteredAttempts();
    app.innerHTML = `
      <div class="library">
        <div class="record-head">
          <div>
            <button class="btn btn-ghost" type="button" id="back">Contents</button>
            <h1>Attempts</h1>
            <p class="lede">Photos from the practice station, newest first. Nothing here is scored.</p>
          </div>
        </div>
        <div class="filters">
          <button class="chip ${state.attemptFilter === "all" ? "on" : ""}" type="button" data-filter="all">All</button>
          ${TECHNIQUES.map((t) => `<button class="chip ${state.attemptFilter === t.id ? "on" : ""}" type="button" data-filter="${t.id}">${esc(t.title)}</button>`).join("")}
        </div>
        ${rows.length ? `<div class="attempt-grid">${rows.map((a) => {
          const card = cardById(a.cardId);
          return `<button class="attempt-tile" type="button" data-attempt="${esc(a.id)}">
            ${a.imageDataUrl ? `<img alt="" data-thumb="${esc(a.id)}" />` : `<span class="attempt-blank">No photo</span>`}
            <span class="attempt-copy"><b>${esc(card ? card.title : "Attempt")}</b><i>${esc(shortWhen(a.createdAt))}</i></span>
          </button>`;
        }).join("")}</div>` : `<p class="empty-pages">Nothing captured yet. The station keeps a photo when you press Capture.</p>`}
        <div class="toast" id="toast"></div>
      </div>`;
    document.getElementById("back").onclick = () => showLibrary();
    app.querySelectorAll("[data-filter]").forEach((el) => {
      el.onclick = () => {
        state.attemptFilter = el.dataset.filter;
        render();
      };
    });
    app.querySelectorAll("[data-thumb]").forEach((img) => {
      const row = state.attempts.find((a) => a.id === img.dataset.thumb);
      if (row) img.src = row.imageDataUrl;
    });
    app.querySelectorAll("[data-attempt]").forEach((el) => {
      el.onclick = () => {
        const row = state.attempts.find((a) => a.id === el.dataset.attempt);
        if (row) noteTouch(row.technique);
        state.compareId = el.dataset.attempt;
        save();
        render();
      };
    });
  }

  function renderRead() {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    const lesson = currentLesson();
    if (!lesson) {
      showLibrary();
      return;
    }
    const step = lesson.steps[state.step];
    app.innerHTML = `
      <article class="reader">
        <div class="reader-bar">
          <button class="btn btn-ghost" id="back" type="button">Contents</button>
          <p class="eyebrow">Chapter ${esc(lesson.chapter)} · ${esc(lesson.level)}</p>
        </div>
        <h1>${esc(lesson.title)}</h1>
        <p class="technique-line">${esc(lesson.technique || "")}</p>
        <section class="reader-block">
          <h2>Technique</h2>
          <p>${esc(lesson.read || lesson.blurb)}</p>
        </section>
        <section class="reader-block">
          <h2>Example ${state.step + 1} of ${lesson.steps.length}</h2>
          <h3>${esc(step.title)}</h3>
          <p>${esc(step.example || step.hint)}</p>
          <div class="plate"><canvas id="plate"></canvas></div>
          <div class="example-nav">
            ${lesson.steps.map((s, i) => `<button type="button" class="chip ${i === state.step ? "on" : ""}" data-example="${i}">${esc(s.title)}</button>`).join("")}
          </div>
        </section>
        <section class="reader-block">
          <h2>Exercise</h2>
          <p>${esc(step.exercise || step.coach)}</p>
          <p class="hint">${esc(step.hint)}</p>
          <div class="actions">
            <button class="btn btn-ink" id="practice" type="button">Practice this exercise</button>
            <button class="btn btn-ghost" id="watch-from-read" type="button">Watch the pen</button>
            <button class="btn btn-ghost" id="practice-plain" type="button">Practice without the example</button>
          </div>
        </section>
      </article>`;
    document.getElementById("back").onclick = () => showLibrary();
    document.getElementById("practice").onclick = () => openLesson(lesson.id, { keepStep: true, keepInk: state.resumeInk });
    document.getElementById("watch-from-read").onclick = () => openWatch(lesson.id);
    document.getElementById("practice-plain").onclick = () => openLesson(lesson.id, { keepStep: true, test: true });
    app.querySelectorAll("[data-example]").forEach((btn) => {
      btn.onclick = () => {
        state.step = Number(btn.dataset.example);
        renderRead();
      };
    });
    drawPlate(step.guide);
  }

  let plateObserver = null;
  function drawPlate(guideId) {
    const canvas = document.getElementById("plate");
    const plate = canvas && canvas.parentElement;
    if (plateObserver) plateObserver.disconnect();
    plateObserver = null;
    if (!canvas || !plate) return;
    const paint = () => {
      const w = Math.max(2, Math.round(plate.clientWidth));
      const h = Math.max(2, Math.round(plate.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const fn = GUIDES[guideId];
      if (typeof fn === "function") fn(ctx, w, h);
    };
    paint();
    if (typeof ResizeObserver === "function") {
      plateObserver = new ResizeObserver(() => paint());
      plateObserver.observe(plate);
    }
  }

  function renderWatch() {
    if (pad) {
      pad.destroy();
      pad = null;
    }
    const lesson = currentLesson();
    if (!lesson) {
      showLibrary();
      return;
    }
    app.innerHTML = `
      <div class="studio watch">
        <div class="studio-bar">
          <button class="btn btn-ghost" id="back" type="button">Contents</button>
          <h1>${esc(lesson.title)}</h1>
          <div class="step-dots" id="watch-dots"></div>
        </div>
        <div class="workspace">
          <aside class="coach open">
            <p class="step-kicker" id="watch-kicker"></p>
            <h2 id="watch-title"></h2>
            <p class="story" id="watch-story"></p>
            <p class="label">The hand</p>
            <p class="ref-line" id="watch-hand"></p>
            <p class="label">Why</p>
            <p class="ref-line" id="watch-why"></p>
          </aside>
          <div class="paper-wrap">
            <div class="sheet" id="watch-sheet">
              <canvas id="watch-ink"></canvas>
              <div id="nib" class="nib" hidden>
                <svg viewBox="0 0 72 72" aria-hidden="true">
                  <path d="M56 10 L30 38" fill="none" stroke="#2a241e" stroke-width="6" stroke-linecap="round"/>
                  <path d="M30 38 L20 50" fill="none" stroke="#5c5148" stroke-width="4.5" stroke-linecap="round"/>
                  <path d="M22 46 L8 64 L24 52 Z" fill="#c45c26"/>
                  <path d="M16 55 L8 64" fill="none" stroke="#1c1814" stroke-width="1"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="toolbar">
          <button class="btn btn-ghost" id="watch-prev" type="button">Previous</button>
          <button class="btn btn-ghost" id="watch-replay" type="button">Replay</button>
          <button class="btn btn-ink" id="watch-next" type="button">Next mark</button>
          <button class="btn btn-ghost" id="watch-play" type="button">Play through</button>
          <button class="btn btn-ghost" id="watch-practice" type="button">Practice this</button>
        </div>
      </div>`;
    document.getElementById("back").onclick = () => showLibrary();
    document.getElementById("watch-prev").onclick = () => watchStep(-1);
    document.getElementById("watch-next").onclick = () => watchStep(1);
    document.getElementById("watch-replay").onclick = () => runWatchDraw();
    document.getElementById("watch-play").onclick = () => {
      watchPlay = !watchPlay;
      document.getElementById("watch-play").classList.toggle("on", watchPlay);
      if (watchPlay) watchStep(0);
    };
    document.getElementById("watch-practice").onclick = () => openLesson(lesson.id, { keepStep: true });
    paintWatchText();
    const sheet = document.getElementById("watch-sheet");
    requestAnimationFrame(() => {
      if (state.view !== "watch") return;
      runWatchDraw();
      if (sheet && typeof ResizeObserver === "function") {
        let last = Math.round(sheet.clientWidth);
        watchObserver = new ResizeObserver(() => {
          const w = Math.round(sheet.clientWidth);
          if (Math.abs(w - last) < 16) return;
          last = w;
          runWatchDraw();
        });
        watchObserver.observe(sheet);
      }
    });
  }

  function paintWatchText() {
    const lesson = currentLesson();
    if (!lesson) return;
    const step = lesson.steps[state.step];
    const kicker = document.getElementById("watch-kicker");
    const title = document.getElementById("watch-title");
    const story = document.getElementById("watch-story");
    const hand = document.getElementById("watch-hand");
    const why = document.getElementById("watch-why");
    const dots = document.getElementById("watch-dots");
    if (kicker) kicker.textContent = `Chapter ${lesson.chapter} · Mark ${state.step + 1} of ${lesson.steps.length}`;
    if (title) title.textContent = step.title;
    if (story) story.textContent = lesson.story || lesson.read || "";
    if (hand) hand.textContent = step.hand || step.coach;
    if (why) why.textContent = step.why || step.hint;
    if (dots) {
      dots.innerHTML = lesson.steps.map((s, i) =>
        `<button type="button" class="dot ${i === state.step ? "on" : ""} ${i < state.step ? "done" : ""}" data-watch-step="${i}" aria-label="Mark ${i + 1}: ${esc(s.title)}"></button>`
      ).join("");
      dots.querySelectorAll("[data-watch-step]").forEach((btn) => {
        btn.onclick = () => {
          state.step = Number(btn.dataset.watchStep);
          paintWatchText();
          runWatchDraw();
        };
      });
    }
    const prev = document.getElementById("watch-prev");
    const next = document.getElementById("watch-next");
    if (prev) prev.disabled = state.step === 0;
    if (next) next.disabled = state.step === lesson.steps.length - 1;
  }

  function watchStep(dir) {
    const lesson = currentLesson();
    if (!lesson) return;
    if (dir > 0 && state.step >= lesson.steps.length - 1) {
      watchPlay = false;
      const btn = document.getElementById("watch-play");
      if (btn) btn.classList.remove("on");
      return;
    }
    const next = Math.max(0, Math.min(lesson.steps.length - 1, state.step + dir));
    state.step = next;
    paintWatchText();
    runWatchDraw();
  }

  function stopWatch() {
    cancelWatchFrames();
    if (watchObserver) {
      watchObserver.disconnect();
      watchObserver = null;
    }
  }
  function cancelWatchFrames() {
    watchToken += 1;
    if (watchTimer) {
      clearTimeout(watchTimer);
      watchTimer = 0;
    }
    if (watchRaf) {
      cancelAnimationFrame(watchRaf);
      watchRaf = 0;
    }
    return watchToken;
  }

  function runWatchDraw() {
    const token = cancelWatchFrames();
    const canvas = document.getElementById("watch-ink");
    const sheet = document.getElementById("watch-sheet");
    const nib = document.getElementById("nib");
    const lesson = currentLesson();
    if (!canvas || !sheet || !lesson || state.view !== "watch") return;
    const step = lesson.steps[state.step];
    const w = Math.max(2, Math.round(sheet.clientWidth));
    const h = Math.max(2, Math.round(sheet.clientHeight));
    if (w < 8 || h < 8) {
      watchTimer = setTimeout(() => { if (token === watchToken) runWatchDraw(); }, 40);
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const fn = GUIDES[step.guide];
    const paths = fn ? guidePaths(fn, w, h) : [];
    paths.forEach((p) => { p.len = pathLength(p.pts); });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!paths.length || reduce) {
      paths.forEach((p) => drawWatchPath(ctx, p, p.len));
      placeNib(nib, paths.length ? pointAt(paths[paths.length - 1].pts, paths[paths.length - 1].len) : null, true);
      finishWatchBeat(token);
      return;
    }
    const speed = paths.length > 36 ? 2.4 : paths.length > 18 ? 1.45 : 0.78;
    let index = 0;
    let dist = 0;
    let lifting = 0;
    let last = 0;
    const frame = (now) => {
      if (token !== watchToken) return;
      if (!last) last = now;
      const dt = Math.min(34, now - last);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < index; i++) drawWatchPath(ctx, paths[i], paths[i].len);
      const path = paths[index];
      if (!path) {
        placeNib(nib, pointAt(paths[paths.length - 1].pts, paths[paths.length - 1].len), true);
        finishWatchBeat(token);
        return;
      }
      if (lifting > 0) {
        lifting -= dt;
        placeNib(nib, pointAt(path.pts, 0), true);
        watchRaf = requestAnimationFrame(frame);
        return;
      }
      dist += speed * dt;
      drawWatchPath(ctx, path, dist);
      placeNib(nib, pointAt(path.pts, Math.min(dist, path.len)), false);
      if (dist >= path.len) {
        index += 1;
        dist = 0;
        lifting = path.len < 26 ? 16 : 48;
      }
      watchRaf = requestAnimationFrame(frame);
    };
    watchRaf = requestAnimationFrame(frame);
  }

  function finishWatchBeat(token) {
    if (!watchPlay || token !== watchToken) return;
    const lesson = currentLesson();
    if (!lesson || state.step >= lesson.steps.length - 1) {
      watchPlay = false;
      const btn = document.getElementById("watch-play");
      if (btn) btn.classList.remove("on");
      return;
    }
    watchTimer = setTimeout(() => {
      if (token !== watchToken) return;
      state.step += 1;
      paintWatchText();
      runWatchDraw();
    }, 1000);
  }

  function guidePaths(fn, w, h) {
    const strokes = captureGuide(fn, w, h);
    const paths = [];
    strokes.forEach((stroke) => {
      let cur = null;
      const flush = () => {
        if (cur && cur.length > 1) paths.push({ pts: cur, width: stroke.width || 1.2 });
        cur = null;
      };
      const start = (x, y) => {
        flush();
        cur = [{ x, y }];
      };
      const add = (x, y) => {
        if (!cur) cur = [];
        const last = cur[cur.length - 1];
        if (last && Math.hypot(last.x - x, last.y - y) < 0.4) return;
        cur.push({ x, y });
      };
      stroke.ops.forEach((op) => {
        const kind = op[0];
        if (kind === "M") start(op[1], op[2]);
        else if (kind === "L") add(op[1], op[2]);
        else if (kind === "Q") {
          const p0 = cur && cur[cur.length - 1];
          if (!p0) return;
          for (let t = 0.2; t <= 1; t += 0.2) {
            const u = 1 - t;
            add(u * u * p0.x + 2 * u * t * op[1] + t * t * op[3], u * u * p0.y + 2 * u * t * op[2] + t * t * op[4]);
          }
        } else if (kind === "B") {
          const p0 = cur && cur[cur.length - 1];
          if (!p0) return;
          for (let t = 0.2; t <= 1; t += 0.2) {
            const u = 1 - t;
            add(
              u * u * u * p0.x + 3 * u * u * t * op[1] + 3 * u * t * t * op[3] + t * t * t * op[5],
              u * u * u * p0.y + 3 * u * u * t * op[2] + 3 * u * t * t * op[4] + t * t * t * op[6]
            );
          }
        } else if (kind === "Z" && cur && cur.length) add(cur[0].x, cur[0].y);
        else if (kind === "E" || kind === "A") {
          flush();
          const cx = op[1];
          const cy = op[2];
          const rx = Math.max(0.5, kind === "E" ? op[3] : op[3]);
          const ry = Math.max(0.5, kind === "E" ? op[4] : op[3]);
          const rot = kind === "E" ? op[5] : 0;
          const a0 = kind === "E" ? op[6] : op[4];
          const a1 = kind === "E" ? op[7] : op[5];
          const pts = [];
          const steps = 20;
          for (let i = 0; i <= steps; i++) {
            const a = a0 + (a1 - a0) * (i / steps);
            const x = Math.cos(a) * rx;
            const y = Math.sin(a) * ry;
            pts.push({
              x: cx + x * Math.cos(rot) - y * Math.sin(rot),
              y: cy + x * Math.sin(rot) + y * Math.cos(rot)
            });
          }
          if (pts.length > 1) paths.push({ pts, width: stroke.width || 1.2 });
        } else if (kind === "R") {
          flush();
          const x = op[1];
          const y = op[2];
          const rw = op[3];
          const rh = op[4];
          paths.push({
            pts: [{ x, y }, { x: x + rw, y }, { x: x + rw, y: y + rh }, { x, y: y + rh }, { x, y }],
            width: stroke.width || 1.2
          });
        }
      });
      flush();
    });
    return paths.filter((p) => pathLength(p.pts) > 1);
  }
  function pathLength(pts) {
    let n = 0;
    for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    return n;
  }
  function pointAt(pts, dist) {
    if (!pts || !pts.length) return null;
    let left = Math.max(0, dist);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y);
      if (left <= seg || i === pts.length - 1) {
        const t = seg === 0 ? 0 : Math.min(1, left / seg);
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
          angle: Math.atan2(b.y - a.y, b.x - a.x)
        };
      }
      left -= seg;
    }
    return { x: pts[0].x, y: pts[0].y, angle: 0 };
  }
  function drawWatchPath(ctx, path, dist) {
    const pts = path.pts;
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    let left = dist;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const seg = Math.hypot(b.x - a.x, b.y - a.y) || 0.001;
      if (left >= seg) {
        ctx.lineTo(b.x, b.y);
        left -= seg;
      } else {
        const t = left / seg;
        ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        break;
      }
    }
    ctx.strokeStyle = "#1c1814";
    ctx.lineWidth = Math.max(1.35, path.width || 1.2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }
  function placeNib(nib, tip, lifted) {
    if (!nib) return;
    if (!tip) {
      nib.hidden = true;
      return;
    }
    nib.hidden = false;
    const natural = Math.atan2(10 - 64, 56 - 8);
    const deg = (tip.angle + Math.PI - natural) * 180 / Math.PI;
    const lift = lifted ? 18 : 0;
    nib.style.transform = `translate(${tip.x - 8}px, ${tip.y - 64 - lift}px) rotate(${deg}deg)`;
    nib.style.opacity = lifted ? "0.45" : "1";
  }

  function practiceCards() {
    return typeof CARDS !== "undefined" && CARDS && CARDS.length ? CARDS : [];
  }
  function cardById(id) {
    return practiceCards().find((c) => c.id === id) || null;
  }
  function pickStationCard() {
    const cards = practiceCards();
    const lead = leadingTechnique();
    if (lead) {
      const inLead = cards.filter((c) => c.technique === lead);
      const fresh = inLead.find((c) => !state.attempts.some((a) => a.cardId === c.id));
      if (fresh) return fresh;
      const lastLead = cardById(state.station.lastCardId);
      if (lastLead && lastLead.technique === lead) return lastLead;
      if (inLead[0]) return inLead[0];
    }
    const last = cardById(state.station.lastCardId);
    if (last) return last;
    const unfinished = cards.find((c) => !state.attempts.some((a) => a.cardId === c.id));
    return unfinished || cards[0] || null;
  }
  function currentCard() {
    return cardById(stationCardId) || pickStationCard();
  }
  function applyAppearance() {
    document.body.classList.toggle("desk-dark", !!state.appearance.dark);
  }
  function contextOn(flag) {
    if (state.appearance.mode === "focus") return false;
    return !!state.appearance[flag];
  }
  function openStation(cardId) {
    const lead = cardId ? "" : leadingTechnique();
    if (!cardId && lead && !cardsForTechnique(lead).length) {
      const lesson = (OBVIOUS_LESSONS[lead] || [])[0];
      if (lesson) {
        openLesson(lesson);
        return;
      }
    }
    const card = (cardId && cardById(cardId)) || pickStationCard();
    if (!card) return;
    stationCardId = card.id;
    state.station.lastCardId = card.id;
    if (cardId && card.technique) state.station.focusId = card.technique;
    stationPhase = "idle";
    stationEndsAt = 0;
    wakeNote = "";
    save();
    state.view = "station";
    render();
  }
  function releaseStation() {
    if (stationClock) {
      clearInterval(stationClock);
      stationClock = 0;
    }
    if (stationObserver) {
      stationObserver.disconnect();
      stationObserver = null;
    }
    if (wakeSentinel) {
      const lock = wakeSentinel;
      wakeSentinel = null;
      Promise.resolve(lock.release()).catch(() => {});
    }
  }
  function requestWake() {
    wakeNote = "";
    if (!navigator.wakeLock || !navigator.wakeLock.request) {
      wakeNote = "This device may sleep.";
      paintWakeNote();
      return;
    }
    navigator.wakeLock.request("screen").then((lock) => {
      wakeSentinel = lock;
      wakeNote = "";
      paintWakeNote();
      lock.addEventListener("release", () => {
        if (wakeSentinel === lock) wakeSentinel = null;
      });
    }).catch(() => {
      wakeNote = "This device may sleep.";
      paintWakeNote();
    });
  }
  function paintWakeNote() {
    const el = document.getElementById("station-wake");
    if (el) el.textContent = wakeNote;
  }
  function formatLeft(ms) {
    const s = Math.ceil(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }
  function stationRemaining() {
    if (stationPhase === "running") return Math.max(0, stationEndsAt - Date.now());
    return state.station.lastDurationMin * 60000;
  }
  function renderStation() {
    const card = currentCard();
    if (!card) {
      showLibrary();
      return;
    }
    stationCardId = card.id;
    app.innerHTML = `
      <div class="station ${state.appearance.dark ? "dark" : ""}">
        <div class="station-bar">
          <button class="btn btn-ghost" id="station-exit" type="button">Exit</button>
          <h1 id="station-title"></h1>
          <p class="station-clock" id="station-clock"></p>
          <button class="gear" id="station-gear" type="button" aria-label="Appearance">${gearIcon()}</button>
        </div>
        <div class="station-context" id="station-context"></div>
        <div class="paper-wrap station-paper"><div class="sheet" id="station-sheet"><canvas id="station-ink"></canvas></div></div>
        <div class="station-dock">
          <p class="station-wake" id="station-wake"></p>
          <div class="station-presets" id="station-presets"></div>
          <div class="station-actions">
            <button class="btn btn-ink" id="station-go" type="button">Begin</button>
            <button class="btn btn-ghost" id="station-capture" type="button" hidden>Capture</button>
          </div>
        </div>
        <div class="gear-panel" id="gear-panel" hidden></div>
        <div class="station-confirm" id="station-confirm" hidden>
          <p>The timer is still running.</p>
          <div class="actions">
            <button class="btn btn-ink" id="station-stay" type="button">Stay</button>
            <button class="btn btn-ghost" id="station-leave" type="button">Leave</button>
          </div>
        </div>
        <input id="station-cam" type="file" accept="image/*" capture="environment" hidden />
        <div class="capture-frame" id="capture-frame" hidden>
          <div class="page-frame"><span>Place the page inside this rectangle.</span></div>
          <div class="actions">
            <button class="btn btn-ink" id="capture-open" type="button">Open camera</button>
            <button class="btn btn-ghost" id="capture-cancel" type="button">Cancel</button>
          </div>
        </div>
        <div class="capture-compare" id="capture-compare" hidden></div>
        <div class="toast" id="toast"></div>
      </div>`;
    document.getElementById("station-exit").onclick = () => exitStation();
    document.getElementById("station-gear").onclick = (e) => {
      e.stopPropagation();
      toggleGear();
    };
    document.getElementById("station-go").onclick = () => stationPrimary();
    document.getElementById("station-capture").onclick = () => captureStation();
    document.getElementById("capture-open").onclick = () => openStationCamera();
    document.getElementById("capture-cancel").onclick = () => closeCaptureFrame();
    document.getElementById("station-stay").onclick = () => {
      document.getElementById("station-confirm").hidden = true;
    };
    document.getElementById("station-leave").onclick = () => {
      stationPhase = "idle";
      showLibrary();
    };
    paintStationChrome();
    paintStationSheet();
    const sheet = document.getElementById("station-sheet");
    if (sheet && typeof ResizeObserver === "function") {
      let last = Math.round(sheet.clientWidth);
      stationObserver = new ResizeObserver(() => {
        const w = Math.round(sheet.clientWidth);
        if (Math.abs(w - last) < 12) return;
        last = w;
        paintStationSheet();
      });
      stationObserver.observe(sheet);
    }
    if (stationPhase === "running") startStationClock();
  }
  function paintStationChrome() {
    const card = currentCard();
    if (!card) return;
    const title = document.getElementById("station-title");
    const clock = document.getElementById("station-clock");
    const context = document.getElementById("station-context");
    const presets = document.getElementById("station-presets");
    const go = document.getElementById("station-go");
    const capture = document.getElementById("station-capture");
    if (title) title.textContent = card.title;
    if (clock) clock.textContent = formatLeft(stationRemaining());
    if (context) {
      const bits = [];
      if (contextOn("showCoach")) bits.push(`<p>${esc(card.coach)}</p>`);
      if (contextOn("showHistory")) bits.push(`<p>${esc(card.context.history)}</p>`);
      if (contextOn("showArtists")) bits.push(`<p>${esc(card.context.artists.join(", "))}</p>`);
      if (contextOn("showWorld")) bits.push(`<p>${esc(card.context.world)}</p>`);
      context.innerHTML = bits.join("");
      context.hidden = bits.length === 0;
    }
    if (presets) {
      const running = stationPhase === "running";
      presets.innerHTML = card.minutesPresets.map((m) =>
        `<button type="button" class="chip ${m === state.station.lastDurationMin ? "on" : ""}" data-min="${m}" ${running ? "disabled" : ""}>${m}</button>`
      ).join("");
      presets.querySelectorAll("[data-min]").forEach((btn) => {
        btn.onclick = () => {
          if (stationPhase === "running") return;
          state.station.lastDurationMin = Number(btn.dataset.min);
          save();
          paintStationChrome();
        };
      });
    }
    if (go) go.textContent = stationPhase === "running" ? "End early" : stationPhase === "ended" ? "Begin again" : "Begin";
    if (capture) capture.hidden = stationPhase === "idle";
    paintWakeNote();
    paintGear();
  }
  function paintGear() {
    const panel = document.getElementById("gear-panel");
    if (!panel || panel.hidden) return;
    const a = state.appearance;
    const history = a.mode === "history";
    panel.innerHTML = `
      <p class="eyebrow">Appearance</p>
      <div class="station-presets">
        <button type="button" class="chip ${a.mode === "focus" ? "on" : ""}" data-mode="focus">Focus</button>
        <button type="button" class="chip ${history ? "on" : ""}" data-mode="history">History</button>
      </div>
      <label class="toggle"><input type="checkbox" data-flag="dark" ${a.dark ? "checked" : ""} /> Dark paper</label>
      ${history ? `
        <label class="toggle"><input type="checkbox" data-flag="showHistory" ${a.showHistory ? "checked" : ""} /> History</label>
        <label class="toggle"><input type="checkbox" data-flag="showArtists" ${a.showArtists ? "checked" : ""} /> Artists</label>
        <label class="toggle"><input type="checkbox" data-flag="showWorld" ${a.showWorld ? "checked" : ""} /> Where it shows up</label>
        <label class="toggle"><input type="checkbox" data-flag="showCoach" ${a.showCoach ? "checked" : ""} /> Coach</label>
      ` : `<p class="gear-note">Focus keeps only the reference, the timer, and Begin.</p>`}
      <button class="btn btn-ghost" id="station-reset" type="button">Reset this session</button>`;
    panel.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.onclick = () => setAppearanceMode(btn.dataset.mode);
    });
    panel.querySelectorAll("[data-flag]").forEach((box) => {
      box.onchange = () => {
        state.appearance[box.dataset.flag] = box.checked;
        if (box.dataset.flag === "dark") applyAppearance();
        save();
        const root = document.querySelector(".station");
        if (root) root.classList.toggle("dark", !!state.appearance.dark);
        paintStationChrome();
        paintStationSheet();
      };
    });
    const reset = document.getElementById("station-reset");
    if (reset) reset.onclick = () => resetStation();
  }
  function toggleGear() {
    const panel = document.getElementById("gear-panel");
    if (!panel) return;
    panel.hidden = !panel.hidden;
    paintGear();
  }
  function setAppearanceMode(mode) {
    state.appearance.mode = mode === "history" ? "history" : "focus";
    if (state.appearance.mode === "history") {
      state.appearance.showHistory = true;
      state.appearance.showArtists = true;
      state.appearance.showWorld = true;
      state.appearance.showCoach = true;
    }
    save();
    paintStationChrome();
  }
  function paintStationSheet() {
    const canvas = document.getElementById("station-ink");
    const sheet = document.getElementById("station-sheet");
    const card = currentCard();
    if (!canvas || !sheet || !card) return;
    const w = Math.max(2, Math.round(sheet.clientWidth));
    const h = Math.max(2, Math.round(sheet.clientHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const fn = GUIDES[card.guide];
    if (typeof fn !== "function") return;
    fn(state.appearance.dark ? inkOnDark(ctx) : ctx, w, h);
  }
  function inkOnDark(ctx) {
    return new Proxy(ctx, {
      get(target, prop) {
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
      set(target, prop, value) {
        if (prop === "strokeStyle") target[prop] = "rgba(243, 238, 228, 0.78)";
        else if (prop === "fillStyle") target[prop] = "rgba(224, 138, 85, 0.9)";
        else target[prop] = value;
        return true;
      }
    });
  }
  function stationPrimary() {
    if (stationPhase === "running") {
      stationPhase = "ended";
      if (stationClock) {
        clearInterval(stationClock);
        stationClock = 0;
      }
      releaseWakeOnly();
      paintStationChrome();
      return;
    }
    stationPhase = "running";
    stationEndsAt = Date.now() + state.station.lastDurationMin * 60000;
    const panel = document.getElementById("gear-panel");
    if (panel) panel.hidden = true;
    requestWake();
    startStationClock();
    paintStationChrome();
  }
  function releaseWakeOnly() {
    if (!wakeSentinel) return;
    const lock = wakeSentinel;
    wakeSentinel = null;
    Promise.resolve(lock.release()).catch(() => {});
  }
  function startStationClock() {
    if (stationClock) clearInterval(stationClock);
    stationClock = setInterval(stationTick, 250);
    stationTick();
  }
  function stationTick() {
    if (state.view !== "station" || stationPhase !== "running") return;
    const left = stationEndsAt - Date.now();
    const clock = document.getElementById("station-clock");
    if (clock) clock.textContent = formatLeft(Math.max(0, left));
    if (left <= 0) {
      stationPhase = "ended";
      if (stationClock) {
        clearInterval(stationClock);
        stationClock = 0;
      }
      releaseWakeOnly();
      chime();
      paintStationChrome();
    }
  }
  function chime() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        const audio = new Ctx();
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = "sine";
        osc.frequency.value = 494;
        gain.gain.setValueAtTime(0.03, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.7);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start();
        osc.stop(audio.currentTime + 0.7);
      }
    } catch (_) {}
    toast("Time’s up.");
  }
  function resetStation() {
    stationPhase = "idle";
    stationEndsAt = 0;
    wakeNote = "";
    if (stationClock) {
      clearInterval(stationClock);
      stationClock = 0;
    }
    releaseWakeOnly();
    const panel = document.getElementById("gear-panel");
    if (panel) panel.hidden = true;
    paintStationChrome();
    toast("Session cleared.");
  }
  function exitStation() {
    const frame = document.getElementById("capture-frame");
    if (frame && !frame.hidden) {
      closeCaptureFrame();
      return;
    }
    const compare = document.getElementById("capture-compare");
    if (compare && !compare.hidden) {
      compare.hidden = true;
      return;
    }
    if (stationPhase === "running") {
      const confirm = document.getElementById("station-confirm");
      if (confirm) confirm.hidden = false;
      return;
    }
    const panel = document.getElementById("gear-panel");
    if (panel && !panel.hidden) {
      panel.hidden = true;
      return;
    }
    showLibrary();
  }
  function closeCaptureFrame() {
    const frame = document.getElementById("capture-frame");
    if (frame) frame.hidden = true;
  }
  function captureStation() {
    const frame = document.getElementById("capture-frame");
    if (!frame || captureWait) return;
    frame.hidden = false;
  }
  function openStationCamera() {
    if (captureWait) return;
    const input = document.getElementById("station-cam");
    if (!input) return;
    captureWait = true;
    input.value = "";
    const finish = (file) => {
      if (!captureWait) return;
      captureWait = false;
      window.removeEventListener("focus", onFocus);
      input.onchange = null;
      closeCaptureFrame();
      storeAttempt(file || null);
    };
    input.onchange = () => finish(input.files && input.files[0]);
    const onFocus = () => {
      setTimeout(() => {
        if (captureWait && (!input.files || !input.files.length)) finish(null);
      }, 500);
    };
    window.addEventListener("focus", onFocus);
    input.click();
  }
  function showCaptureCompare(attempt, note) {
    const panel = document.getElementById("capture-compare");
    if (!panel) {
      toast(note);
      return;
    }
    const card = cardById(attempt.cardId);
    panel.hidden = false;
    panel.innerHTML = `
      <div class="capture-compare-card">
        <p class="eyebrow">Compare</p>
        <h2>${esc(card ? card.title : "Attempt")}</h2>
        <p class="lede">${esc(note)} Nothing here is scored.</p>
        <div class="compare-grid">
          <figure>
            ${attempt.imageDataUrl ? `<img id="fresh-photo" alt="Your page" />` : `<p class="empty-pages">No photo for this session.</p>`}
            <figcaption>Your page</figcaption>
          </figure>
          <figure>
            ${attempt.referenceDataUrl ? `<img id="fresh-ref" alt="Reference" />` : `<p class="empty-pages">No reference.</p>`}
            <figcaption>Reference</figcaption>
          </figure>
        </div>
        <div class="actions">
          <button class="btn btn-ghost" id="compare-stay" type="button">Stay</button>
          <button class="btn btn-ink" id="compare-library" type="button">Contents</button>
        </div>
      </div>`;
    const photo = document.getElementById("fresh-photo");
    if (photo) photo.src = attempt.imageDataUrl;
    const ref = document.getElementById("fresh-ref");
    if (ref) ref.src = attempt.referenceDataUrl;
    document.getElementById("compare-stay").onclick = () => {
      panel.hidden = true;
    };
    document.getElementById("compare-library").onclick = () => showLibrary();
  }
  function storeAttempt(file) {
    const card = currentCard();
    const canvas = document.getElementById("station-ink");
    if (!card) return;
    let reference = "";
    try { reference = canvas ? canvas.toDataURL("image/png") : ""; } catch (_) {}
    const commit = (image) => {
      const attempt = {
        id: uid(),
        cardId: card.id,
        technique: card.technique,
        sourceId: null,
        lessonId: null,
        imageDataUrl: image || reference || "",
        referenceDataUrl: reference || "",
        createdAt: new Date().toISOString(),
        durationMin: state.station.lastDurationMin
      };
      state.attempts.unshift(attempt);
      noteDay(todayKey(), attempt.durationMin, !!attempt.imageDataUrl);
      markPracticed();
      const kept = save();
      const note = kept ? (file ? "Saved." : "Saved the reference.") : "Photo too large — saved session without image.";
      showCaptureCompare(attempt, note);
    };
    if (!file) {
      commit("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => commit(String(reader.result || ""));
    reader.onerror = () => commit("");
    reader.readAsDataURL(file);
  }
  function gearIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"/></svg>`;
  }

  function renderStudio() {
    const lesson = currentLesson();
    const step = lesson ? lesson.steps[state.step] : null;
    const title = state.free ? "Blank page" : lesson.title;
    const memory = inkMemory;
    if (pad) pad.destroy();
    app.innerHTML = `
      <div class="studio">
        <div class="studio-bar">
          <button class="btn btn-ghost" id="back" type="button">Contents</button>
          <h1>${esc(title)}</h1>
          <div class="step-dots" id="dots">${dotsHtml(lesson)}</div>
          <div class="timer">
            <span class="timer-readout" id="timer-readout">Timer</span>
            <button type="button" class="chip" data-min="3">3</button>
            <button type="button" class="chip" data-min="5">5</button>
            <button type="button" class="chip" data-min="10">10</button>
          </div>
        </div>
        <div class="workspace">
          <aside class="coach ${state.coachOpen ? "open" : ""}">
            <div class="coach-top">
              <div>
                <p class="step-kicker" id="kicker"></p>
                <h2 id="step-title"></h2>
              </div>
              <button type="button" class="btn btn-ghost coach-toggle" id="coach-toggle">${state.coachOpen ? "Hide" : "Coach"}</button>
            </div>
            <div class="coach-extra">
              <p class="coach-copy" id="coach-copy"></p>
              <div class="hint" id="hint" hidden></div>
              <p class="method" id="method" hidden></p>
            </div>
            <div class="coach-tools" id="coach-tools"></div>
            <div class="coach-nav" id="coach-nav"></div>
          </aside>
          <div class="paper-wrap"><div class="sheet" id="sheet"><canvas id="guide"></canvas><canvas id="ink"></canvas></div></div>
        </div>
        <div class="toolbar">
          ${toolBtn("pen", "Pen (P)", penIcon())}
          ${toolBtn("pencil", "Pencil (B)", pencilIcon())}
          ${toolBtn("eraser", "Eraser (E)", eraserIcon())}
          <div class="sep"></div>
          <label class="slider">Nib <input id="size" type="range" min="1" max="8" step="0.2" value="${state.size}" /></label>
          <div class="sep"></div>
          <button class="tool" id="undo" type="button" title="Undo (Z)">${undoIcon()}</button>
          <button class="tool" id="redo" type="button" title="Redo (Shift+Z)">${redoIcon()}</button>
          <button class="tool" id="clear" type="button" title="Clear page">${clearIcon()}</button>
          <button class="btn btn-ghost" id="save" type="button">Save PNG</button>
          <button class="btn btn-ink" id="keep" type="button">Keep</button>
        </div>
        <div class="toast" id="toast"></div>
      </div>`;
    fillCoach(lesson, step);
    pad = new SketchPad(document.getElementById("ink"), document.getElementById("guide"), document.getElementById("sheet"));
    pad.strokes = memory.strokes || [];
    pad.redoStack = memory.redo || [];
    pad.tool = state.tool;
    pad.size = state.size;
    pad.getGuide = () => currentGuide(false);
    pad.onStrokeEnd = () => markPracticed();
    pad.resize();
    bindStudio(lesson, title);
    paintTimer();
    if (state.timerEnd) runTimer();
  }

  function dotsHtml(lesson) {
    if (!lesson) return "";
    return lesson.steps.map((s, i) =>
      `<button type="button" class="dot ${i === state.step ? "on" : ""} ${i < state.step ? "done" : ""}" data-step="${i}" aria-label="Step ${i + 1}: ${esc(s.title)}"></button>`
    ).join("");
  }
  function toolBtn(id, title, icon) {
    return `<button class="tool ${state.tool === id ? "on" : ""}" data-tool="${id}" type="button" title="${title}">${icon}</button>`;
  }
  function fillCoach(lesson, step) {
    const kicker = document.getElementById("kicker");
    const heading = document.getElementById("step-title");
    const copy = document.getElementById("coach-copy");
    const hint = document.getElementById("hint");
    const tools = document.getElementById("coach-tools");
    const nav = document.getElementById("coach-nav");
    if (state.free) {
      kicker.textContent = "Blank page";
      heading.textContent = "Draw anything";
      copy.textContent = "No example on this page. Use it when you already know the technique and want a clean sheet.";
      hint.hidden = true;
      const method = document.getElementById("method");
      if (method) method.hidden = true;
      tools.innerHTML = "";
      nav.innerHTML = `<button class="btn btn-ghost" id="back2" type="button">Back to contents</button>`;
      return;
    }
    kicker.textContent = `Chapter ${lesson.chapter} · Exercise ${state.step + 1} of ${lesson.steps.length}`;
    heading.textContent = step.title;
    copy.innerHTML = `
      <span class="label">Technique</span>
      <span class="ref-line">${esc(lesson.technique || "")}</span>
      <span class="label">Example</span>
      <span class="ref-line">${esc(step.example || step.hint)}</span>
      <span class="label">Exercise</span>
      <span class="ref-line">${esc(step.exercise || step.coach)}</span>`;
    hint.hidden = false;
    hint.textContent = step.hint;
    const method = document.getElementById("method");
    if (method) {
      const source = lesson.source;
      if (source && source.artist) {
        const handle = source.handle ? " (@" + source.handle + ")" : "";
        method.hidden = false;
        method.textContent = "Method after " + source.artist + handle + ". A practice companion, not their product.";
      } else method.hidden = true;
    }
    tools.innerHTML = `
      <button class="btn btn-ghost" id="show" type="button">Show the example</button>
      <button class="btn btn-ghost" id="read-chapter" type="button">Read chapter</button>
      <button class="btn btn-ghost" id="watch-chapter" type="button">Watch the pen</button>
      <button class="btn btn-ghost" id="test" type="button">Hide example</button>
      <button class="btn btn-ghost" id="compare" type="button">Compare</button>
      <label class="toggle"><input type="checkbox" id="ghost" ${state.ghost ? "checked" : ""} /> Example</label>
      <label class="opacity">Faint <input id="ghost-op" type="range" min="0.15" max="1" step="0.05" value="${state.ghostOpacity}" /></label>`;
    const last = state.step === lesson.steps.length - 1;
    nav.innerHTML = `
      <button class="btn btn-ghost" id="prev" type="button" ${state.step === 0 ? "disabled" : ""}>Back</button>
      <button class="btn btn-ink" id="next" type="button">${last ? "Mark drawn" : "Next step"}</button>`;
  }

  function bindStudio(lesson, title) {
    document.getElementById("back").onclick = () => showLibrary();
    const back2 = document.getElementById("back2");
    if (back2) back2.onclick = () => showLibrary();
    const toggle = document.getElementById("coach-toggle");
    if (toggle) toggle.onclick = () => {
      state.coachOpen = !state.coachOpen;
      const coach = document.querySelector(".coach");
      if (coach) coach.classList.toggle("open", state.coachOpen);
      toggle.textContent = state.coachOpen ? "Hide" : "Coach";
      requestAnimationFrame(() => pad && pad.resize());
    };
    app.querySelectorAll("[data-step]").forEach((dot) => {
      dot.onclick = () => changeStep(Number(dot.dataset.step));
    });
    app.querySelectorAll("[data-min]").forEach((btn) => {
      btn.onclick = () => setTimer(Number(btn.dataset.min));
    });
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    if (prev) prev.onclick = () => changeStep(state.step - 1);
    if (next) next.onclick = () => {
      if (state.step < lesson.steps.length - 1) changeStep(state.step + 1);
      else completeLesson(lesson);
    };
    const show = document.getElementById("show");
    if (show) show.onclick = () => {
      state.ghost = true;
      const box = document.getElementById("ghost");
      if (box) box.checked = true;
      pad.getGuide = () => currentGuide(false);
      pad.showGuide(() => currentGuide(true));
    };
    const readChapter = document.getElementById("read-chapter");
    if (readChapter) readChapter.onclick = () => openRead(lesson.id);
    const watchChapter = document.getElementById("watch-chapter");
    if (watchChapter) watchChapter.onclick = () => openWatch(lesson.id);
    const test = document.getElementById("test");
    if (test) test.onclick = () => {
      setGhost(false);
      toast("Example hidden. Draw it from the technique.");
    };
    const compare = document.getElementById("compare");
    if (compare) compare.onclick = () => {
      setGhost(true);
      toast("Example on. Compare it with what you drew.");
    };
    const ghost = document.getElementById("ghost");
    if (ghost) ghost.onchange = () => setGhost(ghost.checked);
    const op = document.getElementById("ghost-op");
    if (op) op.oninput = () => {
      state.ghostOpacity = Number(op.value);
      save();
      if (pad) pad.redrawGuide();
    };
    app.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.onclick = () => selectTool(btn.dataset.tool);
    });
    document.getElementById("size").oninput = (e) => {
      state.size = Number(e.target.value);
      if (pad) pad.size = state.size;
    };
    document.getElementById("undo").onclick = () => pad && pad.undo();
    document.getElementById("redo").onclick = () => pad && pad.redo();
    document.getElementById("clear").onclick = () => {
      if (pad) pad.clear();
      inkMemory = { strokes: [], redo: [] };
    };
    document.getElementById("save").onclick = () => pad && pad.exportPNG(title);
    document.getElementById("keep").onclick = () => keepPage(title);
  }

  function changeStep(i) {
    const lesson = currentLesson();
    if (!lesson) return;
    const next = clamp(i, 0, lesson.steps.length - 1);
    if (next === state.step) return;
    if (pad) inkMemory = { strokes: pad.strokes, redo: pad.redoStack };
    state.step = next;
    renderStudio();
  }
  function selectTool(tool) {
    state.tool = tool;
    if (pad) {
      pad.tool = tool;
      pad.ink.style.cursor = tool === "eraser" ? "cell" : "crosshair";
    }
    app.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === tool));
  }
  function setGhost(on) {
    state.ghost = on;
    const box = document.getElementById("ghost");
    if (box) box.checked = on;
    if (pad) {
      pad.getGuide = () => currentGuide(false);
      pad.redrawGuide();
    }
  }
  function setSize(next) {
    state.size = clamp(Math.round(next * 10) / 10, 1, 8);
    if (pad) pad.size = state.size;
    const sl = document.getElementById("size");
    if (sl) sl.value = String(state.size);
  }

  function completeLesson(lesson) {
    state.completed[lesson.id] = true;
    if (lesson.id === dailyLesson().id) state.dailyDone = `${todayKey()}:${lesson.id}`;
    markPracticed();
    save();
    const wrap = document.createElement("div");
    wrap.className = "complete-modal";
    wrap.innerHTML = `
      <div class="complete-card">
        <p class="eyebrow">Page finished</p>
        <h2>${esc(lesson.title)}</h2>
        <p>It’s in the workbook now. Read the chapter again, or practice it once more with the example, and once without.</p>
        <div class="actions">
          <button class="btn btn-ink" id="to-lib" type="button">Contents</button>
          <button class="btn btn-ghost" id="again-ghost" type="button">Again with the example</button>
          <button class="btn btn-ghost" id="again-plain" type="button">Again without</button>
        </div>
      </div>`;
    app.appendChild(wrap);
    wrap.querySelector("#to-lib").onclick = () => showLibrary();
    wrap.querySelector("#again-ghost").onclick = () => replay(true);
    wrap.querySelector("#again-plain").onclick = () => replay(false);
  }
  function replay(withGhost) {
    state.ghost = withGhost;
    state.step = 0;
    inkMemory = { strokes: [], redo: [] };
    renderStudio();
  }

  function setTimer(min) {
    if (state.timerMinutes === min && state.timerEnd > Date.now()) {
      clearTimer();
      return;
    }
    state.timerMinutes = min;
    state.timerEnd = Date.now() + min * 60000;
    runTimer();
  }
  function clearTimer() {
    state.timerEnd = 0;
    state.timerMinutes = 0;
    if (timerHandle) clearTimeout(timerHandle);
    timerHandle = 0;
    paintTimer();
  }
  function runTimer() {
    if (timerHandle) clearTimeout(timerHandle);
    const tick = () => {
      if (!state.timerEnd) return;
      if (Date.now() >= state.timerEnd) {
        state.timerEnd = 0;
        state.timerMinutes = 0;
        timerHandle = 0;
        paintTimer();
        toast("Time’s up. Finish the stroke you’re on.");
        return;
      }
      paintTimer();
      timerHandle = setTimeout(tick, 250);
    };
    tick();
  }
  function paintTimer() {
    const el = document.getElementById("timer-readout");
    if (!el) return;
    document.querySelectorAll("[data-min]").forEach((btn) => {
      btn.classList.toggle("on", Boolean(state.timerEnd) && Number(btn.dataset.min) === state.timerMinutes);
    });
    if (!state.timerEnd) {
      el.textContent = "Timer";
      return;
    }
    const s = Math.max(0, Math.ceil((state.timerEnd - Date.now()) / 1000));
    el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
  }

  function onKey(e) {
    if (e.key === "Escape") {
      const viewer = document.getElementById("viewer");
      if (viewer) {
        viewer.remove();
        return;
      }
      const modal = document.querySelector(".complete-modal");
      if (modal) {
        modal.remove();
        return;
      }
      if (state.view === "station") {
        exitStation();
        return;
      }
      if (state.view === "attempts" && state.compareId) {
        state.compareId = null;
        render();
        return;
      }
      if (state.view === "roadmap" && state.station.focusId) {
        focusRoadmap("");
        return;
      }
      if (state.view === "profile" && state.profileDay) {
        state.profileDay = "";
        render();
        return;
      }
      if (state.view === "sources" || state.view === "attempts" || state.view === "roadmap" || state.view === "profile") {
        showLibrary();
        return;
      }
    }
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (state.view === "library" && e.key.toLowerCase() === "s" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openStation();
      return;
    }
    if (state.view === "watch") {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        watchStep(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        watchStep(-1);
      } else if (e.key === " ") {
        e.preventDefault();
        runWatchDraw();
      }
      return;
    }
    if (state.view !== "studio" || !pad) return;
    const key = e.key.toLowerCase();
    if (key === "z" && !e.altKey) {
      e.preventDefault();
      if (e.shiftKey) pad.redo();
      else pad.undo();
    } else if (key === "y" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      pad.redo();
    } else if (key === "e" && !e.metaKey && !e.ctrlKey) selectTool("eraser");
    else if (key === "p" && !e.metaKey && !e.ctrlKey) selectTool("pen");
    else if (key === "b" && !e.metaKey && !e.ctrlKey) selectTool("pencil");
    else if (key === "g" && !e.metaKey && !e.ctrlKey && !state.free) setGhost(!state.ghost);
    else if (e.key === "[") setSize(state.size - 0.4);
    else if (e.key === "]") setSize(state.size + 0.4);
  }

  function idb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("sketch-desk-gallery", 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("pages")) db.createObjectStore("pages", { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function galleryAll() {
    return idb().then((db) => new Promise((resolve, reject) => {
      const req = db.transaction("pages", "readonly").objectStore("pages").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    })).catch(() => readFallback());
  }
  function galleryPut(page) {
    return idb().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction("pages", "readwrite");
      tx.objectStore("pages").put(page);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    })).catch(() => writeFallback(page));
  }
  function galleryDelete(id) {
    return idb().then((db) => new Promise((resolve, reject) => {
      const tx = db.transaction("pages", "readwrite");
      tx.objectStore("pages").delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    })).catch(() => {
      const pages = readFallback().filter((p) => p.id !== id);
      localStorage.setItem(FALLBACK, JSON.stringify(pages));
    });
  }
  const FALLBACK = "sketch-desk-gallery-fallback";
  function readFallback() {
    try { return JSON.parse(localStorage.getItem(FALLBACK) || "[]"); }
    catch (_) { return []; }
  }
  function writeFallback(page) {
    return blobToData(page.thumb, "image/jpeg").then((thumbUrl) => blobToData(page.image, "image/png").then((imageUrl) => {
      const pages = readFallback().filter((p) => p.id !== page.id);
      pages.push({
        id: page.id,
        title: page.title,
        lessonId: page.lessonId,
        createdAt: page.createdAt,
        image: imageUrl,
        thumb: thumbUrl,
        fallback: true
      });
      const trimmed = pages.sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
      localStorage.setItem(FALLBACK, JSON.stringify(trimmed));
    }));
  }
  function blobToData(blob, fallbackType) {
    if (typeof blob === "string") return Promise.resolve(blob);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob || new Blob([], { type: fallbackType }));
    });
  }
  function urlFor(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    const url = URL.createObjectURL(value);
    galleryUrls.push(url);
    return url;
  }
  function revokeGallery() {
    galleryUrls.forEach((u) => URL.revokeObjectURL(u));
    galleryUrls = [];
  }
  function canvasBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
  }

  async function keepPage(title) {
    if (!pad) return;
    try {
      const out = pad.composite();
      const thumb = document.createElement("canvas");
      const tw = 480;
      thumb.width = tw;
      thumb.height = Math.max(1, Math.round(out.height * (tw / out.width)));
      thumb.getContext("2d").drawImage(out, 0, 0, thumb.width, thumb.height);
      const image = await canvasBlob(out, "image/png");
      const thumbBlob = await canvasBlob(thumb, "image/jpeg", 0.72);
      if (!image || !thumbBlob) throw new Error("empty");
      await galleryPut({
        id: (window.crypto && crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
        title: title || "Sketch",
        lessonId: state.lessonId,
        createdAt: Date.now(),
        image,
        thumb: thumbBlob
      });
      toast("Kept on this device");
    } catch (_) {
      toast("Couldn’t keep that page");
    }
  }

  async function paintGallery() {
    const mount = document.getElementById("gallery-mount");
    if (!mount) return;
    let pages = [];
    try { pages = await galleryAll(); }
    catch (_) { pages = []; }
    if (!document.getElementById("gallery-mount") || state.view !== "library") return;
    revokeGallery();
    pages.sort((a, b) => b.createdAt - a.createdAt);
    if (!pages.length) {
      mount.innerHTML = `<p class="empty-pages">Nothing kept yet. In the studio, Keep stores the page here.</p>`;
      return;
    }
    mount.innerHTML = `<div class="thumbs">${pages.map((p, i) => `
      <button class="card thumb" type="button" data-page="${i}">
        <img alt="" src="${urlFor(p.thumb)}" />
        <div class="cap"><strong>${esc(p.title)}</strong><span>${esc(formatWhen(p.createdAt))}</span></div>
      </button>`).join("")}</div>`;
    mount.querySelectorAll("[data-page]").forEach((btn) => {
      btn.onclick = () => openViewer(pages[Number(btn.dataset.page)]);
    });
  }
  function formatWhen(ts) {
    try {
      return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (_) { return ""; }
  }
  function openViewer(page) {
    const old = document.getElementById("viewer");
    if (old) old.remove();
    const wrap = document.createElement("div");
    wrap.className = "viewer";
    wrap.id = "viewer";
    wrap.innerHTML = `
      <div class="viewer-card">
        <p class="eyebrow">Kept page</p>
        <h2>${esc(page.title)}</h2>
        <img alt="${esc(page.title)}" src="${urlFor(page.image)}" />
        <div class="actions">
          <button class="btn btn-ink" id="dl" type="button">Download</button>
          <button class="btn btn-ghost" id="del" type="button">Delete</button>
          <button class="btn btn-ghost" id="close-view" type="button">Close</button>
        </div>
      </div>`;
    app.appendChild(wrap);
    wrap.querySelector("#close-view").onclick = () => wrap.remove();
    wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });
    wrap.querySelector("#dl").onclick = () => downloadUrl(urlFor(page.image), page.title);
    wrap.querySelector("#del").onclick = async () => {
      await galleryDelete(page.id);
      wrap.remove();
      toast("Page deleted");
      paintGallery();
    };
  }
  function downloadUrl(url, name) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(name || "sketch").toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  }

  class SketchPad {
    constructor(ink, guide, sheet) {
      this.ink = ink;
      this.guide = guide;
      this.sheet = sheet;
      this.ctx = ink.getContext("2d");
      this.gctx = guide.getContext("2d");
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.strokes = [];
      this.redoStack = [];
      this.current = null;
      this.tool = "pen";
      this.size = 2.4;
      this.drawing = false;
      this.w = 0;
      this.h = 0;
      this.onStrokeEnd = null;
      this.getGuide = () => null;
      this._showTimer = 0;
      this._up = () => this.up();
      this._resize = () => this.resize();
      ink.addEventListener("pointerdown", (e) => this.down(e), { passive: false });
      ink.addEventListener("pointermove", (e) => this.move(e), { passive: false });
      window.addEventListener("pointerup", this._up);
      window.addEventListener("pointercancel", this._up);
      window.addEventListener("resize", this._resize);
      if (typeof ResizeObserver === "function") {
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(sheet);
      }
      ink.style.cursor = "crosshair";
    }
    destroy() {
      this.stopShow();
      if (this.ro) this.ro.disconnect();
      window.removeEventListener("pointerup", this._up);
      window.removeEventListener("pointercancel", this._up);
      window.removeEventListener("resize", this._resize);
    }
    stopShow() {
      if (this._showTimer) clearTimeout(this._showTimer);
      this._showTimer = 0;
    }
    resize() {
      const w = Math.round(this.sheet.clientWidth);
      const h = Math.round(this.sheet.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (w < 2 || h < 2) return;
      if (w === this.w && h === this.h && dpr === this.dpr) return;
      this.w = w;
      this.h = h;
      this.dpr = dpr;
      [this.ink, this.guide].forEach((c) => {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      });
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.redrawInk();
      this.redrawGuide();
    }
    pos(e) {
      const r = this.ink.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / (r.width || 1),
        y: (e.clientY - r.top) / (r.height || 1),
        t: performance.now()
      };
    }
    down(e) {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      try { this.ink.setPointerCapture(e.pointerId); } catch (_) {}
      this.drawing = true;
      this.redoStack = [];
      this.current = { tool: this.tool, size: this.size, points: [this.pos(e)] };
      this.strokes.push(this.current);
    }
    move(e) {
      if (!this.drawing || !this.current) return;
      e.preventDefault();
      const raw = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : null;
      const events = raw && raw.length ? raw : [e];
      events.forEach((ev) => this.pushPoint(this.pos(ev)));
    }
    pushPoint(p) {
      const last = this.current.points[this.current.points.length - 1];
      const dx = (p.x - last.x) * this.w;
      const dy = (p.y - last.y) * this.h;
      if (Math.hypot(dx, dy) < 0.6) return;
      this.current.points.push(p);
      this.drawSegment(this.ctx, this.current, this.current.points.length - 2);
    }
    up() {
      if (!this.drawing) return;
      this.drawing = false;
      if (this.current && this.current.points.length === 1) {
        const p = this.current.points[0];
        this.current.points.push({ x: p.x + 0.6 / (this.w || 1), y: p.y, t: p.t + 16 });
        this.drawSegment(this.ctx, this.current, 0);
      }
      this.current = null;
      if (this.onStrokeEnd) this.onStrokeEnd();
    }
    px(pt) {
      return { x: pt.x * this.w, y: pt.y * this.h, t: pt.t };
    }
    drawSegment(ctx, stroke, i) {
      const pts = stroke.points;
      if (i < 0 || i >= pts.length - 1) return;
      const a = this.px(pts[i]);
      const b = this.px(pts[i + 1]);
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const dt = Math.max(8, b.t - a.t);
      const speed = dist / dt;
      let width = stroke.size * (1.35 - Math.min(speed * 18, 0.75));
      if (stroke.tool === "pencil") width *= 0.85;
      if (stroke.tool === "eraser") width = stroke.size * 6;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else if (stroke.tool === "pencil") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(40, 34, 28, 0.45)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "#1c1814";
      }
      ctx.lineWidth = Math.max(0.7, width);
      ctx.beginPath();
      if (i === 0) {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      } else {
        const p0 = this.px(pts[i - 1]);
        ctx.moveTo((p0.x + a.x) / 2, (p0.y + a.y) / 2);
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      ctx.stroke();
      ctx.restore();
    }
    redrawInk() {
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.strokes.forEach((s) => {
        for (let i = 0; i < s.points.length - 1; i++) this.drawSegment(this.ctx, s, i);
      });
    }
    redrawGuide() {
      this.stopShow();
      this.gctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.gctx.clearRect(0, 0, this.w, this.h);
      const fn = this.getGuide && this.getGuide();
      if (!fn) return;
      this.gctx.save();
      this.gctx.globalAlpha = state.ghostOpacity;
      fn(this.gctx, this.w, this.h);
      this.gctx.restore();
    }
    showGuide(getFn) {
      this.stopShow();
      const fn = getFn ? getFn() : (this.getGuide && this.getGuide());
      if (!fn) return;
      const strokes = captureGuide(fn, this.w, this.h);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!strokes.length || reduce) {
        this.redrawGuide();
        return;
      }
      this.gctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.gctx.clearRect(0, 0, this.w, this.h);
      let i = 0;
      const drawNext = () => {
        if (i >= strokes.length) return;
        this.gctx.save();
        this.gctx.globalAlpha = state.ghostOpacity;
        replayOp(this.gctx, strokes[i]);
        this.gctx.restore();
        i += 1;
        this._showTimer = setTimeout(drawNext, 80);
      };
      drawNext();
    }
    undo() {
      if (!this.strokes.length) return;
      this.redoStack.push(this.strokes.pop());
      this.redrawInk();
    }
    redo() {
      if (!this.redoStack.length) return;
      this.strokes.push(this.redoStack.pop());
      this.redrawInk();
    }
    clear() {
      this.strokes = [];
      this.redoStack = [];
      this.redrawInk();
    }
    composite() {
      const out = document.createElement("canvas");
      out.width = this.ink.width;
      out.height = this.ink.height;
      const c = out.getContext("2d");
      c.fillStyle = "#f3eee4";
      c.fillRect(0, 0, out.width, out.height);
      if (state.ghost && !state.free) c.drawImage(this.guide, 0, 0);
      c.drawImage(this.ink, 0, 0);
      return out;
    }
    exportPNG(name) {
      const out = this.composite();
      const a = document.createElement("a");
      a.href = out.toDataURL("image/png");
      a.download = `${(name || "sketch").toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      toast("Saved PNG");
    }
  }

  function captureGuide(fn, w, h) {
    const strokes = [];
    let ops = [];
    const ctx = {
      strokeStyle: "#000",
      fillStyle: "#000",
      lineWidth: 1,
      save() {},
      restore() {},
      beginPath() { ops = []; },
      moveTo(x, y) { ops.push(["M", x, y]); },
      lineTo(x, y) { ops.push(["L", x, y]); },
      quadraticCurveTo(a, b, x, y) { ops.push(["Q", a, b, x, y]); },
      bezierCurveTo(a, b, c, d, e, f) { ops.push(["B", a, b, c, d, e, f]); },
      closePath() { ops.push(["Z"]); },
      ellipse(x, y, rx, ry, rot, a0, a1) { ops.push(["E", x, y, rx, ry, rot, a0, a1]); },
      rect(x, y, rw, rh) { ops.push(["R", x, y, rw, rh]); },
      arc(x, y, r, a0, a1) { ops.push(["A", x, y, r, a0, a1]); },
      stroke() {
        strokes.push({ kind: "stroke", style: this.strokeStyle, width: this.lineWidth, ops });
        ops = [];
      },
      fill() {
        strokes.push({ kind: "fill", style: this.fillStyle, ops });
        ops = [];
      }
    };
    fn(ctx, w, h);
    return strokes;
  }
  function replayOp(ctx, s) {
    ctx.beginPath();
    s.ops.forEach((op) => {
      if (op[0] === "M") ctx.moveTo(op[1], op[2]);
      else if (op[0] === "L") ctx.lineTo(op[1], op[2]);
      else if (op[0] === "Q") ctx.quadraticCurveTo(op[1], op[2], op[3], op[4]);
      else if (op[0] === "B") ctx.bezierCurveTo(op[1], op[2], op[3], op[4], op[5], op[6]);
      else if (op[0] === "E") ctx.ellipse(op[1], op[2], Math.max(0.5, op[3]), Math.max(0.5, op[4]), op[5], op[6], op[7]);
      else if (op[0] === "R") ctx.rect(op[1], op[2], op[3], op[4]);
      else if (op[0] === "A") ctx.arc(op[1], op[2], Math.max(0.5, op[3]), op[4], op[5]);
      else if (op[0] === "Z") ctx.closePath();
    });
    if (s.kind === "fill") {
      ctx.fillStyle = s.style;
      ctx.fill();
    } else {
      ctx.strokeStyle = s.style;
      ctx.lineWidth = s.width;
      ctx.stroke();
    }
  }

  function penIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l4.5-1.2L19 8.3a1.8 1.8 0 0 0-2.5-2.6L6 16.3 4 20z"/></svg>`;
  }
  function pencilIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l3-1 11-11 2 2L9 21l-5-1z"/><path d="M14 6l2.5 2.5"/></svg>`;
  }
  function eraserIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 16l8-8 6 6-8 8H6l-2-2z"/><path d="M9 21h11"/></svg>`;
  }
  function undoIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 7H5V3"/><path d="M5 7a8 8 0 1 1-1 5"/></svg>`;
  }
  function redoIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 7h4V3"/><path d="M19 7a8 8 0 1 0 1 5"/></svg>`;
  }
  function clearIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M8 7l1 13h6l1-13"/></svg>`;
  }

  function boot() {
    app = document.getElementById("app");
    if (!app) return;
    if (started && app.childElementCount > 0) return;
    if (!started) {
      started = true;
      if (window.matchMedia("(max-width: 840px)").matches) state.coachOpen = false;
      window.addEventListener("keydown", onKey);
      load();
    }
    render();
    loadBook();
  }

  window.startSketchDesk = function (host) {
    if (!host) return;
    if (!host.querySelector("#app")) {
      const el = document.createElement("div");
      el.id = "app";
      host.appendChild(el);
    }
    boot();
  };

  if (document.getElementById("app")) boot();
})();
