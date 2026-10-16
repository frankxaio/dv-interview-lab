#!/usr/bin/env node
// DV Interview Lab — local server.
// Serves the LeetCode-style UI, stores submissions, and sends answers to Claude Code
// (`claude -p`), Codex (`codex exec`) or Gemini (`agy -p`) for evaluation, streaming the feedback back.
//
//   node server.js            # http://127.0.0.1:8080
//   DVLAB_PORT=9000 DVLAB_HOST=0.0.0.0 node server.js

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA = path.join(ROOT, "data");
const QUESTIONS_FILE = path.join(DATA, "questions.json");
const PROGRESS_FILE = path.join(DATA, "progress.json");

// DVLAB_* rather than PORT/HOST: HOST is often preset by the shell to the machine name.
const PORT = Number(process.env.DVLAB_PORT || 8080);
const HOST = process.env.DVLAB_HOST || "127.0.0.1";
const CLAUDE_BIN = process.env.CLAUDE_BIN ||
  [path.join(os.homedir(), ".local/bin/claude"), "claude"].find((p) => p === "claude" || fs.existsSync(p));
// Your shell alias routes claude through a local proxy; the server does the same
// unless proxy variables are already set in its environment.
const PROXY_ENV = {
  HTTP_PROXY: process.env.HTTP_PROXY || "http://127.0.0.1:1055",
  HTTPS_PROXY: process.env.HTTPS_PROXY || "http://127.0.0.1:1055",
  ALL_PROXY: process.env.ALL_PROXY || "socks5h://127.0.0.1:1055",
};
if (process.env.NO_CLAUDE_PROXY) for (const k of Object.keys(PROXY_ENV)) delete PROXY_ENV[k];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// ------------------------------------------------------------------ data

let questions = [];
let questionById = new Map();
function loadQuestions() {
  questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, "utf8"));
  questionById = new Map(questions.map((q) => [q.id, q]));
}
loadQuestions();
fs.watchFile(QUESTIONS_FILE, { interval: 2000 }, () => {
  try { loadQuestions(); console.log(`reloaded ${questions.length} questions`); }
  catch (e) { console.error("questions.json reload failed:", e.message); }
});

function readProgress() {
  try { return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8")); }
  catch { return {}; }
}
function writeProgress(p) {
  const tmp = PROGRESS_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(p, null, 1));
  fs.renameSync(tmp, PROGRESS_FILE);
}

function recordSubmission(qid, entry) {
  const p = readProgress();
  const rec = p[qid] || { status: "attempted", bestScore: null, submissions: [] };
  rec.submissions.unshift(entry);
  rec.submissions = rec.submissions.slice(0, 50);
  if (typeof entry.score === "number") {
    rec.bestScore = rec.bestScore == null ? entry.score : Math.max(rec.bestScore, entry.score);
  }
  if (rec.bestScore != null && rec.bestScore >= 8) rec.status = "solved";
  rec.lastAttempt = entry.time;
  p[qid] = rec;
  writeProgress(p);
  return rec;
}

// ------------------------------------------------------------------ claude

const SYSTEM_PROMPT = `You are a senior ASIC design-verification engineer running a technical interview.
You grade a candidate's answer to one interview question and coach them to an interview-ready answer.
Be direct, specific and technically precise. Judge correctness first, then completeness, then clarity.
For code (SystemVerilog, UVM, Verilog, SVA, Python, C++): check syntax, semantics, timing, reset behavior,
corner cases, and whether it would compile and behave correctly; point to exact lines.
A reference answer may be supplied; treat it as a guide, not as the only correct answer, and say so if it is wrong or incomplete.
If the candidate writes in Chinese, you may reply in the same language they used.`;

function buildPrompt(q, answer, language, mode) {
  const parts = [];
  parts.push(`# Interview question\n**${q.title}**`);
  if (q.prompt) parts.push(q.prompt);
  parts.push(`Category: ${q.category} · Difficulty: ${q.difficulty} · Source: ${q.source.name}`);
  if (q.answer) parts.push(`# Reference notes (from the candidate's study material)\n${q.answer}`);
  if (q.solution) parts.push(`# Model solution on file (may contain diagrams)\n${q.solution}`);
  if (mode === "hint") {
    parts.push(`# Candidate's work so far (${language})\n\`\`\`${language}\n${answer || "(nothing yet)"}\n\`\`\``);
    parts.push(`# Task
Give a HINT only — do not reveal the full answer or write the full solution.
- One or two sentences on the key idea to think about.
- If they have started, point out the single most important thing missing or wrong.
- End with one guiding question. Keep it under 120 words.`);
  } else {
    parts.push(`# Candidate's answer (${language})\n\`\`\`${language}\n${answer}\n\`\`\``);
    parts.push(`# Task
Evaluate the candidate's answer. Your reply MUST start with this exact first line (no text before it):
SCORE: <integer 0-10> | VERDICT: <Accepted | Partially Correct | Needs Work>
(Accepted = 8-10, Partially Correct = 5-7, Needs Work = 0-4.)

Then write Markdown with these sections:
### What you got right
### Issues and missing points
(be concrete: wrong statements, bugs, missed corner cases; quote the candidate's lines when relevant)
### Interview-ready answer
(a concise, correct model answer or corrected code that the candidate could say/write in an interview.
Make it illustrative: when it helps, include ONE diagram — a \`\`\`wavedrom block (strict JSON) for timing/protocols/SVA,
or a \`\`\`mermaid block (Mermaid v10, quote labels with punctuation) for FSMs, data flow, or call sequences.)
### Likely follow-up questions
(2-3 follow-ups an interviewer would ask next)`);
  }
  return parts.join("\n\n");
}

function parseScore(text) {
  const m = /SCORE:\s*(\d+(?:\.\d+)?)\s*(?:\/\s*10)?\s*\|\s*VERDICT:\s*([A-Za-z ]+)/i.exec(text);
  if (!m) return { score: null, verdict: null };
  return { score: Math.max(0, Math.min(10, Number(m[1]))), verdict: m[2].trim() };
}

const running = new Set();

// Each evaluator is a CLI run headless in an empty scratch directory. The prompt goes in on
// stdin (claude, codex) or as an argument (agy); stdout is JSONL that parse() turns into text.
const BIN = (name, envVar) => process.env[envVar] ||
  [path.join(os.homedir(), ".local/bin", name), name].find((p) => p === name || fs.existsSync(p));
const ENGINES = {
  claude: {
    label: "Claude Code",
    bin: CLAUDE_BIN,
    models: ["opus", "sonnet", "haiku"],
    args: (model) => ["-p", "--output-format", "stream-json", "--verbose", "--include-partial-messages",
      "--tools", "", "--strict-mcp-config", "--setting-sources", "", "--no-session-persistence",
      "--system-prompt", SYSTEM_PROMPT, ...(model ? ["--model", model] : [])],
    stdin: (prompt) => prompt,
    env: PROXY_ENV,
    parse(ev, st) {
      if (ev.type === "stream_event" && ev.event?.type === "content_block_delta" &&
          ev.event.delta?.type === "text_delta") return ev.event.delta.text;
      if (ev.type === "stream_event" && ev.event?.type === "message_start") {
        st.model = ev.event.message?.model || st.model;
      } else if (ev.type === "assistant" && !st.text) {
        // no partial events (older CLI): take the whole message
        return (ev.message?.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
      } else if (ev.type === "result" || ev.total_cost_usd != null) {
        st.cost = ev.total_cost_usd ?? st.cost;
        if (ev.is_error) st.error = ev.result || "Claude returned an error";
      }
      return "";
    },
  },
  codex: {
    label: "Codex",
    bin: BIN("codex", "CODEX_BIN"),
    models: ["gpt-6-astra", "gpt-6.1-sol", "gpt-6-sol", "gpt-6-luna"],
    args: (model) => ["exec", "--json", "--skip-git-repo-check", "--ephemeral", "--sandbox", "read-only",
      "--color", "never", ...(model ? ["--model", model] : []), "-"],
    stdin: (prompt) => `${SYSTEM_PROMPT}\nDo not run commands or read files; answer from the text below.\n\n${prompt}`,
    env: PROXY_ENV,
    // codex exec emits each agent message whole (no token deltas).
    parse(ev, st) {
      if (ev.type === "item.completed" && ev.item?.type === "agent_message" && ev.item.text) {
        return (st.text ? "\n\n" : "") + ev.item.text;
      }
      if (ev.type === "turn.failed") st.error = ev.error?.message || "Codex turn failed";
      else if (ev.type === "error") st.error = ev.message || "Codex error";
      else if (ev.type === "turn.completed" && ev.usage) st.usage = ev.usage;
      return "";
    },
    // On a usage limit codex logs a warning and retries forever; fail fast instead.
    fatal: /usage limit[^\n]*/i,
  },
  agy: {
    label: "Gemini (agy)",
    bin: BIN("agy", "AGY_BIN"),
    models: ["gemini-3.8-flash-high", "gemini-3.8-flash-medium", "gemini-3.8-flash-low"],
    // agy reads the prompt only from its argument (128 KB limit per argument on Linux).
    args: (model, prompt) => ["-p", `${SYSTEM_PROMPT}\nDo not use any tools; answer from the text below.\n\n${prompt}`.slice(0, 120000),
      "--output-format", "stream-json", "--disable-slash-commands", "--print-timeout", "300s",
      ...(model ? ["--model", model] : [])],
    stdin: () => "",
    env: {},
    parse(ev, st) {
      const su = ev.step_update;
      if (ev.event === "init") st.model = ev.init?.model || st.model;
      if (su?.step_type === "agent_response" && su.text_delta) return su.text_delta;
      if (ev.event === "result" && ev.result?.status && ev.result.status !== "SUCCESS") {
        st.error = ev.result.error || `agy finished with status ${ev.result.status}`;
      }
      return "";
    },
  },
};
const EVAL_TIMEOUT_MS = 6 * 60 * 1000;

function streamEval(req, res, body) {
  const q = questionById.get(body.questionId);
  if (!q) return sendJson(res, 404, { error: "unknown question" });
  const engineId = Object.hasOwn(ENGINES, body.engine) ? body.engine : "claude";
  const engine = ENGINES[engineId];
  const mode = body.mode === "hint" ? "hint" : "evaluate";
  const answer = String(body.answer || "").slice(0, 60000);
  const language = String(body.language || "text").replace(/[^a-z0-9+#-]/gi, "");
  if (mode === "evaluate" && !answer.trim()) return sendJson(res, 400, { error: "empty answer" });

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const model = String(body.model || "").replace(/[^a-z0-9.-]/gi, "");
  const prompt = buildPrompt(q, answer, language, mode);
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "dvlab-eval-"));
  const child = spawn(engine.bin, engine.args(model, prompt), {
    cwd,
    env: { ...process.env, ...engine.env },
    stdio: ["pipe", "pipe", "pipe"],
  });
  running.add(child);
  child.stdin.on("error", () => {});
  child.stdin.end(engine.stdin(prompt));
  send("status", { engine: engineId, label: engine.label });

  // st: text so far, plus model / cost / error reported by the engine
  const st = { text: "", model: model ? `${engineId}:${model}` : null, cost: null, error: null };
  if (engineId === "claude") st.model = model || null;
  let buf = "";
  let stderr = "";
  let finished = false;
  const stop = (why) => {
    if (finished) return;
    st.error = st.error || why;
    child.kill("SIGTERM");
  };
  const timer = setTimeout(() => stop(`${engine.label} did not finish within ${EVAL_TIMEOUT_MS / 60000} minutes`), EVAL_TIMEOUT_MS);

  child.stdout.on("data", (chunk) => {
    buf += chunk.toString("utf8");
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      let ev;
      try { ev = JSON.parse(line); } catch { continue; }
      const t = engine.parse(ev, st);
      if (t) { st.text += t; send("delta", { text: t }); }
    }
  });
  child.stderr.on("data", (c) => {
    stderr += c.toString();
    const m = engine.fatal && engine.fatal.exec(stderr);
    if (m) stop(`${engine.label}: ${m[0]}`);
  });

  const cleanup = () => {
    clearTimeout(timer);
    running.delete(child);
    fs.rm(cwd, { recursive: true, force: true }, () => {});
  };
  child.on("close", (code) => {
    cleanup();
    if (finished) return;
    finished = true;
    if (!st.text) {
      send("error", { message: st.error || `${engine.label} exited with code ${code}. ${stderr.slice(-800)}` });
      return res.end();
    }
    if (st.error) send("error", { message: st.error });
    const { score, verdict } = parseScore(st.text);
    let record = null;
    if (mode === "evaluate") {
      record = recordSubmission(q.id, {
        time: new Date().toISOString(), language, answer, score, verdict,
        feedback: st.text, engine: engineId, model: st.model, cost: st.cost,
      });
    }
    send("done", { score, verdict, engine: engineId, model: st.model, cost: st.cost, record });
    res.end();
  });
  child.on("error", (err) => {
    cleanup();
    if (finished) return;
    finished = true;
    send("error", { message: `could not start ${engine.label} (${engine.bin}): ${err.message}` });
    res.end();
  });

  // Stop the evaluator if the browser goes away mid-stream.
  res.on("close", () => {
    if (!finished) { finished = true; child.kill("SIGTERM"); }
  });
}

// ------------------------------------------------------------------ http

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new Error("body too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === "/" || rel.startsWith("/problems")) rel = "/index.html";
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) {
      // SPA fallback
      return fs.readFile(path.join(PUBLIC, "index.html"), (e2, html) => {
        if (e2) { res.writeHead(404); return res.end("not found"); }
        res.writeHead(200, { "Content-Type": MIME[".html"] });
        res.end(html);
      });
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const p = url.pathname;
  try {
    if (req.method === "GET" && p === "/api/questions") {
      const progress = readProgress();
      return sendJson(res, 200, questions.map((q) => ({
        id: q.id, title: q.title, category: q.category, difficulty: q.difficulty,
        type: q.type, language: q.language, tags: q.tags, source: q.source,
        status: progress[q.id]?.status || null, bestScore: progress[q.id]?.bestScore ?? null,
        hasSolution: Boolean(q.solution),
      })));
    }
    let m;
    if (req.method === "GET" && (m = /^\/api\/questions\/([^/]+)$/.exec(p))) {
      const q = questionById.get(decodeURIComponent(m[1]));
      if (!q) return sendJson(res, 404, { error: "not found" });
      const progress = readProgress()[q.id] || null;
      return sendJson(res, 200, { ...q, progress });
    }
    if (req.method === "GET" && p === "/api/solutions") {
      // used by /check.html to render-test every diagram
      return sendJson(res, 200, Object.fromEntries(questions.filter((q) => q.solution).map((q) => [q.id, q.solution])));
    }
    if (req.method === "GET" && p === "/api/stats") {
      const progress = readProgress();
      const vals = Object.values(progress);
      return sendJson(res, 200, {
        total: questions.length,
        solved: vals.filter((v) => v.status === "solved").length,
        attempted: vals.length,
      });
    }
    if (req.method === "POST" && p === "/api/submit") {
      // Save an answer without AI evaluation.
      const body = await readBody(req);
      if (!questionById.has(body.questionId)) return sendJson(res, 404, { error: "unknown question" });
      const rec = recordSubmission(body.questionId, {
        time: new Date().toISOString(), language: String(body.language || "text"),
        answer: String(body.answer || "").slice(0, 60000), score: null, verdict: "Saved", feedback: "",
      });
      return sendJson(res, 200, { record: rec });
    }
    if (req.method === "POST" && p === "/api/evaluate") {
      const body = await readBody(req);
      return streamEval(req, res, body);
    }
    if (req.method === "POST" && p === "/api/self-mark") {
      const body = await readBody(req);
      const prog = readProgress();
      const rec = prog[body.questionId] || { status: null, bestScore: null, submissions: [] };
      rec.status = body.status || null;
      prog[body.questionId] = rec;
      writeProgress(prog);
      return sendJson(res, 200, { record: rec });
    }
    if (req.method === "GET" && p === "/api/health") {
      return sendJson(res, 200, { ok: true, claude: CLAUDE_BIN, questions: questions.length });
    }
    if (req.method === "GET" && p === "/api/engines") {
      return sendJson(res, 200, Object.entries(ENGINES).map(([id, e]) => ({
        id, label: e.label, models: e.models, available: Boolean(e.bin && (e.bin === path.basename(e.bin) || fs.existsSync(e.bin))),
      })));
    }
    if (req.method === "GET") return serveStatic(req, res, p);
    res.writeHead(405); res.end();
  } catch (e) {
    console.error(e);
    if (!res.headersSent) sendJson(res, 500, { error: e.message });
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`DV Interview Lab: http://${HOST}:${PORT}  (${questions.length} questions, claude=${CLAUDE_BIN})`);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => { for (const c of running) c.kill("SIGTERM"); process.exit(0); });
}
