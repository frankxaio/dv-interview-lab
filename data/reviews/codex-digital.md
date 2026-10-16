# Review: data/solutions/codex-digital.json

Reviewer: Claude (senior ASIC design/verification review). Date: 2026-10-16.

## Overall verdict

**High quality and technically sound.** I checked all 69 entries against their questions in
`data/questions.json`. All digital-logic, timing, FIFO/CDC, arithmetic and FSM content I could check is
correct. Every worked number was recomputed by hand or in a script. Every HDL module was compiled with VCS
2022.06 and every non-trivial module was simulated with a testbench. No RTL bug, wrong waveform,
wrong state table or bad calculation was found.

I changed **one** entry (`tongxin-046`). It did not give the SDC constraint that the question asked for.
None of the 69 questions is in Chinese, so the English answers are correct and no language fix was needed.

`python3 scripts/check_solutions.py data/solutions/codex-digital.json` → 69 entries, 0 errors, 0 warnings.
The JSON was rewritten with the file's original 2-space indentation, so the diff covers only line 7
(`tongxin-046`).

## Entries changed

| id | Problem | Fix | Evidence |
|---|---|---|---|
| tongxin-046 (Async FIFO Gray Code SDC Constraint) | The question asks for the SDC constraint, but the answer never showed one. It described the idea ("max-delay and/or bus-skew mechanism") and ended with "exact command syntax ... absent here". An interviewer expects the actual commands. | Added a short example for the write-pointer crossing. It uses the bound min(src,dst period). It shows a Synopsys-style `set_max_delay` from the Gray register to sync stage 1, with a warning that `set_false_path` and `set_clock_groups -asynchronous` take precedence and must not cover these paths. It also shows the Vivado `set_max_delay -datapath_only` plus `set_bus_skew` pair, the same pattern the XPM CDC Gray macros use. The last pitfall sentence now says the commands are a template. | Constraint semantics and precedence follow Synopsys/AMD documentation (UG903 bus-skew section, already cited in the question's source notes). Wording elsewhere was kept. |

## Verification performed (all in /tmp/claude-35304/review-digital/)

| id | Code | Check | Result |
|---|---|---|---|
| tongxin-041 | divide2 | sim | Q toggles 1,0,1,0 as in table |
| tongxin-044 | sort4 (1024-bit) | 20k random vectors incl. table example, sortedness + multiset | 0 errors; example → 1,2,7,9 |
| tongxin-045 | sat_mac8 | **exhaustive** 2^24 (a,b,c) vs integer model | 0 errors |
| tongxin-048 | div5_stream | 2000 random MSB-first streams with valid gaps/clear | 0 errors; transition table recomputed |
| tongxin-053 | factored_mac | 70k random + extremes (-128·-128 etc.), 2-edge latency | 0 errors; 17-bit width sufficient |
| tongxin-057 | tristate_pin | truth table | Z/0/1 as stated |
| tongxin-058 | sync_level | sim | 2-flop latency |
| tongxin-059 | gray_convert | exhaustive round-trip + single-bit adjacency incl. wrap | 0 errors |
| tongxin-065 | elastic (ready/valid buffer) | 20k cycles random stalls; scoreboard + stall-stability check | 0 errors, 7787 transfers |
| tongxin-066 | storage_examples | latch transparency/hold, FF edge | as stated |
| tongxin-067 | comb_example | all 4 cases | matches table |
| tongxin-068 | blocking vs NBA snippet (wrapped) | table scenario | blk 0,0,0/1,1,1/1,1,1; NBA 0,0,0/1,0,0/0,1,0 = table |
| tongxin-070 | priority128 | 20k random vs `req & -req` | 0 errors |
| tongxin-073 | and_using_mux | exhaustive | 0 errors |
| tongxin-074/075/076/089 | standalone demo modules | compile + run | outputs as described (`value=5`, `specialized`, `elapsed_ns=1.250`) |
| tongxin-077 | powered_dff_model | table scenario | 1 → X → X → sample, matches table |
| tongxin-078 | icg_behavior | 2000 random async enable changes | no truncated gated-clock pulses (only the t=0 X→0 init artifact) |
| tongxin-079 | voting | exhaustive 16 | 0 errors |
| tongxin-085 | pipeline3 | table scenario | 7,0,0 / 9,7,0 / 4,9,7 = table |
| tongxin-086 | error_window | windows with error at edge 1, edge 64, none, on trigger edge | done at edge 64; edges 1..64 counted, trigger edge excluded, as stated |
| tongxin-087 | C++ set/clear bit | g++ -std=c++17 -Wall, asserts | pass |
| tongxin-043 | dual detector table | Python suffix-automaton recomputation | identical to table |
| tongxin-065, tongxin-337 | WaveDrom | equal wave lengths, cycle-by-cycle vs text | consistent (6/6/6/6 and 8/8/8) |

Hand-checked numbers that were all correct: setup/hold worked example (740 ps ≈ 1.35 GHz; 30 ps hold
shortfall), 4×4 array multiplier (16 AND, 8 FA, 4 HA, rebuilt row by row), Booth recoding of 0111,
cache split (128 sets, [5:0]/[12:6]/[31:13]), SRAM power example (30/56 µW, 120/110 µW), ring
oscillator (5 GHz), logical effort (F=81 → f=3, sizes 1/3/9/27), NAND2 LE 4/3, RC filter (1.59 kHz,
220 µs), Black's equation (¼ lifetime at 2×J, n=2), depth-6 Gray wrap (3 bits change), 1011 overlap
positions 4 and 7, vending FSM credit transitions, 9-stone weighing bound.

## Minor issues noted but not changed

- tongxin-041: "For power gating of a clock tree, use an approved integrated clock-gating cell". This
  loosely mixes *power gating* (supply shutoff) with *clock gating*. The rest of the paragraph makes the
  meaning clear.
- tongxin-044: VCS gives benign `TBIFASL` warnings ("task body won't affect sensitivity list") because
  `cas` is a task called from `always_comb`. The task uses only its arguments, so behaviour is correct.
  A `function`/`void function` would be more idiomatic.
- tongxin-043 / tongxin-088: the FSMs are shown as transition tables or Mermaid with no RTL. This is
  acceptable for concept-type questions.
- tongxin-059: "Check one-hot changes" means "a single bit changes per increment". The phrasing is slightly
  loose.
- Some questions are filed under odd categories in `questions.json` (e.g. tristate → UVM, voting →
  CDC & Timing). This is outside this file's scope.
- Several entries (tongxin-082, 333, 335, 337, 340, 342, 343, 345) correctly say that the original
  schematic or figure is missing and give method-level answers. This is the honest choice and was kept.

## Could not verify

- Transistor-level/analog claims (latchup, cascode mirror, pass-gate chain, VTC, 6T SRAM SNM, EM,
  pulse-latch timing, tsu/tcq characterization, level shifting). I checked them against standard
  textbook theory only. No SPICE runs were done.
- Tool-specific constraint behaviour (tongxin-046 exception precedence, tongxin-050
  `create_generated_clock`). I checked the syntax and semantics against tool documentation from memory.
  No DC/PrimeTime/Vivado run was done.
- Reference links: 6 of 7 returned HTTP 200. The Intel FPGA link in tongxin-046 returned 403 to a
  scripted request (likely bot blocking), so its content was not checked.
- Cache-coherence (MESI/MOESI) and interrupt answers are protocol-generic. They are correct at the
  stable-state level, but no specific implementation applies.
