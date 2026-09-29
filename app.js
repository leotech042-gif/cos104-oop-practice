/* COS 104 OOP Practice - compact SPA */
const STORAGE_KEY = "cos104_progress_v1";

const state = {
  view: "dashboard",
  filterDiff: "all",
  filterTopic: "all",
  practiceIdx: 0,
  practiceQueue: [],
  practiceSize: 15,
  answered: {},
  exam: null,
  history: loadHistory()
};

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { sessions: [], byTopic: {}, byDiff: {} };
  } catch {
    return { sessions: [], byTopic: {}, byDiff: {} };
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function bindNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.onclick = () => {
      state.view = btn.dataset.view;
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render();
    };
  });
}

function render() {
  const app = $("#app");
  if (!app) return;
  if (state.view === "dashboard") app.innerHTML = renderDashboard();
  else if (state.view === "practice") app.innerHTML = renderPractice();
  else if (state.view === "exam") app.innerHTML = renderExam();
  else if (state.view === "performance") app.innerHTML = renderPerformance();
  bindEvents();
}

function topics() {
  return [...new Set(QUESTIONS.map(q => q.topic))].sort();
}

function countBy(fn) {
  const m = {};
  QUESTIONS.forEach(q => { const k = fn(q); m[k] = (m[k] || 0) + 1; });
  return m;
}

function renderDashboard() {
  const total = QUESTIONS.length;
  const answered = Object.keys(state.answered).length;
  const correct = Object.values(state.answered).filter(a => a.correct).length;
  const pct = total ? Math.round((answered / total) * 100) : 0;
  const acc = answered ? Math.round((correct / answered) * 100) : 0;
  const byDiff = countBy(q => q.difficulty);
  const sessions = state.history.sessions.length;
  return `
    <div class="section">
      <h1>Dashboard</h1>
      <p class="muted">COS 104 Computing Practice · C++ OOP · ${total} questions · Easy → Very Hard</p>
    </div>
    <div class="grid-4 section">
      <div class="card stat"><div class="stat-val">${total}</div><div class="stat-label">Questions</div></div>
      <div class="card stat"><div class="stat-val">${answered}</div><div class="stat-label">Attempted</div></div>
      <div class="card stat"><div class="stat-val">${acc}%</div><div class="stat-label">Accuracy</div></div>
      <div class="card stat"><div class="stat-val">${sessions}</div><div class="stat-label">Exam Sessions</div></div>
    </div>
    <div class="card section">
      <h2>Progress</h2>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <p class="muted">${answered} / ${total} practiced (${pct}%)</p>
    </div>
    <div class="grid-2 section">
      <div class="card">
        <h2>By Difficulty</h2>
        <div class="topic-list" style="margin-top:0.75rem">
          ${["easy","medium","hard","veryhard"].map(d => `
            <span class="badge badge-${d}">${d === "veryhard" ? "very hard" : d} · ${byDiff[d]||0}</span>
          `).join("")}
        </div>
      </div>
      <div class="card">
        <h2>Topics Covered</h2>
        <div class="topic-list">
          ${topics().map(t => `<span class="topic-chip">${t}</span>`).join("")}
        </div>
      </div>
    </div>
    <div class="card section">
      <h2>Quick Start</h2>
      <p class="muted" style="margin-bottom:0.75rem">Practice any difficulty or jump into a timed exam. Answers include step-by-step breakdowns. Sessions are 10–60 questions, always shuffled.</p>
      <div class="actions">
        <button class="btn btn-primary" data-go="practice">Start Practice</button>
        <button class="btn btn-ghost" data-go="exam">Take Exam</button>
        <button class="btn btn-ghost" data-go="performance">View Performance</button>
      </div>
    </div>
    <div class="card">
      <h2>Syllabus Snapshot (from PDF + external)</h2>
      <ul class="breakdown" style="margin-top:0.5rem;color:var(--muted)">
        <li>C++ Classes · Encapsulation · Access Specifiers · Constructors</li>
        <li>Four Pillars: Encapsulation, Abstraction, Inheritance, Polymorphism</li>
        <li>Reference Types · Stack vs Heap</li>
        <li>Function Overloading · Signature rules</li>
        <li>Copy Constructor · Shallow vs Deep · Rule of Three/Five/Zero</li>
        <li>Template Classes · Instantiation · Header-only</li>
        <li>Inheritance vs Composition · Types of inheritance</li>
        <li>Virtual Functions · vtable/vptr · Pure virtual · Virtual destructors</li>
        <li>Virtual Base Classes · Diamond Problem · Construction order</li>
        <li>Exception Handling with OOP principles</li>
      </ul>
    </div>
  `;
}

function filteredPool() {
  return QUESTIONS.filter(q => {
    if (state.filterDiff !== "all" && q.difficulty !== state.filterDiff) return false;
    if (state.filterTopic !== "all" && q.topic !== state.filterTopic) return false;
    return true;
  });
}

function startPracticeSession() {
  const pool = filteredPool();
  let n = state.practiceSize || 15;
  n = Math.max(10, Math.min(60, n, pool.length));
  if (pool.length < 10) n = pool.length;
  if (n === 0) { alert("No questions match the current filters."); return; }
  state.practiceQueue = shuffle(pool).slice(0, n);
  state.practiceIdx = 0;
  render();
}

function renderPractice() {
  if (!state.practiceQueue.length) {
    const pool = filteredPool();
    return `
    <div class="section">
      <h1>Practice</h1>
      <p class="muted">Pick filters, choose 10–60 questions, then start a shuffled session. Each answer shows a full breakdown.</p>
    </div>
    <div class="card">
      <h2>Session setup</h2>
      <div class="filters" style="margin-top:0.75rem">
        <select class="select" id="f-diff">
          <option value="all" ${state.filterDiff==="all"?"selected":""}>All difficulties</option>
          <option value="easy" ${state.filterDiff==="easy"?"selected":""}>Easy</option>
          <option value="medium" ${state.filterDiff==="medium"?"selected":""}>Medium</option>
          <option value="hard" ${state.filterDiff==="hard"?"selected":""}>Hard</option>
          <option value="veryhard" ${state.filterDiff==="veryhard"?"selected":""}>Very Hard</option>
        </select>
        <select class="select" id="f-topic">
          <option value="all" ${state.filterTopic==="all"?"selected":""}>All topics</option>
          ${topics().map(t => `<option value="${t}" ${state.filterTopic===t?"selected":""}>${t}</option>`).join("")}
        </select>
        <label class="muted">Questions
          <select class="select" id="p-size">
            ${[10,15,20,25,30,40,50,60].map(n => {
              const disabled = n > pool.length ? "disabled" : "";
              const sel = n === (state.practiceSize||15) ? "selected" : "";
              return `<option value="${n}" ${sel} ${disabled}>${n}${n>pool.length?" (not enough)":""}</option>`;
            }).join("")}
          </select>
        </label>
      </div>
      <p class="muted" style="margin:0.6rem 0">${pool.length} questions available with current filters (bank total: ${QUESTIONS.length})</p>
      <div class="actions">
        <button class="btn btn-primary" id="start-practice" ${pool.length===0?"disabled":""}>Start shuffled session</button>
      </div>
    </div>`;
  }
  const list = state.practiceQueue;
  if (state.practiceIdx >= list.length) state.practiceIdx = list.length - 1;
  const q = list[state.practiceIdx];
  const ans = state.answered[q.id];
  const showResult = !!ans;
  return `
    <div class="section" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
      <div>
        <h1>Practice</h1>
        <p class="muted">Question ${state.practiceIdx + 1} of ${list.length} (shuffled)</p>
      </div>
      <button class="btn btn-ghost btn-sm" id="end-practice">End session</button>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${((state.practiceIdx)/list.length)*100}%"></div></div>
    <div class="card q-card" style="margin-top:1rem">
      <div class="q-meta">
        <span class="badge badge-${q.difficulty}">${q.difficulty === "veryhard" ? "very hard" : q.difficulty}</span>
        <span class="topic-chip" style="cursor:default">${q.topic}</span>
        <span class="muted">#${q.id}</span>
      </div>
      <div class="q-text">${q.question}</div>
      ${q.code ? `<pre class="q-code">${escapeHtml(q.code)}</pre>` : ""}
      <div class="options" id="opts">
        ${q.options.map((opt, i) => {
          let cls = "option";
          if (showResult) {
            if (i === q.answer) cls += " correct";
            else if (i === ans.selected) cls += " wrong";
          } else if (ans && ans.selected === i) cls += " selected";
          return `
            <label class="${cls}" data-idx="${i}">
              <input type="radio" name="ans" value="${i}" ${ans && ans.selected===i?"checked":""} ${showResult?"disabled":""} />
              <span>${escapeHtml(opt)}</span>
            </label>`;
        }).join("")}
      </div>
      ${showResult ? `
        <div class="explanation">
          <strong>${ans.correct ? "Correct" : "Incorrect"}.</strong> ${q.explanation}
          <ul class="breakdown">
            ${q.breakdown.map(b => `<li>${b}</li>`).join("")}
          </ul>
        </div>` : ""}
      <div class="actions">
        ${!showResult ? `<button class="btn btn-primary" id="check-btn" disabled>Check Answer</button>` : ""}
        <button class="btn btn-ghost" id="prev-q" ${state.practiceIdx===0?"disabled":""}>Previous</button>
        <button class="btn btn-ghost" id="next-q" ${state.practiceIdx>=list.length-1?"disabled":""}>Next</button>
        ${showResult ? `<button class="btn btn-ghost btn-sm" id="reset-q">Try again</button>` : ""}
      </div>
    </div>
  `;
}

function renderExam() {
  if (!state.exam) {
    return `
      <div class="section">
        <h1>Exam Mode</h1>
        <p class="muted">Timed set of mixed questions (10–60). Results saved to Performance. Always shuffled.</p>
      </div>
      <div class="card">
        <h2>Configure</h2>
        <div class="filters" style="margin-top:0.75rem">
          <label class="muted">Questions
            <select class="select" id="exam-n">
              <option value="10" selected>10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="60">60</option>
            </select>
          </label>
          <label class="muted">Minutes
            <select class="select" id="exam-t">
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
          <label class="muted">Difficulty mix
            <select class="select" id="exam-mix">
              <option value="all" selected>All levels</option>
              <option value="easy">Easy only</option>
              <option value="medium">Medium only</option>
              <option value="hard">Hard + Very Hard</option>
            </select>
          </label>
        </div>
        <div class="actions">
          <button class="btn btn-primary" id="start-exam">Start Exam</button>
        </div>
      </div>
    `;
  }
  const ex = state.exam;
  const q = ex.queue[ex.current];
  const selected = ex.answers[q.id];
  const remaining = Math.max(0, ex.duration - (Date.now() - ex.start));
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  if (remaining <= 0 && !ex.finished) { finishExam(); return renderExam(); }
  return `
    <div class="section" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
      <div>
        <h1>Exam</h1>
        <p class="muted">Question ${ex.current + 1} of ${ex.queue.length}</p>
      </div>
      <div class="timer" id="timer">${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}</div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${((ex.current)/ex.queue.length)*100}%"></div></div>
    <div class="card q-card" style="margin-top:1rem">
      <div class="q-meta">
        <span class="badge badge-${q.difficulty}">${q.difficulty === "veryhard" ? "very hard" : q.difficulty}</span>
        <span class="topic-chip" style="cursor:default">${q.topic}</span>
      </div>
      <div class="q-text">${q.question}</div>
      ${q.code ? `<pre class="q-code">${escapeHtml(q.code)}</pre>` : ""}
      <div class="options">
        ${q.options.map((opt, i) => `
          <label class="option ${selected===i?"selected":""}" data-exam-idx="${i}">
            <input type="radio" name="exam-ans" value="${i}" ${selected===i?"checked":""} />
            <span>${escapeHtml(opt)}</span>
          </label>`).join("")}
      </div>
      <div class="actions">
        <button class="btn btn-ghost" id="exam-prev" ${ex.current===0?"disabled":""}>Previous</button>
        ${ex.current < ex.queue.length - 1
          ? `<button class="btn btn-primary" id="exam-next">Next</button>`
          : `<button class="btn btn-primary" id="exam-finish">Finish Exam</button>`}
        <button class="btn btn-ghost btn-sm" id="exam-abort">Abort</button>
      </div>
    </div>
  `;
}

function startExam() {
  let n = parseInt($("#exam-n").value, 10);
  n = Math.max(10, Math.min(60, n));
  const t = parseInt($("#exam-t").value, 10);
  const mix = $("#exam-mix").value;
  let pool = [...QUESTIONS];
  if (mix === "easy") pool = pool.filter(q => q.difficulty === "easy");
  else if (mix === "medium") pool = pool.filter(q => q.difficulty === "medium");
  else if (mix === "hard") pool = pool.filter(q => q.difficulty === "hard" || q.difficulty === "veryhard");
  pool = shuffle(pool);
  if (pool.length < 10) {
    alert("Not enough questions for this mix (need at least 10). Try All levels.");
    return;
  }
  const queue = pool.slice(0, Math.min(n, pool.length));
  state.exam = {
    queue,
    current: 0,
    answers: {},
    start: Date.now(),
    duration: t * 60 * 1000,
    finished: false
  };
  render();
  startTimer();
}

let timerId = null;
function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (!state.exam || state.exam.finished) { clearInterval(timerId); return; }
    const rem = state.exam.duration - (Date.now() - state.exam.start);
    if (rem <= 0) {
      clearInterval(timerId);
      finishExam();
      render();
      return;
    }
    const el = $("#timer");
    if (el) {
      const m = Math.floor(rem / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      el.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }
  }, 1000);
}

function finishExam() {
  if (!state.exam || state.exam.finished) return;
  state.exam.finished = true;
  clearInterval(timerId);
  const ex = state.exam;
  let correct = 0;
  const details = [];
  ex.queue.forEach(q => {
    const sel = ex.answers[q.id];
    const ok = sel === q.answer;
    if (ok) correct++;
    details.push({ id: q.id, selected: sel, correct: ok, topic: q.topic, difficulty: q.difficulty });
    if (sel !== undefined) state.answered[q.id] = { selected: sel, correct: ok };
  });
  const score = Math.round((correct / ex.queue.length) * 100);
  const session = {
    date: new Date().toISOString(),
    total: ex.queue.length,
    correct,
    score,
    details,
    durationMs: Date.now() - ex.start
  };
  state.history.sessions.unshift(session);
  details.forEach(d => {
    if (!state.history.byTopic[d.topic]) state.history.byTopic[d.topic] = { correct: 0, total: 0 };
    state.history.byTopic[d.topic].total++;
    if (d.correct) state.history.byTopic[d.topic].correct++;
    if (!state.history.byDiff[d.difficulty]) state.history.byDiff[d.difficulty] = { correct: 0, total: 0 };
    state.history.byDiff[d.difficulty].total++;
    if (d.correct) state.history.byDiff[d.difficulty].correct++;
  });
  saveHistory();
  showExamResult(session);
  state.exam = null;
}

function showExamResult(session) {
  const body = `
    <h2>Exam Complete</h2>
    <p style="font-size:1.8rem;font-weight:700;margin:0.5rem 0">${session.score}%</p>
    <p class="muted">${session.correct} / ${session.total} correct · ${Math.round(session.durationMs/1000)}s</p>
    <div class="progress-bar" style="margin:0.75rem 0"><div class="progress-fill" style="width:${session.score}%"></div></div>
    <div class="actions">
      <button class="btn btn-primary" id="close-modal">Done</button>
      <button class="btn btn-ghost" data-go="performance">See Performance</button>
    </div>
  `;
  $("#modal-body").innerHTML = body;
  $("#modal").classList.remove("hidden");
  $("#close-modal")?.addEventListener("click", () => {
    $("#modal").classList.add("hidden");
    render();
  });
  $$("[data-go]").forEach(b => b.addEventListener("click", () => {
    $("#modal").classList.add("hidden");
    state.view = b.dataset.go;
    $$(".nav-btn").forEach(n => n.classList.toggle("active", n.dataset.view === state.view));
    render();
  }));
}

function renderPerformance() {
  const sessions = state.history.sessions;
  const byDiff = state.history.byDiff;
  const byTopic = state.history.byTopic;
  const diffs = ["easy","medium","hard","veryhard"];
  return `
    <div class="section">
      <h1>Performance</h1>
      <p class="muted">Local history of practice & exams. Clear data resets everything.</p>
    </div>
    <div class="grid-2 section">
      <div class="card">
        <h2>By Difficulty</h2>
        <div class="bar-chart">
          ${diffs.map(d => {
            const v = byDiff[d] || { correct: 0, total: 0 };
            const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
            const h = v.total ? Math.max(8, (pct / 100) * 100) : 4;
            return `
              <div class="bar-col">
                <div class="bar" style="height:${h}px" title="${pct}%"></div>
                <span class="bar-label">${d === "veryhard" ? "VH" : d.slice(0,1).toUpperCase()}</span>
                <span class="bar-label">${v.correct}/${v.total}</span>
              </div>`;
          }).join("")}
        </div>
      </div>
      <div class="card">
        <h2>By Topic (accuracy)</h2>
        ${Object.keys(byTopic).length === 0
          ? `<p class="muted" style="margin-top:0.75rem">No data yet.</p>`
          : `<div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.45rem">
              ${Object.entries(byTopic).map(([t, v]) => {
                const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0;
                return `
                  <div>
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem">
                      <span>${t}</span><span class="muted">${pct}% (${v.correct}/${v.total})</span>
                    </div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                  </div>`;
              }).join("")}
            </div>`}
      </div>
    </div>
    <div class="card section">
      <h2>Recent Exam Sessions</h2>
      ${sessions.length === 0
        ? `<p class="empty">No exams yet. Take one from the Exam tab.</p>`
        : `<div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem">
            ${sessions.slice(0, 8).map(s => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0;border-bottom:1px solid var(--border)">
                <div>
                  <strong>${s.score}%</strong>
                  <span class="muted"> · ${s.correct}/${s.total} · ${new Date(s.date).toLocaleString()}</span>
                </div>
                <span class="badge ${s.score >= 70 ? "badge-easy" : s.score >= 40 ? "badge-medium" : "badge-hard"}">${s.score >= 70 ? "Pass" : "Review"}</span>
              </div>`).join("")}
          </div>`}
    </div>
    <div class="actions">
      <button class="btn btn-ghost" id="clear-data">Clear all progress</button>
    </div>
  `;
}

function bindEvents() {
  $$("[data-go]").forEach(b => {
    b.addEventListener("click", () => {
      state.view = b.dataset.go;
      $$(".nav-btn").forEach(n => n.classList.toggle("active", n.dataset.view === state.view));
      render();
    });
  });
  const fd = $("#f-diff");
  if (fd) fd.addEventListener("change", e => { state.filterDiff = e.target.value; render(); });
  const ft = $("#f-topic");
  if (ft) ft.addEventListener("change", e => { state.filterTopic = e.target.value; render(); });
  const psz = $("#p-size");
  if (psz) psz.addEventListener("change", e => { state.practiceSize = parseInt(e.target.value, 10); });
  $("#start-practice")?.addEventListener("click", startPracticeSession);
  $("#end-practice")?.addEventListener("click", () => {
    state.practiceQueue = [];
    state.practiceIdx = 0;
    render();
  });
  $$("#opts .option").forEach(lab => {
    lab.addEventListener("click", () => {
      if (lab.querySelector("input").disabled) return;
      $$("#opts .option").forEach(o => o.classList.remove("selected"));
      lab.classList.add("selected");
      lab.querySelector("input").checked = true;
      const btn = $("#check-btn");
      if (btn) btn.disabled = false;
    });
  });
  const checkBtn = $("#check-btn");
  if (checkBtn) {
    checkBtn.addEventListener("click", () => {
      const list = state.practiceQueue;
      const q = list[state.practiceIdx];
      const sel = parseInt(document.querySelector('input[name="ans"]:checked')?.value, 10);
      if (isNaN(sel)) return;
      const correct = sel === q.answer;
      state.answered[q.id] = { selected: sel, correct };
      if (!state.history.byTopic[q.topic]) state.history.byTopic[q.topic] = { correct: 0, total: 0 };
      state.history.byTopic[q.topic].total++;
      if (correct) state.history.byTopic[q.topic].correct++;
      if (!state.history.byDiff[q.difficulty]) state.history.byDiff[q.difficulty] = { correct: 0, total: 0 };
      state.history.byDiff[q.difficulty].total++;
      if (correct) state.history.byDiff[q.difficulty].correct++;
      saveHistory();
      render();
    });
  }
  $("#prev-q")?.addEventListener("click", () => { state.practiceIdx = Math.max(0, state.practiceIdx - 1); render(); });
  $("#next-q")?.addEventListener("click", () => {
    const list = state.practiceQueue;
    state.practiceIdx = Math.min(list.length - 1, state.practiceIdx + 1);
    render();
  });
  $("#reset-q")?.addEventListener("click", () => {
    const q = state.practiceQueue[state.practiceIdx];
    if (q) delete state.answered[q.id];
    render();
  });
  $("#start-exam")?.addEventListener("click", startExam);
  $("#exam-prev")?.addEventListener("click", () => { state.exam.current--; render(); startTimer(); });
  $("#exam-next")?.addEventListener("click", () => { state.exam.current++; render(); startTimer(); });
  $("#exam-finish")?.addEventListener("click", () => { finishExam(); render(); });
  $("#exam-abort")?.addEventListener("click", () => {
    if (confirm("Abort exam? Progress for this attempt will be discarded.")) {
      clearInterval(timerId);
      state.exam = null;
      render();
    }
  });
  $$("[data-exam-idx]").forEach(lab => {
    lab.addEventListener("click", () => {
      const idx = parseInt(lab.dataset.examIdx, 10);
      const q = state.exam.queue[state.exam.current];
      state.exam.answers[q.id] = idx;
      render();
      startTimer();
    });
  });
  $("#clear-data")?.addEventListener("click", () => {
    if (confirm("Clear all local progress and exam history?")) {
      state.answered = {};
      state.history = { sessions: [], byTopic: {}, byDiff: {} };
      saveHistory();
      render();
    }
  });
  $("#modal-close")?.addEventListener("click", () => $("#modal").classList.add("hidden"));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """);
}

bindNav();
render();
