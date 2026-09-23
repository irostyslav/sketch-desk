(() => {
  const STORE = "sketch-desk-v1";
  const state = {
    view: "library", lessonId: null, step: 0, tool: "pen", size: 2.4,
    ghost: true, completed: {}, lastLesson: null, streak: 0, lastDay: null, free: false
  };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || "{}");
      Object.assign(state, {
        completed: raw.completed || {}, lastLesson: raw.lastLesson || null,
        streak: raw.streak || 0, lastDay: raw.lastDay || null
      });
    } catch (_) {}
    tickStreak();
  }
  function save() {
    localStorage.setItem(STORE, JSON.stringify({
      completed: state.completed, lastLesson: state.lastLesson, streak: state.streak, lastDay: state.lastDay
    }));
  }
  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function tickStreak() {
    const t = todayKey();
    if (state.lastDay === t || !state.lastDay) return;
    if ((new Date(t) - new Date(state.lastDay)) / 86400000 > 1.5) state.streak = 0;
  }
  function markPracticed() {
    const t = todayKey();
    if (state.lastDay !== t) {
      const prev = state.lastDay ? (new Date(t) - new Date(state.lastDay)) / 86400000 : 99;
      state.streak = prev <= 1.5 ? state.streak + 1 : 1;
      state.lastDay = t;
      save();
    }
  }

  const app = document.getElementById("app");
  function render() { state.view === "library" ? renderLibrary() : renderStudio(); }
  function doneCount() { return Object.values(state.completed).filter(Boolean).length; }

  function renderLibrary() {
    const next = LESSONS.find((l) => l.id === state.lastLesson) || LESSONS.find((l) => !state.completed[l.id]) || LESSONS[0];
    app.innerHTML = `
      <div class="library">
        <div class="topbar">
          <div>
            <h1 class="brand">Sketch <span>Desk</span></h1>
            <p class="lede">A quiet page for learning freehand drawing — trees, streets, and the hand that makes them.</p>
          </div>
          <div class="stats">
            <div class="stat">Streak <b>${state.streak} day${state.streak === 1 ? "" : "s"}</b></div>
            <div class="stat">Lessons <b>${doneCount()} / ${LESSONS.length}</b></div>
          </div>
        </div>
        <div class="hero">
          <div class="card continue">
            <p class="eyebrow">${state.completed[next.id] ? "Practice again" : "Continue"}</p>
            <h2>${next.title}</h2>
            <p>${next.blurb}</p>
            <div class="actions">
              <button class="btn btn-ink" data-open="${next.id}">Open lesson</button>
              <button class="btn btn-ghost" data-free="1">Blank page</button>
            </div>
          </div>
          <div class="card free-card">
            <div>
              <p class="eyebrow">How this works</p>
              <h3>See a faint guide. Draw on top.</h3>
              <p style="color:var(--ink-soft);margin:0;font-size:14px;line-height:1.45">Each lesson is a short drill. Follow the coach, keep the ghost on while you learn, turn it off when you want to test yourself.</p>
            </div>
            <p style="margin:16px 0 0;font-size:13px;color:var(--ink-soft)">Ink on paper. Undo with Z. Toggle ghost with G.</p>
          </div>
        </div>
        ${PATHS.map((p) => {
          const items = LESSONS.filter((l) => l.path === p.id);
          return `<div class="path-head"><h2>${p.title}</h2><p>${p.blurb}</p></div>
            <div class="grid">${items.map((l) => `
              <button class="card lesson" data-open="${l.id}">
                <div class="meta"><span>${l.level}</span><span>${l.minutes} min</span></div>
                <h3>${l.title}</h3><p>${l.blurb}</p>
                <div class="foot"><span>${l.steps.length} step${l.steps.length > 1 ? "s" : ""}</span>
                <span class="pill ${state.completed[l.id] ? "done" : ""}">${state.completed[l.id] ? "Drawn" : "To draw"}</span></div>
              </button>`).join("")}</div>`;
        }).join("")}
        <p class="footnote">Tree and shop-house sequences follow the public method from Hariz Razif’s architectural sketch posts: structure first, masses second, value third, people last. This app is a practice companion, not his product.</p>
      </div>`;
    app.querySelectorAll("[data-open]").forEach((el) => { el.onclick = () => openLesson(el.dataset.open); });
    app.querySelector("[data-free]").onclick = () => openFree();
  }

  let pad = null;
  function openLesson(id) {
    state.view = "studio"; state.free = false; state.lessonId = id; state.step = 0; state.lastLesson = id; save(); renderStudio();
  }
  function openFree() { state.view = "studio"; state.free = true; state.lessonId = null; renderStudio(); }
  function currentLesson() { return LESSONS.find((l) => l.id === state.lessonId); }

  function renderStudio() {
    const lesson = currentLesson();
    const step = lesson ? lesson.steps[state.step] : null;
    const title = state.free ? "Blank page" : lesson.title;
    const stepLabel = lesson ? `Step ${state.step + 1} of ${lesson.steps.length}` : "Free sketch";
    app.innerHTML = `
      <div class="studio">
        <div class="studio-bar">
          <button class="btn btn-ghost" id="back">Library</button>
          <h1>${title}</h1>
          ${lesson ? `<div class="step-dots">${lesson.steps.map((_, i) => `<span class="dot ${i === state.step ? "on" : ""} ${i < state.step ? "done" : ""}"></span>`).join("")}</div>` : ""}
        </div>
        <div class="workspace">
          <aside class="coach">
            <p class="step-kicker">${stepLabel}</p>
            <h2>${step ? step.title : "Draw anything"}</h2>
            <p>${step ? step.coach : "No guide, no timer. Warm the hand, test a composition, or copy something from the room."}</p>
            ${step ? `<div class="hint">${step.hint}</div>` : ""}
            <div class="coach-nav">
              ${lesson ? `<button class="btn btn-ghost" id="prev" ${state.step === 0 ? "disabled" : ""}>Back</button>
                <button class="btn btn-ink" id="next">${state.step === lesson.steps.length - 1 ? "Mark drawn" : "Next step"}</button>` : `<button class="btn btn-ghost" id="back2">Back to library</button>`}
            </div>
          </aside>
          <div class="paper-wrap"><div class="sheet" id="sheet"><canvas id="guide"></canvas><canvas id="ink"></canvas></div></div>
        </div>
        <div class="toolbar">
          <button class="tool ${state.tool === "pen" ? "on" : ""}" data-tool="pen" title="Pen (P)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l4.5-1.2L19 8.3a1.8 1.8 0 0 0-2.5-2.6L6 16.3 4 20z"/></svg></button>
          <button class="tool ${state.tool === "pencil" ? "on" : ""}" data-tool="pencil" title="Pencil"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l3-1 11-11 2 2L9 21l-5-1z"/><path d="M14 6l2.5 2.5"/></svg></button>
          <button class="tool ${state.tool === "eraser" ? "on" : ""}" data-tool="eraser" title="Eraser (E)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 16l8-8 6 6-8 8H6l-2-2z"/><path d="M9 21h11"/></svg></button>
          <div class="sep"></div>
          <label class="slider">Nib <input id="size" type="range" min="1" max="8" step="0.2" value="${state.size}" /></label>
          <div class="sep"></div>
          <button class="tool" id="undo" title="Undo (Z)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 7H5V3"/><path d="M5 7a8 8 0 1 1-1 5"/></svg></button>
          <button class="tool" id="redo" title="Redo (Shift+Z)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 7h4V3"/><path d="M19 7a8 8 0 1 0 1 5"/></svg></button>
          <button class="tool" id="clear" title="Clear page"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M8 7l1 13h6l1-13"/></svg></button>
          <button class="btn btn-ghost" id="save">Save PNG</button>
          ${lesson ? `<label class="toggle"><input type="checkbox" id="ghost" ${state.ghost ? "checked" : ""} /> Ghost guide</label>` : ""}
        </div>
        <div class="toast" id="toast"></div>
      </div>`;
    document.getElementById("back").onclick = () => { state.view = "library"; render(); };
    const back2 = document.getElementById("back2");
    if (back2) back2.onclick = () => { state.view = "library"; render(); };
    const prev = document.getElementById("prev");
    const next = document.getElementById("next");
    if (prev) prev.onclick = () => { if (state.step > 0) { state.step -= 1; renderStudio(); } };
    if (next) next.onclick = () => {
      if (state.step < lesson.steps.length - 1) { state.step += 1; renderStudio(); }
      else completeLesson(lesson);
    };
    app.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.onclick = () => {
        state.tool = btn.dataset.tool; pad.tool = state.tool;
        app.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b === btn));
      };
    });
    document.getElementById("size").oninput = (e) => { state.size = Number(e.target.value); pad.size = state.size; };
    document.getElementById("undo").onclick = () => pad.undo();
    document.getElementById("redo").onclick = () => pad.redo();
    document.getElementById("clear").onclick = () => pad.clear();
    document.getElementById("save").onclick = () => pad.exportPNG(title);
    const ghost = document.getElementById("ghost");
    if (ghost) ghost.onchange = (e) => { state.ghost = e.target.checked; pad.redrawGuide(); };
    pad = new SketchPad(document.getElementById("ink"), document.getElementById("guide"), document.getElementById("sheet"));
    pad.tool = state.tool; pad.size = state.size; pad.onStrokeEnd = () => markPracticed();
    pad.getGuide = () => {
      if (!lesson || !state.ghost) return null;
      return GUIDES[lesson.steps[state.step].guide];
    };
    pad.resize(); pad.redrawGuide();
  }

  function completeLesson(lesson) {
    state.completed[lesson.id] = true; markPracticed(); save();
    const wrap = document.createElement("div");
    wrap.className = "complete-modal";
    wrap.innerHTML = `<div class="complete-card"><p class="eyebrow">Page finished</p><h2>${lesson.title}</h2><p style="color:var(--ink-soft)">Saved to your streak. Next time, try it with the ghost off.</p><div class="actions" style="margin-top:16px"><button class="btn btn-ink" id="to-lib">Back to library</button><button class="btn btn-ghost" id="again">Draw it again</button></div></div>`;
    app.appendChild(wrap);
    wrap.querySelector("#to-lib").onclick = () => { state.view = "library"; render(); };
    wrap.querySelector("#again").onclick = () => { state.step = 0; renderStudio(); };
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg; el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1600);
  }

  class SketchPad {
    constructor(ink, guide, sheet) {
      this.ink = ink; this.guide = guide; this.sheet = sheet;
      this.ctx = ink.getContext("2d"); this.gctx = guide.getContext("2d");
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.strokes = []; this.redoStack = []; this.current = null;
      this.tool = "pen"; this.size = 2.4; this.drawing = false;
      this.onStrokeEnd = null; this.getGuide = () => null;
      const on = (el, ev, fn) => el.addEventListener(ev, fn, { passive: false });
      on(ink, "pointerdown", (e) => this.down(e));
      on(ink, "pointermove", (e) => this.move(e));
      on(window, "pointerup", () => this.up());
      on(window, "resize", () => this.resize());
    }
    resize() {
      const rect = this.sheet.getBoundingClientRect();
      const w = Math.max(320, rect.width), h = Math.max(320, rect.height);
      [this.ink, this.guide].forEach((c) => { c.width = w * this.dpr; c.height = h * this.dpr; });
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.gctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.w = w; this.h = h; this.redrawInk(); this.redrawGuide();
    }
    pos(e) {
      const r = this.ink.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
    }
    down(e) {
      e.preventDefault(); this.ink.setPointerCapture(e.pointerId); this.drawing = true; this.redoStack = [];
      const p = this.pos(e); this.current = { tool: this.tool, size: this.size, points: [p] }; this.strokes.push(this.current);
    }
    move(e) {
      if (!this.drawing || !this.current) return;
      const p = this.pos(e), last = this.current.points[this.current.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 0.6) return;
      this.current.points.push(p);
      this.drawSegment(this.ctx, this.current, this.current.points.length - 2);
    }
    up() {
      if (!this.drawing) return;
      this.drawing = false; this.current = null;
      if (this.onStrokeEnd) this.onStrokeEnd();
    }
    drawSegment(ctx, stroke, i) {
      const pts = stroke.points;
      if (i < 0 || i >= pts.length - 1) return;
      const a = pts[i], b = pts[i + 1];
      const dist = Math.hypot(b.x - a.x, b.y - a.y), dt = Math.max(8, b.t - a.t), speed = dist / dt;
      let width = stroke.size * (1.35 - Math.min(speed * 18, 0.75));
      if (stroke.tool === "pencil") width *= 0.85;
      if (stroke.tool === "eraser") width = stroke.size * 6;
      ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (stroke.tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; ctx.strokeStyle = "rgba(0,0,0,1)"; }
      else if (stroke.tool === "pencil") { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = "rgba(40,34,28,0.42)"; }
      else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = "#1c1814"; }
      ctx.lineWidth = Math.max(0.7, width); ctx.beginPath();
      if (i === 0) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
      else {
        const p0 = pts[i - 1];
        ctx.moveTo((p0.x + a.x) / 2, (p0.y + a.y) / 2);
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      ctx.stroke(); ctx.restore();
    }
    redrawInk() {
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.strokes.forEach((s) => { for (let i = 0; i < s.points.length - 1; i++) this.drawSegment(this.ctx, s, i); });
    }
    redrawGuide() {
      this.gctx.clearRect(0, 0, this.w, this.h);
      const fn = this.getGuide && this.getGuide();
      if (fn) fn(this.gctx, this.w, this.h);
    }
    undo() { if (!this.strokes.length) return; this.redoStack.push(this.strokes.pop()); this.redrawInk(); }
    redo() { if (!this.redoStack.length) return; this.strokes.push(this.redoStack.pop()); this.redrawInk(); }
    clear() { this.strokes = []; this.redoStack = []; this.redrawInk(); }
    exportPNG(name) {
      const out = document.createElement("canvas");
      out.width = this.ink.width; out.height = this.ink.height;
      const c = out.getContext("2d"); c.fillStyle = "#f3eee4"; c.fillRect(0, 0, out.width, out.height);
      c.drawImage(this.guide, 0, 0); c.drawImage(this.ink, 0, 0);
      const a = document.createElement("a"); a.href = out.toDataURL("image/png");
      a.download = `${(name || "sketch").toLowerCase().replace(/\s+/g, "-")}.png`; a.click(); toast("Saved PNG");
    }
  }

  window.addEventListener("keydown", (e) => {
    if (state.view !== "studio") return;
    if ((e.target && e.target.tagName) === "INPUT") return;
    if (e.key.toLowerCase() === "z") { if (e.ctrlKey || e.metaKey) e.preventDefault(); e.shiftKey ? pad && pad.redo() : pad && pad.undo(); }
    if (e.key.toLowerCase() === "e") { state.tool = "eraser"; if (pad) pad.tool = "eraser"; document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === "eraser")); }
    if (e.key.toLowerCase() === "p") { state.tool = "pen"; if (pad) pad.tool = "pen"; document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === "pen")); }
    if (e.key.toLowerCase() === "g") { state.ghost = !state.ghost; const box = document.getElementById("ghost"); if (box) box.checked = state.ghost; pad && pad.redrawGuide(); }
    if (e.key === "[") { state.size = Math.max(1, state.size - 0.3); if (pad) pad.size = state.size; const sl = document.getElementById("size"); if (sl) sl.value = state.size; }
    if (e.key === "]") { state.size = Math.min(8, state.size + 0.3); if (pad) pad.size = state.size; const sl = document.getElementById("size"); if (sl) sl.value = state.size; }
  });

  load(); render();
})();
