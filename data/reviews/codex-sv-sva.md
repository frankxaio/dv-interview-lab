# Review: data/solutions/codex-sv-sva.json

Reviewer: Claude (senior design-verification review). Date: 2026-10-16.

## Overall verdict

**High quality and technically sound.** I checked all 67 entries against their questions in
`data/questions.json`. The entries cover SystemVerilog, constraints, OOP, processes and SVA. I checked each
one against IEEE 1800-2017 semantics: overlapping and non-overlapping implication, ranged delays,
`$rose`/`$fell`/`$past`/`$stable`/`$changed` sampling, `disable iff`, `until`/`until_with`, `strong`,
`first_match`, vacuity, `soft`, `unique`, `constraint_mode`, `post_randomize`, `$cast`, `ref` handles,
fork/join variants, `wait fork`, `disable fork`, mailboxes, `$strobe`/`$monitor`, streaming operators and
clocking blocks.

Every code block was compiled with VCS 2022.06. Every temporal claim that mattered was simulated against
passing and failing traces, and the failure cycles matched the tables in the solutions. I found **one real
error**: the WaveDrom trace in `tongxin-151` breaks the solution's own first APB assertion. I fixed it. No
other entry needed a change.

None of the 67 questions is in Chinese, so the English answers are correct and no language fix was needed.

`python3 scripts/check_solutions.py data/solutions/codex-sv-sva.json` → 67 entries, 0 errors, 0 warnings.
The JSON was rewritten with the file's original 2-space indentation and trailing newline, so the diff
covers only the `tongxin-151` line.

## Entries changed

| id | Problem | Fix | Evidence |
|---|---|---|---|
| tongxin-151 (APB PSEL → PENABLE → PREADY) | The WaveDrom PSEL wave `01...0` keeps PSEL high for one sample after the completing access while PENABLE is low. That sample is a new **setup** phase (PSEL && !PENABLE). The solution's first assertion then requires access on the next sample, but PSEL drops there. So the waveform shown as legal fails the answer's own property. | PSEL wave changed to `01..0.`, so PSEL drops together with PENABLE after the completing access. Added one sentence under the waveform that names samples 1–3 (setup, wait, complete) and explains why holding PSEL high with PENABLE low would start a new transfer. Assertions and text are unchanged. | VCS simulation of the three assertions. The original trace fails P0 at sample 5 (`t151orig P0 FAIL at cycle 5`). The corrected trace passes all three assertions. |

## Verification performed (all in /tmp/claude-35304/review-svsva/)

| Area / ids | What was run | Result |
|---|---|---|
| Constraints: tongxin-136, 137, 138, 139, 140, 141, 142, 143, 144, 168 | All classes compiled. Each was randomized 50× with independent checks: uniqueness, sum == 20, rotations excluded, popcount == 4, no all-1 3×3 window over all 25 windows, R<3 instance solvable, child `range_c` override, `constraint_mode(0)` + inline x==25, soft default 5 overridden by inline 8, post_randomize alternation and shuffle | All pass. Rotation table row `10000001 → 11000000` reproduced. |
| OOP: tongxin-169, 170, 172, 173; UVM tongxin-171 | Compiled and ran. A failed `$cast` leaves the destination unchanged (old payload 42 still visible). Singleton `get()` returns the same handle. Pass by value vs `ref` gives a.x = 7 and then 42. The UVM sequence compiled with `-ntb_opts uvm-1.2` and a stub `my_item`. | As stated |
| Processes: tongxin-167, 178, 179, 180 | Simulated | Worker wins at 3 ns and the timeout is killed. Captured values are 0, 1, 2. `wait fork` returns at 5 ns. Mailbox two-of-three fires at 3 ns and the third worker finishes at 5 ns. |
| tongxin-163 print tasks | Simulated | display q=0, strobe q=1, monitor q=0 and then q=1, `prefix: message` |
| tongxin-165 streaming | Simulated | flat 11223344, `{<<8{a}}` 44332211, `{>>{a}}` 11223344, a[3] == 8'h11 |
| tongxin-154 helper | Simulated | 0x3f0 / 4×4 fits, 0x3f4 / 4×4 does not |
| tongxin-161, 162, 164, 166, 174, 175, 176, 177, 160 | Compiled; 166 and 174 simulated | Scoreboard empties correctly. The edge detector suppresses the first sample and flags rise and fall correctly. The cross with a transition bin is accepted by VCS. The clocking-block interface compiles. |
| Glitch checker: tongxin-146, 158, sva-scen-018 | Timed stimulus | 2.4 ns pulse fails, 2.5 ns and 3 ns pass |
| Period checker: tongxin-149, 155; async: tongxin-150 | Timed clock | 10.0 and 10.5 ns pass (boundary holds in floating point), 10.6 fails, 9.5 passes, 9.4 fails. The tongxin-150 snapshot policy compares each interval with the value captured at its start. |
| SVA traces: tongxin-145, 147, 148, 152, 153, 156, 157, 159; sva-scen-009, 010, 013, 015, 016, 017, 019, 021 | Generated testbenches, signals driven on negedge, failure cycle printed | Every pass and fail matches the solution tables. Examples: the 148 exact form rejects 5 dogs and both forms reject 2. 156: X→0 does trigger `$fell` (confirms the claim). 015: the `first_match` variant fails while the plain variant passes on an early ack without done. 016: a 6-sample reset passes and a 3-sample reset fails. 019: the history guard exempts the first 3 samples. |
| Operator precedence (sva-scen-007 follow-up, sva-scen-016) | `a \|=> !a[*2]` simulated | Parsed as `(!a)[*2]` as intended |
| sva-scen-001 / 004 / 022 boundaries | Extra traces | 001: 6 highs pass, 7 fail. 004: grant at +5 passes, +6 fails. 022: c first with d=1 fails, a b/c tie fails, b first with d=1 passes, c first with d=0 passes. An unresolved `strong(...)` fails at end of simulation. |
| sva-scen-002, 003, 005, 006, 008, 011, 012, 014, 020 | Compiled in one module | OK (logic is direct, and no cycle table disagrees with the code) |
| `scripts/check_sva_examples.py` | Ran (TMPDIR in the review dir) | 4/4 PASS (001: 2 failures, 004: 1, 007: 1, 022: 1) |
| `scripts/check_sv_types.sv` | Ran | PASS |

## Minor issues left alone (not errors)

- tongxin-149's solution is word-for-word the same as tongxin-155 (100 MHz). Its sentence "for the 100 MHz question … no tolerance was given; this example explicitly chooses ±5%" reads oddly under a question that does state 5%. The checker itself is correct for both questions.
- tongxin-146 and tongxin-158 are identical, and sva-scen-018 uses the same checker. This is fine because the questions are duplicates.
- Diagnostics print a realtime difference with `%0t`. VCS shows it in precision units (e.g. "2400" for 2.4 ns) with no unit suffix. This is correct but not very readable.
- tongxin-140 reads "no cyclic right shift" as "not a rotation of a supplied reference", which is a reasonable choice. The title is ambiguous, and the solution says which interpretation it uses.
- tongxin-162 says a function cannot call a *time-consuming* task. IEEE 1800 is stricter: a function cannot enable any task except from inside `fork…join_none`. The statement is incomplete rather than wrong.
- The SVA scenario answers use cycle tables instead of WaveDrom. The guide prefers WaveDrom for SVA but does not require it, and the tables are correct.
- Several sva-scen entries repeat the same boilerplate paragraph about the clock, reset and X policy. It is wordy but accurate.

## Problems in the Codex check scripts

`scripts/check_sva_examples.py` (passes, but the check is weak):
1. It only compares the **number** of failures with an expected count. It does not check *when* a failure happens or which attempt failed. A wrong assertion that fails the same number of times at different cycles would still pass.
2. Boundaries are not covered. In 001 the maximum is never tested: `[*2:7]` would also pass because the long pulse is 8 cycles. In 004 the upper edge of the window is never tested: `##[2:6]` would also pass. I tested both boundaries by hand (see above).
3. In 022 only "b first with d wrong" is a negative case. "c first with d=1", the b/c tie policy and the `strong` end-of-simulation failure are not exercised. I tested all three by hand.
4. Only the first `assert property` in the first code block is tested. Cover properties and alternatives are ignored.
5. It creates its work directory with `tempfile.mkdtemp` in the system temp directory, ignores the project's scratch conventions unless TMPDIR is set, and never deletes the logs. It needs `vcs` already on PATH and does not source the site setup script.

`scripts/check_sv_types.sv`: correct and passes. It is limited, though. It checks the default value only for `int` and `integer`, and it does not cover `reg`, `time` or `shortint` defaults. It is also not referenced by any solution entry.

## What I could not verify

- The external reference link in tongxin-156 (an Accellera SVA 3.1a manual on eecs.umich.edu) was not fetched. The `$fell` X→0 claim it supports was confirmed in VCS.
- Statements about other simulators: everything was checked on VCS 2022.06 only. For example, Questa or Xcelium might treat a cross that contains a transition bin (tongxin-176) differently.
- tongxin-145 and tongxin-171 say the original property or code was not supplied. I could not check them against source material that does not exist. The illustrative replacements are correct.
- I did not run formal tools, so liveness and fairness remarks (sva-scen-014, sva-scen-020) were reviewed by reading only.
