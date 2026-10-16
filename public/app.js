"use strict";
// DV Interview Lab — client. Hash routes: #/  (list)   #/p/<id>  (problem)

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const app = $("#app");

const store = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};

let QUESTIONS = [];
let FILTERED = [];
const PAGE_SIZE = 50;
const state = store.get("dvlab:filters", { cat: "", q: "", diff: "", type: "", status: "", source: "", page: 1 });

// ------------------------------------------------------------ utilities

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function inlineMd(s) {
  return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function renderMarkdown(src) {
  src = String(src || "");
  let html;
  if (window.marked) {
    html = marked.parse(src, { gfm: true, breaks: false });
  } else {
    // Fallback: code fences + paragraphs
    const blocks = src.split(/```/);
    html = blocks.map((b, i) => i % 2
      ? `<pre><code>${esc(b.replace(/^[a-z+#-]*\n/i, ""))}</code></pre>`
      : esc(b).split(/\n{2,}/).map((p) => `<p>${p.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>")}</p>`).join("")
    ).join("");
  }
  return window.DOMPurify ? DOMPurify.sanitize(html) : html;
}

// Turn ```mermaid / ```wavedrom code blocks inside `root` into diagrams.
let diagramSeq = 0;
let mermaidReady = false;
function initMermaid() {
  if (!window.mermaid) return false;
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: isDark() ? "dark" : "default", fontFamily: "inherit" });
  mermaidReady = true;
  return true;
}
async function enhance(root) {
  if (!root) return;
  const mermaidNodes = [];
  for (const code of root.querySelectorAll("pre > code")) {
    const lang = (/language-(\w+)/.exec(code.className) || [])[1];
    const pre = code.parentElement;
    const src = code.textContent;
    if (lang === "wavedrom" && window.WaveDrom) {
      const id = `wd-${++diagramSeq}`;
      const box = document.createElement("div");
      box.className = "diagram wavedrom-box";
      const inner = document.createElement("div");
      inner.id = id + "0";
      box.appendChild(inner);
      pre.replaceWith(box);
      try {
        WaveDrom.RenderWaveForm(0, JSON.parse(src), id);
      } catch (e) {
        box.replaceWith(diagramError("waveform", e, src));
      }
    } else if (lang !== "mermaid" && lang !== "wavedrom" && window.hljs) {
      const map = { systemverilog: "verilog", sv: "verilog", v: "verilog", uvm: "verilog", tcl: "bash", shell: "bash", sh: "bash" };
      const l = map[lang] || lang;
      try {
        code.innerHTML = l && hljs.getLanguage(l) ? hljs.highlight(src, { language: l }).value : hljs.highlightAuto(src).value;
        code.classList.add("hljs");
      } catch {}
    } else if (lang === "mermaid" && (mermaidReady || initMermaid())) {
      const box = document.createElement("div");
      box.className = "diagram mermaid";
      // A backtick inside a label starts a Mermaid "markdown string"; UVM macros
      // (`uvm_info) need one, so swap in the look-alike modifier grave accent.
      const msrc = src.replace(/`/g, "\u02CB");
      box.textContent = msrc;
      box.dataset.src = msrc;
      pre.replaceWith(box);
      mermaidNodes.push(box);
    }
  }
  for (const node of mermaidNodes) {
    try { await mermaid.run({ nodes: [node] }); }
    catch (e) { node.replaceWith(diagramError("diagram", e, node.dataset.src)); }
  }
}
// Click any diagram to view it full-screen.
document.addEventListener("click", (e) => {
  const d = e.target.closest(".diagram");
  const zoom = document.getElementById("zoom");
  if (d && !e.target.closest(".zoom")) {
    zoom.querySelector(".zoom-inner").innerHTML = d.innerHTML;
    zoom.hidden = false;
  } else if (e.target.closest(".zoom-close") || e.target === zoom) {
    zoom.hidden = true;
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") document.getElementById("zoom").hidden = true; });

function diagramError(kind, err, src) {
  const d = document.createElement("div");
  d.className = "diagram-error";
  d.innerHTML = `<div class="muted small">Could not render ${kind}: ${esc(String(err?.message || err).split("\n")[0])}</div><pre><code>${esc(src)}</code></pre>`;
  return d;
}

async function api(path, opts = {}) {
  const r = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function verdictClass(score) {
  if (score == null) return "";
  return score >= 8 ? "ok" : score >= 5 ? "mid" : "bad";
}

const TYPE_LABEL = { concept: "Concept", coding: "Coding", behavioral: "Behavioral" };

// ------------------------------------------------------------ theme

function applyTheme(t) {
  if (t) document.documentElement.setAttribute("data-theme", t);
  else document.documentElement.removeAttribute("data-theme");
  const dark = isDark();
  const l = document.getElementById("hl-light"), d = document.getElementById("hl-dark");
  if (l && d) { l.disabled = dark; d.disabled = !dark; }
}
function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}
applyTheme(store.get("dvlab:theme"));
$("#theme-toggle").addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  store.set("dvlab:theme", next);
  applyTheme(next);
  if (editor?.cm) editor.cm.setOption("theme", isDark() ? "material-darker" : "default");
  if (window.mermaid) initMermaid();
  if (current?.renderLeft) current.renderLeft(current.currentTab());
});

// ------------------------------------------------------------ data

async function loadQuestions() {
  QUESTIONS = await api("/api/questions");
  updateStats();
}

function updateStats() {
  const solved = QUESTIONS.filter((q) => q.status === "solved").length;
  $("#stat-solved").innerHTML = `Solved <b>${solved}</b> / ${QUESTIONS.length}`;
}

function applyFilters() {
  const needle = state.q.trim().toLowerCase();
  FILTERED = QUESTIONS.filter((q) => {
    if (state.cat && q.category !== state.cat) return false;
    if (state.diff && q.difficulty !== state.diff) return false;
    if (state.type && q.type !== state.type) return false;
    if (state.source && q.source.id !== state.source) return false;
    if (state.status === "todo" && q.status) return false;
    if (state.status === "attempted" && q.status !== "attempted") return false;
    if (state.status === "solved" && q.status !== "solved") return false;
    if (needle && !(q.title.toLowerCase().includes(needle) || q.category.toLowerCase().includes(needle) ||
        q.source.name.toLowerCase().includes(needle) || (q.tags || []).join(" ").toLowerCase().includes(needle))) return false;
    return true;
  });
  store.set("dvlab:filtered", FILTERED.map((q) => q.id));
}

// ------------------------------------------------------------ list view

function renderList() {
  setNav("problems");
  app.replaceChildren($("#tpl-list").content.cloneNode(true));

  // categories
  const cats = {};
  for (const q of QUESTIONS) cats[q.category] = (cats[q.category] || 0) + 1;
  const catList = $("#cat-list");
  const catItems = [["", "All topics", QUESTIONS.length], ...Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, n]) => [c, c, n])];
  catList.innerHTML = catItems.map(([v, label, n]) =>
    `<li data-cat="${esc(v)}" class="${state.cat === v ? "active" : ""}"><span>${esc(label)}</span><span class="n">${n}</span></li>`).join("");
  catList.addEventListener("click", (e) => {
    const li = e.target.closest("li"); if (!li) return;
    state.cat = li.dataset.cat; state.page = 1; saveFilters(); renderList();
  });

  // sources
  const srcs = new Map();
  for (const q of QUESTIONS) srcs.set(q.source.id, { name: q.source.name, n: (srcs.get(q.source.id)?.n || 0) + 1 });
  const fs = $("#f-source");
  fs.innerHTML += [...srcs.entries()].sort((a, b) => b[1].n - a[1].n)
    .map(([id, s]) => `<option value="${esc(id)}">${esc(s.name)} (${s.n})</option>`).join("");

  // progress cards
  const solved = QUESTIONS.filter((q) => q.status === "solved").length;
  const attempted = QUESTIONS.filter((q) => q.status === "attempted").length;
  const byDiff = ["Easy", "Medium", "Hard"].map((d) => {
    const all = QUESTIONS.filter((q) => q.difficulty === d);
    const s = all.filter((q) => q.status === "solved").length;
    return `<div class="pcard"><div class="lbl diff-${d}">${d}</div><div class="big">${s}<span class="muted small"> / ${all.length}</span></div><div class="bar"><span style="width:${all.length ? (100 * s / all.length) : 0}%"></span></div></div>`;
  }).join("");
  $("#progress-strip").innerHTML =
    `<div class="pcard"><div class="lbl">Solved</div><div class="big">${solved}<span class="muted small"> / ${QUESTIONS.length}</span></div><div class="bar"><span style="width:${100 * solved / Math.max(1, QUESTIONS.length)}%"></span></div></div>
     <div class="pcard"><div class="lbl">Attempted</div><div class="big">${attempted}</div><div class="lbl">best score &lt; 8</div></div>${byDiff}`;

  // controls
  const bind = (id, key) => {
    const el = $(id); el.value = state[key];
    el.addEventListener(el.tagName === "INPUT" ? "input" : "change", () => {
      state[key] = el.value; state.page = 1; saveFilters(); drawTable();
    });
  };
  bind("#f-search", "q"); bind("#f-diff", "diff"); bind("#f-type", "type"); bind("#f-status", "status"); bind("#f-source", "source");
  $("#btn-pick").addEventListener("click", () => {
    applyFilters();
    const pool = FILTERED.filter((q) => q.status !== "solved");
    const list = pool.length ? pool : FILTERED;
    if (list.length) location.hash = `#/p/${encodeURIComponent(list[Math.floor(Math.random() * list.length)].id)}`;
  });
  $("#qbody").addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]"); if (!tr) return;
    if (e.target.closest("a")) return;
    location.hash = `#/p/${encodeURIComponent(tr.dataset.id)}`;
  });
  drawTable();
}

function saveFilters() { store.set("dvlab:filters", state); }

function drawTable() {
  applyFilters();
  const pages = Math.max(1, Math.ceil(FILTERED.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * PAGE_SIZE;
  const rows = FILTERED.slice(start, start + PAGE_SIZE);
  $("#count-line").textContent = `${FILTERED.length} question${FILTERED.length === 1 ? "" : "s"}`;
  $("#qbody").innerHTML = rows.map((q) => {
    const st = q.status === "solved" ? `<span class="st-solved" title="Solved">✓</span>`
      : q.status === "attempted" ? `<span class="st-attempted" title="Attempted">◔</span>` : "";
    return `<tr data-id="${esc(q.id)}">
      <td class="c-st">${st}</td>
      <td class="title-cell"><a href="#/p/${encodeURIComponent(q.id)}">${inlineMd(q.title)}</a>${q.hasSolution ? `<span class="sol-dot" title="Illustrated solution available">◆</span>` : ""}</td>
      <td class="c-cat"><span class="chip">${esc(q.category)}</span></td>
      <td class="c-diff diff-${q.difficulty}">${q.difficulty}</td>
      <td class="c-type muted">${TYPE_LABEL[q.type] || q.type}</td>
      <td class="c-best">${q.bestScore != null ? `<span class="verdict ${verdictClass(q.bestScore)}">${q.bestScore}</span>` : ""}</td>
    </tr>`;
  }).join("") || `<tr><td colspan="6" class="muted" style="text-align:center;padding:30px">No questions match these filters.</td></tr>`;

  const pager = $("#pager");
  if (pages <= 1) { pager.innerHTML = ""; return; }
  const nums = new Set([1, pages, state.page - 1, state.page, state.page + 1, state.page - 2, state.page + 2].filter((n) => n >= 1 && n <= pages));
  let last = 0; let html = "";
  for (const n of [...nums].sort((a, b) => a - b)) {
    if (n - last > 1) html += `<span class="muted">…</span>`;
    html += `<button class="btn sm ${n === state.page ? "active" : ""}" data-page="${n}">${n}</button>`;
    last = n;
  }
  pager.innerHTML = html;
  pager.onclick = (e) => {
    const b = e.target.closest("button[data-page]"); if (!b) return;
    state.page = Number(b.dataset.page); saveFilters(); drawTable();
    $(".list-page").scrollTo({ top: 0 });
  };
}

// ------------------------------------------------------------ editor

let editor = null;
const CM_MODE = {
  systemverilog: "text/x-systemverilog", verilog: "text/x-verilog", python: "python",
  cpp: "text/x-c++src", c: "text/x-csrc", text: "markdown", tcl: "shell",
};

function makeEditor(textarea, lang, onChange) {
  if (window.CodeMirror) {
    const cm = CodeMirror.fromTextArea(textarea, {
      mode: CM_MODE[lang] || "markdown", lineNumbers: true, indentUnit: 2, tabSize: 2,
      matchBrackets: true, autoCloseBrackets: true, styleActiveLine: true, lineWrapping: lang === "text",
      theme: isDark() ? "material-darker" : "default",
      extraKeys: {
        Tab: (c) => c.somethingSelected() ? c.indentSelection("add") : c.replaceSelection("  "),
        "Ctrl-Enter": () => evaluate("evaluate"), "Cmd-Enter": () => evaluate("evaluate"),
      },
    });
    cm.on("change", onChange);
    return {
      cm,
      get: () => cm.getValue(),
      set: (v) => cm.setValue(v),
      setLang: (l) => { cm.setOption("mode", CM_MODE[l] || "markdown"); cm.setOption("lineWrapping", l === "text"); },
      focus: () => cm.focus(),
      refresh: () => cm.refresh(),
    };
  }
  // Plain textarea fallback (no CDN)
  textarea.addEventListener("input", onChange);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = textarea.selectionStart;
      textarea.setRangeText("  ", s, textarea.selectionEnd, "end");
      onChange();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); evaluate("evaluate");
    }
  });
  return {
    cm: null, get: () => textarea.value, set: (v) => { textarea.value = v; },
    setLang: () => {}, focus: () => textarea.focus(), refresh: () => {},
  };
}

// ------------------------------------------------------------ problem view

let current = null;    // full question object
let activeStream = null;

function defaultLang(q) {
  if (q.type !== "coding") return "text";
  return ["systemverilog", "python", "cpp", "c", "verilog"].includes(q.language) ? q.language : "systemverilog";
}

function draftKey(id) { return `dvlab:draft:${id}`; }

async function renderProblem(id, openTab = "desc") {
  setNav("");
  if (activeStream) activeStream.abort();
  let q;
  try { q = await api(`/api/questions/${encodeURIComponent(id)}`); }
  catch { app.innerHTML = `<div style="padding:40px">Question not found. <a href="#/">Back to list</a></div>`; return; }
  current = q;
  document.title = `${q.title} · DV Interview Lab`;
  app.replaceChildren($("#tpl-problem").content.cloneNode(true));

  // left pane
  let tab = "desc";
  const showTab = (t) => {
    tab = t;
    $$("#left-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === t));
    renderLeft(t);
  };
  $("#left-tabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) showTab(b.dataset.tab); });
  if (openTab === "sol" || openTab === "ref") store.set(`dvlab:revealed:${q.id}`, true);
  showTab(["desc", "sol", "ref", "subs"].includes(openTab) ? openTab : "desc");

  // prev / next within the current filtered list
  const order = store.get("dvlab:filtered") || QUESTIONS.map((x) => x.id);
  const idx = order.indexOf(q.id);
  $("#pos-label").textContent = idx >= 0 ? `${idx + 1} / ${order.length}` : "";
  $("#btn-prev").disabled = idx <= 0;
  $("#btn-next").disabled = idx < 0 || idx >= order.length - 1;
  $("#btn-prev").onclick = () => { if (idx > 0) location.hash = `#/p/${encodeURIComponent(order[idx - 1])}`; };
  $("#btn-next").onclick = () => { if (idx >= 0 && idx < order.length - 1) location.hash = `#/p/${encodeURIComponent(order[idx + 1])}`; };

  // editor
  const draft = store.get(draftKey(q.id));
  const lang = draft?.lang || defaultLang(q);
  $("#lang-select").value = lang;
  setupEngine();
  let saveTimer = null;
  editor = makeEditor($("#editor"), lang, () => {
    $("#draft-state").textContent = "editing…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      store.set(draftKey(q.id), { lang: $("#lang-select").value, text: editor.get() });
      $("#draft-state").textContent = "draft saved";
    }, 500);
  });
  editor.set(draft?.text ?? starterFor(q, lang));
  $("#draft-state").textContent = draft ? "draft restored" : "";
  $("#lang-select").addEventListener("change", (e) => {
    editor.setLang(e.target.value);
    store.set(draftKey(q.id), { lang: e.target.value, text: editor.get() });
  });
  $("#engine-select").addEventListener("change", (e) => { store.set("dvlab:engine", e.target.value); setupEngine(); });
  $("#model-select").addEventListener("change", (e) => store.set(`dvlab:model:${$("#engine-select").value}`, e.target.value));
  $("#btn-reset").addEventListener("click", () => {
    if (!confirm("Clear your answer for this question?")) return;
    editor.set(starterFor(q, $("#lang-select").value));
    store.del(draftKey(q.id));
  });
  $("#btn-eval").addEventListener("click", () => evaluate("evaluate"));
  $("#btn-hint").addEventListener("click", () => evaluate("hint"));
  $("#btn-save").addEventListener("click", saveOnly);
  $("#btn-stop").addEventListener("click", () => activeStream?.abort());

  // show last feedback if any
  const last = q.progress?.submissions?.find((s) => s.feedback);
  if (last) showFeedback(last.feedback, last.score, last.verdict, `last evaluated ${fmtTime(last.time)}`);

  setupResizers();
  setTimeout(() => { editor.refresh(); editor.focus(); }, 30);

  function renderLeft(t) {
    const body = $("#left-body");
    if (t === "desc") {
      const prompt = q.prompt ? renderMarkdown(q.prompt) : `<p class="muted">${
        q.type === "coding" ? "Write the code (and briefly explain your design choices, assumptions and corner cases)."
          : q.type === "behavioral" ? "Answer as you would in the interview. Use STAR: Situation, Task, Action, Result."
            : "Explain your answer as you would to an interviewer: the key idea first, then details, trade-offs and corner cases."}</p>`;
      const best = q.progress?.bestScore;
      body.innerHTML = `
        <h1 class="q-title md">${inlineMd(q.title)}</h1>
        <div class="badges">
          <span class="badge ${q.difficulty}">${q.difficulty}</span>
          <span class="badge">${esc(q.category)}</span>
          <span class="badge">${TYPE_LABEL[q.type] || q.type}</span>
          ${q.progress?.status === "solved" ? `<span class="badge" style="color:var(--ok)">✓ Solved</span>` : ""}
          ${best != null ? `<span class="verdict ${verdictClass(best)}">best ${best}/10</span>` : ""}
        </div>
        <div class="md">${prompt}</div>
        ${(q.tags || []).length ? `<p class="muted small">Tags: ${q.tags.map(esc).join(", ")}</p>` : ""}
        <p class="muted small">Source: <a href="${esc(q.source.url)}" target="_blank" rel="noopener">${esc(q.source.name)}</a> · ID ${esc(q.id)}</p>
        <div class="mark-row">
          <span class="muted small">Mark manually:</span>
          <button class="btn sm ghost" data-mark="solved">✓ Solved</button>
          <button class="btn sm ghost" data-mark="attempted">◔ Attempted</button>
          <button class="btn sm ghost" data-mark="">Clear</button>
        </div>`;
      body.querySelector(".mark-row").addEventListener("click", async (e) => {
        const b = e.target.closest("button[data-mark]"); if (!b) return;
        const r = await api("/api/self-mark", { method: "POST", body: JSON.stringify({ questionId: q.id, status: b.dataset.mark || null }) });
        q.progress = r.record; syncListStatus(q.id, r.record); renderLeft("desc");
      });
    } else if (t === "sol" || t === "ref") {
      const content = t === "sol" ? q.solution : q.answer;
      if (!content) {
        body.innerHTML = `<div class="reveal-box">${t === "sol"
          ? "No illustrated solution for this question yet.<br>Use <b>AI Evaluate</b> to get a model answer with a diagram."
          : "No source notes for this question."}</div>`;
        return;
      }
      if (store.get(`dvlab:revealed:${q.id}`)) {
        body.innerHTML = `<div class="md">${renderMarkdown(content)}</div>`;
        enhance(body);
      } else {
        body.innerHTML = `<div class="reveal-box"><p>Try answering first — the ${t === "sol" ? "solution" : "notes"} are hidden.</p><button class="btn" id="btn-reveal">Reveal ${t === "sol" ? "illustrated solution" : "source notes"}</button></div>`;
        $("#btn-reveal").onclick = () => { store.set(`dvlab:revealed:${q.id}`, true); renderLeft(t); };
      }
    } else if (t === "subs") {
      const subs = q.progress?.submissions || [];
      if (!subs.length) { body.innerHTML = `<p class="muted">No submissions yet.</p>`; return; }
      body.innerHTML = subs.map((s, i) => `
        <div class="sub" data-i="${i}">
          <div class="sub-head">
            ${s.score != null ? `<span class="verdict ${verdictClass(s.score)}">${s.score}/10</span>` : `<span class="chip">${esc(s.verdict || "Saved")}</span>`}
            <span>${esc(s.verdict && s.score != null ? s.verdict : "")}</span>
            <span class="spacer"></span>
            <span class="muted small">${s.score != null || s.feedback ? `${esc(ENGINE_LABEL[s.engine] || "Claude Code")} · ` : ""}${esc(s.language)} · ${fmtTime(s.time)}</span>
          </div>
          <div class="sub-body">
            <div class="md"><pre><code>${esc(s.answer)}</code></pre></div>
            <div style="margin:6px 0 10px"><button class="btn sm ghost" data-load="${i}">Load into editor</button></div>
            ${s.feedback ? `<div class="md">${renderMarkdown(stripScoreLine(s.feedback))}</div>` : ""}
          </div>
        </div>`).join("");
      body.onclick = (e) => {
        const load = e.target.closest("button[data-load]");
        if (load) {
          const s = subs[Number(load.dataset.load)];
          $("#lang-select").value = s.language in CM_MODE ? s.language : "text";
          editor.setLang($("#lang-select").value); editor.set(s.answer); return;
        }
        const head = e.target.closest(".sub-head");
        if (head) {
          const sub = head.parentElement;
          sub.classList.toggle("open");
          if (sub.classList.contains("open") && !sub.dataset.enhanced) { sub.dataset.enhanced = "1"; enhance(sub.querySelector(".sub-body")); }
        }
      };
    }
  }
  current.renderLeft = renderLeft;
  current.currentTab = () => tab;
}

// Evaluators and their models; /api/engines replaces this list with what the server has installed.
const ENGINE_LABEL = { claude: "Claude Code", codex: "Codex", agy: "Gemini (agy)" };
let ENGINES = [
  { id: "claude", label: "Claude Code", models: ["opus", "sonnet", "haiku"], available: true },
  { id: "codex", label: "Codex", models: [], available: true },
  { id: "agy", label: "Gemini (agy)", models: [], available: true },
];
api("/api/engines").then((list) => { ENGINES = list; if ($("#engine-select")) setupEngine(); }).catch(() => {});

function setupEngine() {
  const sel = $("#engine-select");
  sel.innerHTML = ENGINES.map((e) => `<option value="${e.id}"${e.available ? "" : " disabled"}>${esc(e.label)}${e.available ? "" : " (not installed)"}</option>`).join("");
  const want = store.get("dvlab:engine", "claude");
  sel.value = ENGINES.some((e) => e.id === want && e.available) ? want : "claude";
  const eng = ENGINES.find((e) => e.id === sel.value) || ENGINES[0];
  const msel = $("#model-select");
  msel.innerHTML = `<option value="">Model: default</option>` + eng.models.map((m) => `<option>${esc(m)}</option>`).join("");
  const legacy = eng.id === "claude" ? store.get("dvlab:model", "") : "";
  const m = store.get(`dvlab:model:${eng.id}`, legacy);
  msel.value = eng.models.includes(m) ? m : "";
}
const engineName = () => ENGINE_LABEL[$("#engine-select")?.value] || "Claude Code";
const whoFrom = (data) => [ENGINE_LABEL[data.engine] || "", data.model || ""].filter(Boolean).join(" · ") || "claude";

function starterFor(q, lang) {
  if (q.type !== "coding") return "";
  if (lang === "python") return "# Your solution\n\n";
  if (lang === "cpp" || lang === "c") return "// Your solution\n\n";
  return "// Your solution\n\n";
}

function stripScoreLine(t) { return String(t || "").replace(/^\s*SCORE:[^\n]*\n?/i, ""); }

function showFeedback(text, score, verdict, meta) {
  $("#console-body").innerHTML = renderMarkdown(stripScoreLine(text));
  enhance($("#console-body"));
  const badge = $("#verdict-badge");
  badge.innerHTML = score != null ? `<span class="verdict ${verdictClass(score)}">${esc(verdict || "")} · ${score}/10</span>` : "";
  $("#eval-meta").textContent = meta || "";
}

function syncListStatus(id, rec) {
  const row = QUESTIONS.find((x) => x.id === id);
  if (row && rec) { row.status = rec.status; row.bestScore = rec.bestScore; }
  updateStats();
}

async function saveOnly() {
  const answer = editor.get();
  if (!answer.trim()) return;
  const r = await api("/api/submit", { method: "POST", body: JSON.stringify({ questionId: current.id, answer, language: $("#lang-select").value }) });
  current.progress = r.record; syncListStatus(current.id, r.record);
  $("#eval-meta").textContent = "answer saved to submissions";
  if (current.currentTab() === "subs") current.renderLeft("subs");
}

async function evaluate(mode) {
  if (!current || activeStream) return;
  const answer = editor.get();
  if (mode === "evaluate" && !answer.trim()) {
    $("#console-body").innerHTML = `<p class="muted">Write an answer first.</p>`; return;
  }
  const ctrl = new AbortController();
  activeStream = ctrl;
  const btnEval = $("#btn-eval"), btnHint = $("#btn-hint");
  btnEval.disabled = btnHint.disabled = true;
  $("#btn-stop").hidden = false;
  btnEval.textContent = mode === "hint" ? "✦ AI Evaluate" : "Evaluating…";
  if (mode === "hint") btnHint.textContent = "Thinking…";
  $("#verdict-badge").innerHTML = "";
  const who = engineName();
  $("#eval-meta").textContent = mode === "hint" ? `asking ${who} for a hint…` : `sending to ${who}…`;
  const out = $("#console-body");
  out.innerHTML = `<p class="muted cursor">Waiting for ${esc(who)}${$("#engine-select").value === "codex" ? " (Codex sends its answer in one piece when it finishes)" : ""}</p>`;
  const t0 = performance.now();
  let text = "";
  let raf = 0;
  const paint = () => { raf = 0; out.innerHTML = renderMarkdown(stripScoreLine(text)) + `<span class="cursor"></span>`; out.scrollTop = out.scrollHeight; };

  try {
    const r = await fetch("/api/evaluate", {
      method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: current.id, answer, language: $("#lang-select").value, mode, engine: $("#engine-select").value, model: $("#model-select").value }),
    });
    if (!r.ok || !r.body) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let sep;
      while ((sep = buf.indexOf("\n\n")) >= 0) {
        const chunk = buf.slice(0, sep); buf = buf.slice(sep + 2);
        const ev = /^event: (\w+)/m.exec(chunk)?.[1];
        const data = JSON.parse(/^data: (.*)$/m.exec(chunk)?.[1] || "{}");
        if (ev === "delta") {
          text += data.text;
          const m = /^\s*SCORE:\s*(\d+)[^|]*\|\s*VERDICT:\s*([A-Za-z ]+)/i.exec(text);
          if (m) $("#verdict-badge").innerHTML = `<span class="verdict ${verdictClass(+m[1])}">${esc(m[2].trim())} · ${m[1]}/10</span>`;
          if (!raf) raf = requestAnimationFrame(paint);
        } else if (ev === "error") {
          if (!text) out.innerHTML = "";
          out.insertAdjacentHTML("beforeend", `<p class="error-box">⚠ ${esc(data.message)}</p>`);
        } else if (ev === "done") {
          if (raf) cancelAnimationFrame(raf);
          const secs = ((performance.now() - t0) / 1000).toFixed(1);
          if (mode === "evaluate") {
            showFeedback(text, data.score, data.verdict, `${whoFrom(data)} · ${secs}s${data.cost != null ? ` · $${data.cost.toFixed(4)}` : ""}`);
            if (data.record) { current.progress = data.record; syncListStatus(current.id, data.record); }
            if (current.currentTab() !== "ref") current.renderLeft(current.currentTab());
          } else {
            out.innerHTML = `<h3>💡 Hint</h3>` + renderMarkdown(text);
            enhance(out);
            $("#eval-meta").textContent = `${whoFrom(data)} · ${secs}s`;
          }
        }
      }
    }
  } catch (e) {
    if (e.name === "AbortError") out.insertAdjacentHTML("beforeend", `<p class="muted">Stopped.</p>`);
    else out.innerHTML = `<p class="error-box">⚠ ${esc(e.message)}</p><p class="muted">Is the server running and can it reach ${esc(who)}? See README.</p>`;
    $("#eval-meta").textContent = "";
  } finally {
    activeStream = null;
    btnEval.disabled = btnHint.disabled = false;
    btnEval.textContent = "✦ AI Evaluate";
    btnHint.textContent = "💡 Hint";
    $("#btn-stop").hidden = true;
    out.querySelector(".cursor:last-child")?.remove();
  }
}

function setupResizers() {
  const left = $(".pane.left"), page = $(".problem-page");
  const savedW = store.get("dvlab:leftWidth");
  if (savedW) left.style.flexBasis = savedW;
  $("#gutter-v").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const rect = page.getBoundingClientRect();
    const move = (ev) => {
      const pct = Math.min(75, Math.max(20, ((ev.clientX - rect.left) / rect.width) * 100));
      left.style.flexBasis = pct + "%"; editor.refresh();
    };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); store.set("dvlab:leftWidth", left.style.flexBasis); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });
  const ed = $("#editor-wrap"), con = $("#console"), right = $(".pane.right");
  const savedH = store.get("dvlab:editorPct");
  if (savedH) { ed.style.flex = `1 1 ${savedH}%`; con.style.flex = `1 1 ${100 - savedH}%`; }
  $("#gutter-h").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const rect = right.getBoundingClientRect();
    let pct = savedH || 55;
    const move = (ev) => {
      pct = Math.min(85, Math.max(15, ((ev.clientY - rect.top - 40) / (rect.height - 90)) * 100));
      ed.style.flex = `1 1 ${pct}%`; con.style.flex = `1 1 ${100 - pct}%`; editor.refresh();
    };
    const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); store.set("dvlab:editorPct", pct); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });
}

// ------------------------------------------------------------ routing

function setNav(which) { $("#nav-problems").classList.toggle("active", which === "problems"); }

$("#nav-random").addEventListener("click", (e) => {
  e.preventDefault();
  const pool = QUESTIONS.filter((q) => q.status !== "solved");
  const list = pool.length ? pool : QUESTIONS;
  location.hash = `#/p/${encodeURIComponent(list[Math.floor(Math.random() * list.length)].id)}`;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.closest(".CodeMirror")) {
    const s = $("#f-search"); if (s) { e.preventDefault(); s.focus(); }
  }
});

async function route() {
  const h = location.hash || "#/";
  const m = /^#\/p\/([^/]+)(?:\/(\w+))?$/.exec(h);
  const TAB = { solution: "sol", notes: "ref", submissions: "subs" };
  if (m) await renderProblem(decodeURIComponent(m[1]), TAB[m[2]] || "desc");
  else { document.title = "DV Interview Lab"; await loadQuestions(); renderList(); }
}
addEventListener("hashchange", route);

loadQuestions().then(route).catch((e) => {
  app.innerHTML = `<div style="padding:40px" class="error-box">Could not load questions: ${esc(e.message)}</div>`;
});
