#!/usr/bin/env python3
"""Build data/questions.json from the Heptabase sources in ../sources and the
hand-curated files in ../data/manual/*.json.

Run:  python3 scripts/build_questions.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources"
OUT = ROOT / "data" / "questions.json"
MANUAL = ROOT / "data" / "manual"
SOLUTIONS = ROOT / "data" / "solutions"

WB_URL = "https://app.heptabase.com/0efefd27-8520-4849-9e6c-c204a54a1604/whiteboard/cb101ccc-d3a3-4928-8eb4-da4ad45f2167"

# ---------------------------------------------------------------- helpers

LINE_NO = re.compile(r"^\d+\t", re.M)


def strip_line_numbers(text: str) -> str:
    return LINE_NO.sub("", text)


def clean_md(text: str) -> str:
    text = re.sub(r"<hepta-placeholder[^>]*/>", "", text)
    text = re.sub(r"<image [^>]*/>", "", text)
    text = re.sub(r"<video [^>]*/>", "", text)
    text = re.sub(r"</?hepta-[a-z]+[^>]*>", "", text)
    text = re.sub(r"\\([_\[\]*$`#~|])", r"\1", text)
    text = text.replace("****", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def clean_title(t: str) -> str:
    t = clean_md(t)
    t = re.sub(r"\*\*|__", "", t)
    t = re.sub(r"(?<![a-zA-Z])\*(?!\s)([^*]+?)\*", r"\1", t)  # *italic*
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"^#+\s*", "", t)
    t = re.sub(r"^\d+\s*[.)、]\s*", "", t)            # "12. "
    t = re.sub(r"^Q\d+(\.\d+)?\s*", "", t)            # "Q1.2 "
    t = re.sub(r"^(\[(T1|T2|R)\]\s*)+", "", t)        # "[T1][R] "
    t = t.replace(" ?", "?").strip(" .")
    return t


CATEGORY_RULES = [
    ("Puzzles", r"(puzzle|brain teaser|switches|stones?\b|balance scale|lighter|tournament|9 balls|weighing)"),
    ("Behavioral", r"\b(tell me about|yourself|weakness|strength|conflict|teamwork|team player|leadership|motivat|proud|five years|5 years|salary|why do you want|why (nvidia|dv|this)|failure|mistake|deadline|customer|manager|long.range|questions to ask)\b"),
    ("SVA", r"(\bsva\b|assert(ion)?s?\b|\bproperty\b|\|->|\|=>|\$rose|\$fell|\$stable|\$past|vacuous|disable iff)"),
    ("SV Constraints", r"(constraint|randomi[sz]|\brandc?\b|solve\s+before|\bdist\b|\bsoft\b|std::randomize|sudoku)"),
    ("UVM", r"(\buvm|sequencer|sequence.?item|virtual sequence|\bfactory|config_db|objection|\btlm\b|\bral\b|register model|p_sequencer|m_sequencer|callback|subscriber|scoreboard|\bagent|\bdriver\b|\bmonitor\b|phase|run_test|item_done|get_next_item)"),
    ("Protocols", r"\b(axi|apb|ahb|i2c|spi|pcie|uart|amba|wstrb|axi-stream)\b"),
    ("CDC & Timing", r"(\bcdc\b|clock domain|metastab|synchroni[sz]er|gray|async(hronous)? fifo|\bsetup\b|\bhold\b|slack|\bsta\b|skew|jitter|timing|false path|multi.?cycle|mtbf|recovery|removal)"),
    ("Digital Design", r"(fifo|\bfsm\b|state machine|detector|counter|divid|arbiter|\bmux|adder|latch|flip.?flop|\bdff\b|encoder|decoder|\brtl\b|glitch|clock gat|parity|multiplier|pipeline stage|skid|edge detect|除頻|電路)"),
    ("Coding & Scripting", r"(python|c\+\+|\bc:|perl|script|regex|linked list|string|algorithm|leetcode|fibonacci|\bsort|hash|log file|\blog\b|parse|pointer|memcpy|two.sum|kadane|popcount|reverse|subarray|substring|interval|palindrome|anagram|duplicat)"),
    ("Computer Architecture", r"(cache|hazard|branch predict|\btlb\b|coherenc|moesi|\bmesi\b|\bcpu\b|dram|virtual memory|interrupt|\bisa\b|pipelin)"),
    ("SystemVerilog", r"(systemverilog|\bsv\b|verilog|fork|join|\bclass|virtual|polymorph|mailbox|semaphore|queue|associative|dynamic array|interface|clocking block|\btask|function|blocking|casez|casex|\$cast|\boop\b|covergroup|coverpoint|\$display|\$strobe)"),
    ("Verification Planning", r"(verify|verification|test ?plan|coverage|regression|debug|sign.?off|testbench|reference model|formal|emulation|x-prop|gate.level)"),
    ("Circuits & Analog", r"(cmos|nmos|pmos|transistor|inverter|sram|spice|analog|current mirror|electromigration|\brc\b|filter|logical effort|ir.drop|antenna)"),
]


def guess_category(title: str, body: str = "") -> str:
    hay = (title + " " + title + " " + body[:300]).lower()
    for cat, rx in CATEGORY_RULES:
        if re.search(rx, title.lower()):
            return cat
    for cat, rx in CATEGORY_RULES:
        if re.search(rx, hay):
            return cat
    return "General"


CODING_RX = re.compile(
    r"\b(write|implement|code|coding|design a|design an|design the|create a|build a|"
    r"generate|rtl:|draw|calculate|compute|fix|spot the bug|find the bug|trace)\b",
    re.I,
)


def guess_type(title: str, category: str) -> str:
    if category == "Behavioral":
        return "behavioral"
    return "coding" if CODING_RX.search(title) else "concept"


def guess_language(title: str, body: str, qtype: str) -> str:
    if qtype != "coding":
        return "text"
    t = (title + " " + body[:600]).lower()
    if "python" in t:
        return "python"
    if "c++" in t or "cpp" in t or re.search(r"\bc:\s", t):
        return "cpp"
    return "systemverilog"


HARD_RX = re.compile(
    r"(scoreboard|out.of.order|async(hronous)? fifo|arbiter|virtual sequence|\bral\b|register model|"
    r"testbench|reference model|formal|deadlock|coheren|systolic|router|\bdma\b|credit|interleav|"
    r"reorder|sudoku|non.overlapping|segment tree|allocator|full implementation|complete|end.to.end|"
    r"multi.?channel|layered|pipelined|cdc|skid|axi.*driver|driver.*axi|glitch.free|mtbf)", re.I)
EASY_RX = re.compile(
    r"^(what is|what are|what's|what does|define|difference|differences|why do|why is|why are|is it|is |are |can |"
    r"list|name|explain the difference|how many|which )", re.I)


def guess_difficulty(title: str, qtype: str, hint: str | None = None) -> str:
    if hint:
        return hint
    if HARD_RX.search(title):
        return "Hard"
    if qtype == "behavioral":
        return "Medium"
    if qtype != "coding" and (EASY_RX.search(title) or " vs" in title.lower() or "versus" in title.lower()):
        return "Easy"
    return "Medium"


QUESTIONS: list[dict] = []
SEEN: set[str] = set()


def norm_key(title: str) -> str:
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "", title.lower())[:80]


def add(source_id, source_name, title, answer="", prompt="", category=None,
        difficulty=None, qtype=None, language=None, tags=None, url=None, solution=""):
    title = clean_title(title)
    if len(title) < 4:
        return
    answer = clean_md(answer)
    prompt = clean_md(prompt)
    cat = category or guess_category(title, prompt + answer)
    qt = qtype or guess_type(title, cat)
    lang = language or guess_language(title, prompt + answer, qt)
    key = norm_key(title)
    if key in SEEN:
        # Same question from another source: keep the first copy, but borrow
        # an illustrated solution if the first copy has none.
        if solution:
            for q in QUESTIONS:
                if norm_key(q["title"]) == key and not q["solution"]:
                    q["solution"] = solution.strip()
                    break
        return
    SEEN.add(key)
    n = sum(1 for q in QUESTIONS if q["source"]["id"] == source_id) + 1
    QUESTIONS.append({
        "id": f"{source_id}-{n:03d}",
        "title": title,
        "prompt": prompt,
        "answer": answer,
        "solution": (solution or "").strip(),
        "category": cat,
        "difficulty": guess_difficulty(title, qt, difficulty),
        "type": qt,
        "language": lang,
        "tags": tags or [],
        "source": {"id": source_id, "name": source_name, "url": url or WB_URL},
    })


def read(name: str) -> str:
    return strip_line_numbers((SRC / name).read_text(encoding="utf-8"))


# ---------------------------------------------------------------- parsers

def parse_headings(text, level, source_id, source_name, *, stop=None,
                   start=None, category=None, url=None, diff_by_h2=None,
                   title_filter=None):
    """Split on headings of exactly `level` hashes. Body runs to the next
    heading of the same or higher level."""
    lines = text.splitlines()
    cur_h2 = None
    cur = None
    body: list[str] = []
    active = start is None

    def flush():
        if cur and active_flag[0]:
            hint = diff_by_h2.get(cur_h2) if diff_by_h2 and cur_h2 else None
            if title_filter is None or title_filter(cur):
                add(source_id, source_name, cur, answer="\n".join(body),
                    category=category, difficulty=hint, url=url)

    active_flag = [active]
    for ln in lines:
        m = re.match(r"^(#{1,6})\s+(.*)$", ln)
        if m:
            depth = len(m.group(1))
            htxt = m.group(2)
            if depth <= level:
                flush()
                cur, body = None, []
                if start and re.search(start, htxt):
                    active_flag[0] = True
                if stop and re.search(stop, htxt):
                    active_flag[0] = False
                if depth == 2:
                    cur_h2 = clean_title(htxt)
                if depth == level:
                    cur = htxt
                continue
        if cur is not None:
            body.append(ln)
    flush()


def parse_tongxin(text, source_id, source_name):
    category = None
    cur, body = None, []

    def flush():
        if cur:
            add(source_id, source_name, cur, answer="\n".join(body), category=category)

    for ln in text.splitlines():
        m = re.match(r"^@category:\s*(.+)$", ln)
        if m:
            flush(); cur, body = None, []
            category = m.group(1).strip()
            continue
        if ln.startswith("# DV answers"):
            flush(); cur, body = None, []
            category = None
            continue
        m = re.match(r"^- \*\*\d+\.\s*(.+?)\*\*\s*$", ln)
        if m:
            flush()
            cur, body = m.group(1), []
            if re.search(r"missing|not visible", cur, re.I):
                cur = None
            continue
        if cur is not None:
            body.append(re.sub(r"^\s{2}- ", "", ln))
    flush()


def parse_hw_bank(text, source_id, source_name, url):
    """'+ ## Section' headers, '  - question' bullets, '    **Answer.** ...'."""
    section = None
    cur, body = None, []

    def flush():
        if cur:
            is_algorithm = "https://leetcode.com/problems/" in cur
            add(source_id, source_name, cur, answer="\n".join(body), url=url,
                tags=[section] if section else [],
                category="Coding & Scripting" if is_algorithm else None,
                qtype="coding" if is_algorithm else None,
                language="python" if is_algorithm else None)

    for ln in text.splitlines():
        m = re.match(r"^\+?\s*## (.+)$", ln)
        if m:
            flush(); cur, body = None, []
            section = clean_title(m.group(1))
            continue
        if re.match(r"^\s*###\s", ln):  # sub-heading: ends the current question
            flush(); cur, body = None, []
            continue
        m = re.match(r"^  - (.+)$", ln)
        if m and section:
            flush()
            cur, body = m.group(1), []
            continue
        if cur is not None:
            body.append(ln[4:] if ln.startswith("    ") else ln)
    flush()


def parse_numbered(text, source_id, source_name, *, category=None, url=None,
                   keep_answer=True):
    """Top-level numbered items '1. **Title**: detail' / '1. question'."""
    cur, body = None, []

    def flush():
        if cur:
            add(source_id, source_name, cur, answer="\n".join(body) if keep_answer else "",
                category=category, url=url)

    for ln in text.splitlines():
        m = re.match(r"^(\d+)\s*[.、]\s*(.+)$", ln)
        if m:
            flush()
            t = m.group(2)
            b = re.match(r"^\*\*(.+?)\*\*\s*[：:→]?\s*(.*)$", t)
            if b:
                cur, body = b.group(1), [b.group(2)] if b.group(2) else []
            else:
                cur, body = t, []
            continue
        if re.match(r"^#{1,6} ", ln):
            flush(); cur, body = None, []
            continue
        if cur is not None and ln.startswith((" ", "\t", "-", "`")):
            body.append(ln.strip())
    flush()


def whiteboard_cards():
    """Yield (title, body) for each card embedded in whiteboard.md."""
    text = (SRC / "whiteboard.md").read_text(encoding="utf-8")
    parts = re.split(r'^\s*(?:card|pdfCard) "([^"]+)" \[[^\]]+\][^\n]*$', text, flags=re.M)
    for i in range(1, len(parts), 2):
        body = parts[i + 1]
        body = re.split(r'^section "', body, flags=re.M)[0]
        yield parts[i], strip_line_numbers(re.sub(r"^ {4}", "", body, flags=re.M))


# ---------------------------------------------------------------- sources

def build():
    # Full cards saved from Heptabase
    parse_headings(read("VLSIVerify_Interview_Question.md"), 3, "vlsiverify",
                   "VLSI Verify – UVM Interview Questions",
                   url="https://vlsiverify.com/interview-questions/uvm-interview-questions/",
                   diff_by_h2={"Basic Level Questions": "Easy",
                               "Intermediate Level Questions": "Medium",
                               "Difficult Level Questions": "Hard"})
    parse_headings(read("The_Art_of_Verification_UVM_Interview_Questions.md"), 3,
                   "artofverif", "The Art of Verification – UVM Interview Questions",
                   stop=r"Quick reference", url="https://theartofverification.com/uvm-interview-questions/")
    parse_hw_bank(read("Design_Verification_interview_question_bank___Hard.md"), "hwinterview",
                  "Hardware Interview – DV Question Bank", "https://www.hardware-interview.com/study")
    parse_headings(read("Design_Verification_Interview_Template_Handbook.md"), 2, "dvhandbook",
                   "DV Interview Template Handbook",
                   title_filter=lambda t: bool(re.match(r"\d+\.", t)))
    for f in sorted(SRC.glob("tongxin_*.md")):
        parse_tongxin(read(f.name), "tongxin", "TongXinTongXing DV Question Bank")

    # Cards embedded in the whiteboard export
    for title, body in whiteboard_cards():
        if title.startswith("UVM Interview Questions Set"):
            parse_headings(body, 2, "chipverify", "ChipVerify – " + title,
                           category="UVM", url="https://chipverify.com/uvm/uvm-interview-questions-set-1")
        elif title.startswith("NVIDIA Hardware Design Verification 面經"):
            parse_numbered(body, "nv2020", "NVIDIA HW DV 面經 (1point3acres, 2020)")
        elif title.startswith("NVIDIA Design Verification (GPU)"):
            parse_numbered(body, "nv2024", "NVIDIA GPU DV 面經 (1point3acres, 2024)")
        elif title.startswith("UVM base classes"):
            parse_numbered(body, "linkedin-uvm", "UVM base classes – experienced-level (LinkedIn)",
                           category="UVM")
        elif title == "SV Assertion Scenarios QnA":
            parse_numbered(body, "sva-scen", "SV Assertion Scenarios QnA (PDF)", category="SVA",
                           keep_answer=False)

    # Hand-curated questions
    for f in sorted(MANUAL.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"skipping {f.name}: {e}")
            continue
        src = data["source"]
        for q in data["questions"]:
            add(src["id"], src["name"], q["title"], answer=q.get("answer", ""),
                prompt=q.get("prompt", ""), category=q.get("category") or src.get("category"),
                difficulty=q.get("difficulty"), qtype=q.get("type") or src.get("type"),
                language=q.get("language"), tags=q.get("tags"), url=src.get("url"),
                solution=q.get("solution", ""))

    # Illustrated solutions written for the auto-extracted questions
    by_id = {q["id"]: q for q in QUESTIONS}
    for f in sorted(SOLUTIONS.glob("*.json")):
        try:
            sols = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"skipping {f.name}: {e}")
            continue
        for qid, md in sols.items():
            if qid in by_id and isinstance(md, str) and md.strip():
                by_id[qid]["solution"] = md.strip()


if __name__ == "__main__":
    build()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(QUESTIONS, ensure_ascii=False, indent=1), encoding="utf-8")
    from collections import Counter
    print(len(QUESTIONS), "questions")
    print(Counter(q["source"]["id"] for q in QUESTIONS))
    print(Counter(q["category"] for q in QUESTIONS))
    print(Counter(q["type"] for q in QUESTIONS))
    print(sum(1 for q in QUESTIONS if q["solution"]), "with illustrated solutions")
