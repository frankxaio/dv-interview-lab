#!/usr/bin/env python3
"""Validate a solutions or manual-set JSON file.

  python3 scripts/check_solutions.py data/solutions/foo.json [more files...]

Checks: valid JSON, every ```wavedrom block is strict JSON with a "signal" list,
every ```mermaid block starts with a known diagram type, every solution has at
least one illustration (mermaid, wavedrom, table, or code block).
Exit status 1 if any error is found.
"""
import json
import re
import sys

FENCE = re.compile(r"```(\w+)[^\n]*\n(.*?)```", re.S)
MERMAID_TYPES = ("flowchart", "graph", "stateDiagram", "sequenceDiagram", "classDiagram",
                 "erDiagram", "gantt", "pie", "timeline", "mindmap", "block-beta", "journey")


def check_md(where, md, errors, warnings):
    illus = False
    for lang, body in FENCE.findall(md):
        lang = lang.lower()
        if lang == "wavedrom":
            illus = True
            try:
                obj = json.loads(body)
                if not isinstance(obj.get("signal"), list):
                    errors.append(f"{where}: wavedrom has no 'signal' list")
            except Exception as e:  # noqa: BLE001
                errors.append(f"{where}: wavedrom is not strict JSON ({e})")
        elif lang == "mermaid":
            illus = True
            first = body.strip().splitlines()[0].strip() if body.strip() else ""
            if not first.startswith(MERMAID_TYPES):
                errors.append(f"{where}: mermaid block starts with unknown type: {first[:40]!r}")
            if re.search(r"(?<!<)<(?!br\s*/?>)[a-zA-Z][^<>]*>(?!>)", body):
                warnings.append(f"{where}: mermaid block contains HTML other than <br/>")
        else:
            illus = True
    if re.search(r"^\|.+\|\s*$\n^\|[\s:|-]+\|\s*$", md, re.M):
        illus = True
    if not illus:
        warnings.append(f"{where}: no illustration (diagram, waveform, table or code)")


def main(paths):
    errors, warnings = [], []
    for p in paths:
        try:
            data = json.load(open(p, encoding="utf-8"))
        except Exception as e:  # noqa: BLE001
            errors.append(f"{p}: invalid JSON ({e})")
            continue
        if isinstance(data, dict) and "questions" in data:
            for i, q in enumerate(data["questions"]):
                if not q.get("title"):
                    errors.append(f"{p}[{i}]: missing title")
                if not q.get("solution"):
                    errors.append(f"{p}[{i}] {q.get('title','')[:40]}: missing solution")
                else:
                    check_md(f"{p}[{i}]", q["solution"], errors, warnings)
            n = len(data["questions"])
        elif isinstance(data, dict):
            for k, v in data.items():
                if not isinstance(v, str) or not v.strip():
                    errors.append(f"{p}:{k}: empty solution")
                else:
                    check_md(f"{p}:{k}", v, errors, warnings)
            n = len(data)
        else:
            errors.append(f"{p}: unexpected top-level type")
            n = 0
        print(f"{p}: {n} entries")
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{len(errors)} error(s), {len(warnings)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
